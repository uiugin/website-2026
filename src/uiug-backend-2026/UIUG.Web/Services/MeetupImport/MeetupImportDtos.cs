using System.Text.Json.Serialization;

namespace UIUG.Web.Services.MeetupImport;

/// <summary>
/// Root DTO for meetup-events.json (array of events or wrapper with Events property).
/// </summary>
public class MeetupImportRoot
{
    [JsonPropertyName("events")]
    public List<MeetupEventDto>? Events { get; set; }

    /// <summary>
    /// If the JSON is a direct array of events, deserialize as array and assign here.
    /// </summary>
    [JsonIgnore]
    public List<MeetupEventDto> EventsList => Events ?? new List<MeetupEventDto>();
}

/// <summary>
/// Single event from Meetup data.
/// </summary>
public class MeetupEventDto
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("briefSummary")]
    public string? BriefSummary { get; set; }

    [JsonPropertyName("fullSummary")]
    public string? FullSummary { get; set; }

    /// <summary>Event date/time (ISO). JSON may use "date" or "dateTime".</summary>
    [JsonPropertyName("date")]
    public string? DateTime { get; set; }

    [JsonPropertyName("eventType")]
    public List<string>? EventType { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("speaker")]
    public MeetupSpeakerDto? Speaker { get; set; }

    [JsonPropertyName("speakers")]
    public List<MeetupSpeakerDto>? Speakers { get; set; }

    [JsonPropertyName("hosts")]
    public List<MeetupSpeakerDto>? Hosts { get; set; }

    [JsonPropertyName("attendees")]
    public List<MeetupAttendeeDto>? Attendees { get; set; }
}

/// <summary>
/// Speaker/host from Meetup data.
/// </summary>
public class MeetupSpeakerDto
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("role")]
    public string? Role { get; set; }

    [JsonPropertyName("company")]
    public string? Company { get; set; }

    [JsonPropertyName("bio")]
    public string? Bio { get; set; }

    [JsonPropertyName("speakerType")]
    public string? SpeakerType { get; set; }

    [JsonPropertyName("avatarImageUrl")]
    public string? AvatarImageUrl { get; set; }

    [JsonPropertyName("avatarImage")]
    public string? AvatarImage { get; set; }

    /// <summary>
    /// Filename (or path relative to images folder) for avatar.
    /// </summary>
    [JsonPropertyName("photo")]
    public string? Photo { get; set; }
}

/// <summary>
/// Attendee/RSVP from Meetup data.
/// </summary>
public class MeetupAttendeeDto
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("attendeeName")]
    public string? AttendeeName { get; set; }

    [JsonPropertyName("photoUrl")]
    public string? PhotoUrl { get; set; }

    [JsonPropertyName("photo")]
    public string? Photo { get; set; }

    [JsonPropertyName("image")]
    public string? Image { get; set; }

    [JsonPropertyName("attendeePhoto")]
    public string? AttendeePhoto { get; set; }
}
