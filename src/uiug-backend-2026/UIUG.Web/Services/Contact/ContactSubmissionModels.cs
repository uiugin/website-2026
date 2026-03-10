using NPoco;

namespace UIUG.Web.Services.Contact;

public class ContactSubmissionRequest
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Message { get; set; }
}

public class ContactSubmitResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public IDictionary<string, string[]>? Errors { get; set; }
}

public class ContactSubmissionResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public IDictionary<string, string[]> ValidationErrors { get; set; } = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);
}

[TableName(TableName)]
[PrimaryKey("Id", AutoIncrement = true)]
[ExplicitColumns]
public class ContactSubmissionRecord
{
    public const string TableName = "ContactSubmissions";

    [Column("Id")]
    public int Id { get; set; }

    [Column("Name")]
    public string Name { get; set; } = string.Empty;

    [Column("Email")]
    public string Email { get; set; } = string.Empty;

    [Column("Message")]
    public string Message { get; set; } = string.Empty;

    [Column("CreatedAtUtc")]
    public DateTime CreatedAtUtc { get; set; }

    [Column("IpAddress")]
    public string? IpAddress { get; set; }

    [Column("UserAgent")]
    public string? UserAgent { get; set; }
}
