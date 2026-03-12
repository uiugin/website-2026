using NPoco;

namespace UIUG.Web.Services.Subscribe;

public class SubscribeSubmissionRequest
{
    public string? Email { get; set; }
}

public class SubscribeSubmitResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public IDictionary<string, string[]>? Errors { get; set; }
}

public class SubscribeSubmissionResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public IDictionary<string, string[]> ValidationErrors { get; set; } = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);
}

[TableName(TableName)]
[PrimaryKey("Id", AutoIncrement = true)]
[ExplicitColumns]
public class SubscribeSubmissionRecord
{
    public const string TableName = "SubscribeSubmissions";

    [Column("Id")]
    public int Id { get; set; }

    [Column("Email")]
    public string Email { get; set; } = string.Empty;

    [Column("SubmittedAtUtc")]
    public DateTime SubmittedAtUtc { get; set; }

    [Column("IpAddress")]
    public string? IpAddress { get; set; }

    [Column("MachineInfo")]
    public string? MachineInfo { get; set; }
}
