namespace UIUG.Web.Services.MeetupImport;

/// <summary>
/// Runs the Meetup import: reads JSON and images, creates media and content nodes.
/// </summary>
public interface IMeetupImportService
{
    /// <summary>
    /// Executes the import. Returns a summary with counts and any errors.
    /// </summary>
    Task<MeetupImportResult> ImportAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of a Meetup import run.
/// </summary>
public class MeetupImportResult
{
    public bool Success { get; set; }
    public string? Error { get; set; }
    public int MediaCreated { get; set; }
    public int AttendeesCreated { get; set; }
    public int SpeakersCreated { get; set; }
    public int EventsCreated { get; set; }
    public IReadOnlyList<string> Warnings { get; set; } = Array.Empty<string>();
}
