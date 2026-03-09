namespace UIUG.Web.Options;

/// <summary>
/// Configuration for Meetup import: paths to events JSON and images folder.
/// </summary>
public class MeetupImportOptions
{
    public const string SectionName = "MeetupImport";

    /// <summary>
    /// Absolute or relative path to meetup-events.json.
    /// </summary>
    public string? EventsJsonPath { get; set; }

    /// <summary>
    /// Absolute or relative path to the folder containing images (speaker/attendee photos).
    /// </summary>
    public string? ImagesFolderPath { get; set; }

    /// <summary>
    /// Optional API key. If set, POST /api/import/meetup must send header X-Import-Key with this value.
    /// </summary>
    public string? ImportApiKey { get; set; }

    /// <summary>
    /// Backoffice user ID used when publishing imported content (audit trail).
    /// If not set, 0 is used (system user). If you get "No user found with the specified id", set this to a valid backoffice user ID (e.g. 1).
    /// </summary>
    public int? ImportUserId { get; set; }
}
