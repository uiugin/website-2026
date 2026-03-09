using System.Globalization;
using System.IO;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;
using Umbraco.Extensions;
using UIUG.Web.Options;

namespace UIUG.Web.Services.MeetupImport;

public class MeetupImportService : IMeetupImportService
{
    private readonly IOptionsSnapshot<MeetupImportOptions> _options;
    private readonly IContentService _contentService;
    private readonly IMediaService _mediaService;
    private readonly MediaFileManager _mediaFileManager;
    private readonly MediaUrlGeneratorCollection _mediaUrlGeneratorCollection;
    private readonly IShortStringHelper _shortStringHelper;
    private readonly IContentTypeBaseServiceProvider _contentTypeBaseServiceProvider;
    private readonly ILogger<MeetupImportService> _logger;

    public MeetupImportService(
        IOptionsSnapshot<MeetupImportOptions> options,
        IContentService contentService,
        IMediaService mediaService,
        MediaFileManager mediaFileManager,
        MediaUrlGeneratorCollection mediaUrlGeneratorCollection,
        IShortStringHelper shortStringHelper,
        IContentTypeBaseServiceProvider contentTypeBaseServiceProvider,
        ILogger<MeetupImportService> logger)
    {
        _options = options;
        _contentService = contentService;
        _mediaService = mediaService;
        _mediaFileManager = mediaFileManager;
        _mediaUrlGeneratorCollection = mediaUrlGeneratorCollection;
        _shortStringHelper = shortStringHelper;
        _contentTypeBaseServiceProvider = contentTypeBaseServiceProvider;
        _logger = logger;
    }

    public async Task<MeetupImportResult> ImportAsync(CancellationToken cancellationToken = default)
    {
        var result = new MeetupImportResult();
        var warnings = new List<string>();

        var opts = _options.Value;
        if (string.IsNullOrWhiteSpace(opts.EventsJsonPath))
        {
            result.Success = false;
            result.Error = "MeetupImport:EventsJsonPath is not set.";
            return result;
        }
        if (string.IsNullOrWhiteSpace(opts.ImagesFolderPath))
        {
            result.Success = false;
            result.Error = "MeetupImport:ImagesFolderPath is not set.";
            return result;
        }

        var jsonPath = Path.IsPathRooted(opts.EventsJsonPath)
            ? opts.EventsJsonPath
            : Path.GetFullPath(opts.EventsJsonPath);
        var imagesPath = Path.IsPathRooted(opts.ImagesFolderPath)
            ? opts.ImagesFolderPath
            : Path.GetFullPath(opts.ImagesFolderPath);

        if (!System.IO.File.Exists(jsonPath))
        {
            result.Success = false;
            result.Error = $"Events JSON file not found: {jsonPath}";
            return result;
        }
        if (!Directory.Exists(imagesPath))
        {
            result.Success = false;
            result.Error = $"Images folder not found: {imagesPath}";
            return result;
        }

        List<MeetupEventDto> events;
        try
        {
            var json = await System.IO.File.ReadAllTextAsync(jsonPath, cancellationToken);
            events = await DeserializeEventsAsync(json, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to read or deserialize events JSON");
            result.Success = false;
            result.Error = $"Failed to read JSON: {ex.Message}";
            return result;
        }

        if (events.Count == 0)
        {
            result.Success = true;
            result.Warnings = new[] { "No events in JSON." };
            return result;
        }

        // Resolve parent nodes
        var eventsParent = ResolveParent("events");
        var speakersParent = ResolveParent("speakers");
        var attendeesParent = ResolveParent("attendees");
        if (eventsParent == null)
        {
            result.Success = false;
            result.Error = "Content node with content type 'events' not found. In Umbraco Backoffice: Content → create a node at the root (or under your home page) with document type 'Events' (alias: events). Same for 'Speakers' and 'Attendees'.";
            return result;
        }
        if (speakersParent == null)
        {
            result.Success = false;
            result.Error = "Content node with content type 'speakers' not found. In Umbraco Backoffice: Content → create a node at the root (or under your home page) with document type 'Speakers' (alias: speakers).";
            return result;
        }
        if (attendeesParent == null)
        {
            result.Success = false;
            result.Error = "Content node with content type 'attendees' not found. In Umbraco Backoffice: Content → create a node at the root (or under your home page) with document type 'Attendees' (alias: attendees).";
            return result;
        }

        try
        {
            // User ID for publish (audit trail). Per Umbraco docs: 0 = system user; or set MeetupImport:ImportUserId when 0 is not accepted.
            var userId = opts.ImportUserId ?? -1;

            // Media folder for imported images (reuse existing if present)
            var mediaRootId = Constants.System.Root;
            var meetupFolder = GetOrCreateMeetupImportFolder(mediaRootId);
            var meetupFolderId = meetupFolder.Id;

            // Map: image filename (lowercase) -> media key (Guid) for linking
            var imageToMediaKey = new Dictionary<string, Guid>(StringComparer.OrdinalIgnoreCase);

            // Collect unique speakers and attendees by name (one content node per name; referenced from multiple events)
            var speakersByName = new Dictionary<string, MeetupSpeakerDto>(StringComparer.OrdinalIgnoreCase);
            var attendeesByName = new Dictionary<string, MeetupAttendeeDto>(StringComparer.OrdinalIgnoreCase);
            foreach (var evt in events)
            {
                foreach (var s in GetSpeakersFromEvent(evt))
                {
                    var name = (s.Name ?? s.Id ?? "").Trim();
                    if (string.IsNullOrEmpty(name)) continue;
                    if (!speakersByName.ContainsKey(name)) speakersByName[name] = s;
                }
                foreach (var a in evt.Attendees ?? (IEnumerable<MeetupAttendeeDto>)Array.Empty<MeetupAttendeeDto>())
                {
                    var name = GetAttendeeName(a);
                    if (string.IsNullOrEmpty(name)) continue;
                    if (!attendeesByName.ContainsKey(name)) attendeesByName[name] = a;
                }
            }

            // Create media for speaker avatars and attendee photos
            foreach (var s in speakersByName.Values)
            {
                var filename = s.AvatarImage ?? s.AvatarImageUrl ?? s.Photo;
                if (string.IsNullOrWhiteSpace(filename)) continue;
                filename = Path.GetFileName(filename);
                if (imageToMediaKey.ContainsKey(filename)) continue;
                var fullPath = Path.Combine(imagesPath, filename);
                if (!System.IO.File.Exists(fullPath)) { warnings.Add($"Speaker image not found: {filename}"); continue; }
                var key = CreateImageMedia(fullPath, filename, meetupFolderId, imageToMediaKey);
                if (key.HasValue) imageToMediaKey[filename] = key.Value;
            }
            foreach (var a in attendeesByName.Values)
            {
                var imageRef = a.Photo ?? a.PhotoUrl ?? a.AttendeePhoto ?? a.Image;
                if (string.IsNullOrWhiteSpace(imageRef)) continue;
                var filename = GetFileNameFromImageRef(imageRef);
                if (imageToMediaKey.ContainsKey(filename)) continue;
                var fullPath = ResolveImagePath(imagesPath, imageRef, filename);
                if (fullPath == null || !System.IO.File.Exists(fullPath)) continue;
                var key = CreateImageMedia(fullPath, filename, meetupFolderId, imageToMediaKey);
                if (key.HasValue) imageToMediaKey[filename] = key.Value;
            }
            result.MediaCreated = imageToMediaKey.Count;

            // Create or reuse attendees (one per name; events reference them)
            var attendeeNameToContentKey = new Dictionary<string, Guid>(StringComparer.OrdinalIgnoreCase);
            foreach (var kv in attendeesByName)
            {
                var name = kv.Key;
                var a = kv.Value;
                var photoFilename = GetFileNameFromImageRef(a.Photo ?? a.PhotoUrl ?? a.AttendeePhoto ?? a.Image ?? "");
                Guid attendeeMediaKey = default;
                var hasMediaKey = !string.IsNullOrEmpty(photoFilename) && imageToMediaKey.TryGetValue(photoFilename, out attendeeMediaKey);

                var existing = FindChildByName(attendeesParent, name, "attendee");
                if (existing != null)
                {
                    attendeeNameToContentKey[name] = existing.Key;
                    if (hasMediaKey)
                    {
                        var existingContent = _contentService.GetById(existing.Key);
                        if (existingContent != null)
                        {
                            existingContent.SetValue("attendeePhoto", Udi.Create(Constants.UdiEntityType.Media, attendeeMediaKey).ToString());
                            _contentService.Save(existingContent);
                            _contentService.Publish(existingContent, new[] { "*" }, userId);
                        }
                    }
                    continue;
                }
                var content = _contentService.Create(name, attendeesParent.Key, "attendee");
                content.SetValue("attendeeName", name);
                if (hasMediaKey)
                    content.SetValue("attendeePhoto", Udi.Create(Constants.UdiEntityType.Media, attendeeMediaKey).ToString());
                _contentService.Save(content);
                var saveResult = _contentService.Publish(content, new[] { "*" }, userId);
                if (saveResult.Success)
                    attendeeNameToContentKey[name] = content.Key;
                else
                    warnings.Add($"Failed to save attendee '{name}'.");
            }
            result.AttendeesCreated = attendeeNameToContentKey.Count;
            _logger.LogInformation("Meetup import: {AttendeeCount} attendees in map (sample keys: {Sample})",
                attendeeNameToContentKey.Count,
                string.Join(", ", attendeeNameToContentKey.Keys.Take(5)));

            // Create or reuse speakers (one per name; events reference them)
            var speakerNameToContentKey = new Dictionary<string, Guid>(StringComparer.OrdinalIgnoreCase);
            foreach (var kv in speakersByName)
            {
                var name = kv.Key;
                var s = kv.Value;
                var existing = FindChildByName(speakersParent, name, "speaker");
                if (existing != null)
                {
                    speakerNameToContentKey[name] = existing.Key;
                    continue;
                }
                var content = _contentService.Create(name, speakersParent.Key, "speaker");
                content.SetValue("speakerName", name);
                content.SetValue("role", s.Role ?? "");
                content.SetValue("company", s.Company ?? "");
                content.SetValue("bio", s.Bio ?? "");
                content.SetValue("speakerType", s.SpeakerType ?? "Community");
                var avatarFilename = Path.GetFileName(s.AvatarImage ?? s.AvatarImageUrl ?? s.Photo ?? "");
                if (!string.IsNullOrEmpty(avatarFilename) && imageToMediaKey.TryGetValue(avatarFilename, out var mediaKey))
                {
                    content.SetValue("avatarImage", Udi.Create(Constants.UdiEntityType.Media, mediaKey).ToString());
                }
                _contentService.Save(content);
                var saveResult = _contentService.Publish(content, new[] { "*" }, userId);
                if (saveResult.Success)
                    speakerNameToContentKey[name] = content.Key;
                else
                    warnings.Add($"Failed to save speaker '{name}'.");
            }
            result.SpeakersCreated = speakerNameToContentKey.Count;
            _logger.LogInformation("Meetup import: {SpeakerCount} speakers in map (sample keys: {Sample})",
                speakerNameToContentKey.Count,
                string.Join(", ", speakerNameToContentKey.Keys.Take(5)));

            // Create or update events (match by title under events parent)
            foreach (var evt in events)
            {
                var title = (evt.Title ?? evt.Name ?? "Event").Trim();
                if (string.IsNullOrEmpty(title)) continue;

                var speakerUdis = new HashSet<string>(StringComparer.Ordinal);
                foreach (var s in GetSpeakersFromEvent(evt))
                {
                    var name = (s.Name ?? s.Id ?? "").Trim();
                    if (string.IsNullOrEmpty(name)) continue;
                    if (speakerNameToContentKey.TryGetValue(name, out var sk))
                        speakerUdis.Add(Udi.Create(Constants.UdiEntityType.Document, sk).ToString());
                }
                var attendeeUdis = new HashSet<string>(StringComparer.Ordinal);
                var attendeeNamesInEvent = evt.Attendees?.Count ?? 0;
                var attendeeNamesMatched = 0;
                foreach (var a in evt.Attendees ?? (IEnumerable<MeetupAttendeeDto>)Array.Empty<MeetupAttendeeDto>())
                {
                    var name = GetAttendeeName(a);
                    if (string.IsNullOrEmpty(name)) continue;
                    if (attendeeNameToContentKey.TryGetValue(name, out var ak))
                    {
                        attendeeUdis.Add(Udi.Create(Constants.UdiEntityType.Document, ak).ToString());
                        attendeeNamesMatched++;
                    }
                }

                IContent content;
                var existingEvent = FindChildByName(eventsParent, title, "event");
                if (existingEvent != null)
                {
                    content = _contentService.GetById(existingEvent.Key);
                    if (content == null) continue;
                }
                else
                {
                    content = _contentService.Create(title, eventsParent.Key, "event");
                }

                content.Name = title;
                content.SetValue("eventTitle", title);
                content.SetValue("briefSummary", evt.BriefSummary ?? evt.Description ?? "");
                content.SetValue("fullSummary", evt.FullSummary ?? evt.Description ?? "");
                content.SetValue("umbracoUrlName", Slug(title));

                // DateTimeWithTimeZone expects JSON: {"date":"<ISO8601>","timeZone":"<IANA>"}
                if (!string.IsNullOrWhiteSpace(evt.DateTime) && DateTimeOffset.TryParse(evt.DateTime, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var dt))
                {
                    var timeZoneId = dt.Offset == TimeSpan.Zero ? "UTC" : "UTC"; // Keep UTC; or map offset to IANA if needed
                    var dateJson = JsonSerializer.Serialize(new { date = dt.ToString("o"), timeZone = timeZoneId });
                    content.SetValue("dateAndTime", dateJson);
                }
                else
                {
                    var fallback = DateTimeOffset.UtcNow;
                    content.SetValue("dateAndTime", JsonSerializer.Serialize(new { date = fallback.ToString("o"), timeZone = "UTC" }));
                }

                var eventTypes = (evt.EventType ?? new List<string>()).Where(t => !string.IsNullOrWhiteSpace(t)).ToList();
                if (eventTypes.Count == 0) eventTypes.Add("MEETUP");
                content.SetValue("eventType", JsonSerializer.Serialize(eventTypes));

                content.SetValue("status", string.IsNullOrWhiteSpace(evt.Status) ? "UPCOMING_SESSION" : evt.Status.Trim());

                // Content Picker / Multi Node Tree Picker: set as comma-separated UDI strings (per Umbraco docs).
                content.SetValue("speaker", speakerUdis.Count > 0 ? string.Join(",", speakerUdis) : null);
                content.SetValue("attendees", attendeeUdis.Count > 0 ? string.Join(",", attendeeUdis) : null);

                if (attendeeNamesInEvent > 0 && attendeeNamesMatched == 0)
                {
                    var sampleNames = (evt.Attendees ?? Enumerable.Empty<MeetupAttendeeDto>())
                        .Select(GetAttendeeName).Where(n => !string.IsNullOrEmpty(n)).Take(3).ToList();
                    _logger.LogWarning("Event \"{Title}\": {JsonCount} attendees in JSON but 0 matched map. Sample names from JSON: [{Names}]",
                        title, attendeeNamesInEvent, string.Join(", ", sampleNames));
                }
                _logger.LogInformation("Event \"{Title}\": attendees in JSON={JsonCount}, matched={Matched}, UDIs set={SetCount}; speakers UDIs set={SpeakerCount}",
                    title, attendeeNamesInEvent, attendeeNamesMatched, attendeeUdis.Count, speakerUdis.Count);

                _contentService.Save(content);
                var saveResult = _contentService.Publish(content, new[] { "*" }, userId);
                if (saveResult.Success)
                    result.EventsCreated++;
                else
                    warnings.Add($"Failed to save event '{title}'.");
            }

            result.Success = true;
            result.Warnings = warnings;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Meetup import failed");
            result.Success = false;
            result.Error = ex.Message;
            result.Warnings = warnings;
        }

        return result;
    }

    private static async Task<List<MeetupEventDto>> DeserializeEventsAsync(string json, CancellationToken ct)
    {
        var trimmed = json.AsSpan().TrimStart();
        // Root is often a direct array [...]; object {...} has "events" property
        if (trimmed.Length > 0 && trimmed[0] == '[')
        {
            var list = JsonSerializer.Deserialize<List<MeetupEventDto>>(json);
            return await Task.FromResult(list ?? new List<MeetupEventDto>());
        }
        var root = JsonSerializer.Deserialize<MeetupImportRoot>(json);
        if (root?.EventsList?.Count > 0)
            return root.EventsList;
        return await Task.FromResult(new List<MeetupEventDto>());
    }

    private IContent? ResolveParent(string contentTypeAlias)
    {
        var root = _contentService.GetRootContent();
        if (root == null) return null;
        // Prefer direct child of root (e.g. "Events" at root)
        var direct = root.FirstOrDefault(c => c.ContentType.Alias == contentTypeAlias);
        if (direct != null) return direct;
        // Fallback: look one level deeper (e.g. Home → Events)
        foreach (var r in root)
        {
            var children = _contentService.GetPagedChildren(r.Id, 0, 200, out _);
            var found = children?.FirstOrDefault(c => c.ContentType.Alias == contentTypeAlias);
            if (found != null) return found;
        }
        return null;
    }

    /// <summary>Finds an existing child node by name and content type under the given parent (avoids duplicates on re-import).</summary>
    private IContent? FindChildByName(IContent parent, string name, string contentTypeAlias)
    {
        if (parent == null || string.IsNullOrWhiteSpace(name)) return null;
        var children = _contentService.GetPagedChildren(parent.Id, 0, 1000, out _);
        return children?.FirstOrDefault(c =>
            c.ContentType.Alias == contentTypeAlias &&
            string.Equals(c.Name?.Trim(), name.Trim(), StringComparison.OrdinalIgnoreCase));
    }

    private static IEnumerable<MeetupSpeakerDto> GetSpeakersFromEvent(MeetupEventDto evt)
    {
        if (evt.Speaker != null) yield return evt.Speaker;
        foreach (var s in evt.Speakers ?? (IEnumerable<MeetupSpeakerDto>)Array.Empty<MeetupSpeakerDto>())
            yield return s;
        foreach (var s in evt.Hosts ?? (IEnumerable<MeetupSpeakerDto>)Array.Empty<MeetupSpeakerDto>())
            yield return s;
    }

    private static string GetAttendeeName(MeetupAttendeeDto a)
    {
        return (a?.AttendeeName ?? a?.Name ?? a?.Id ?? "").Trim();
    }

    /// <summary>Gets a filename from an image ref (URL or path), stripping query strings.</summary>
    private static string GetFileNameFromImageRef(string imageRef)
    {
        if (string.IsNullOrWhiteSpace(imageRef)) return "";
        var path = imageRef.AsSpan();
        var q = path.IndexOf('?');
        if (q >= 0) path = path[..q];
        var name = path.ToString();
        var sep = name.LastIndexOfAny(new[] { '/', '\\' });
        return sep >= 0 ? name[(sep + 1)..] : name;
    }

    /// <summary>Tries multiple path combinations so images are found whether ImagesFolderPath is repo root, images folder, or images/attendees.</summary>
    private static string? ResolveImagePath(string imagesPath, string imageRef, string filename)
    {
        var full = Path.Combine(imagesPath, imageRef.Trim());
        if (System.IO.File.Exists(full)) return full;
        full = Path.Combine(imagesPath, filename);
        if (System.IO.File.Exists(full)) return full;
        full = Path.Combine(imagesPath, "attendees", filename);
        if (System.IO.File.Exists(full)) return full;
        return null;
    }

    private static string Slug(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return "item";
        var chars = new List<char>();
        foreach (var c in name)
        {
            if (char.IsLetterOrDigit(c))
                chars.Add(char.ToLowerInvariant(c));
            else if (char.IsWhiteSpace(c))
                chars.Add('-');
        }
        var slug = string.Join("-", new string(chars.ToArray()).Split('-', StringSplitOptions.RemoveEmptyEntries));
        return slug.Length > 0 ? slug : "item";
    }

    private IMedia GetOrCreateMeetupImportFolder(int mediaRootId)
    {
        var rootChildren = _mediaService.GetPagedChildren(mediaRootId, 0, 200, out _);
        var existing = rootChildren?.FirstOrDefault(m =>
            m.ContentType.Alias == Constants.Conventions.MediaTypes.Folder &&
            string.Equals(m.Name, "Meetup Import", StringComparison.OrdinalIgnoreCase));
        if (existing != null)
            return existing;
        var folder = _mediaService.CreateMedia("Meetup Import", mediaRootId, Constants.Conventions.MediaTypes.Folder);
        _mediaService.Save(folder);
        return folder;
    }

    private Guid? FindExistingImageMedia(int parentFolderId, string fileName)
    {
        var nameWithoutExtension = Path.GetFileNameWithoutExtension(fileName);
        if (string.IsNullOrEmpty(nameWithoutExtension)) return null;
        var children = _mediaService.GetPagedChildren(parentFolderId, 0, 2000, out _);
        var existing = children?.FirstOrDefault(m =>
            m.ContentType.Alias == Constants.Conventions.MediaTypes.Image &&
            string.Equals(m.Name?.Trim(), nameWithoutExtension.Trim(), StringComparison.OrdinalIgnoreCase));
        return existing?.Key;
    }

    private Guid? CreateImageMedia(string fullPath, string fileName, int parentId, Dictionary<string, Guid> cache)
    {
        if (cache.TryGetValue(fileName, out var existing)) return existing;
        var existingKey = FindExistingImageMedia(parentId, fileName);
        if (existingKey.HasValue)
        {
            cache[fileName] = existingKey.Value;
            return existingKey.Value;
        }
        try
        {
            using var stream = System.IO.File.OpenRead(fullPath);
            var name = Path.GetFileNameWithoutExtension(fileName);
            var media = _mediaService.CreateMedia(name, parentId, Constants.Conventions.MediaTypes.Image);
            media.SetValue(_mediaFileManager, _mediaUrlGeneratorCollection, _shortStringHelper, _contentTypeBaseServiceProvider, Constants.Conventions.Media.File, fileName, stream);
            var result = _mediaService.Save(media);
            if (result.Success)
            {
                cache[fileName] = media.Key;
                return media.Key;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to create media for {File}", fileName);
        }
        return null;
    }
}
