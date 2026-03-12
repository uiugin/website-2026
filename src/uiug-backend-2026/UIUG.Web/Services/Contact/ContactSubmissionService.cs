using System.Net.Mail;
using Microsoft.Data.Sqlite;
using Umbraco.Cms.Infrastructure.Scoping;

namespace UIUG.Web.Services.Contact;

public class ContactSubmissionService : IContactSubmissionService
{
    private readonly IScopeProvider _scopeProvider;
    private readonly ILogger<ContactSubmissionService> _logger;

    public ContactSubmissionService(IScopeProvider scopeProvider, ILogger<ContactSubmissionService> logger)
    {
        _scopeProvider = scopeProvider;
        _logger = logger;
    }

    public Task<ContactSubmissionResult> SubmitAsync(
        ContactSubmissionRequest request,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var trimmedName = request.Name?.Trim();
        var trimmedEmail = request.Email?.Trim();
        var trimmedMessage = request.Message?.Trim();

        var validationErrors = Validate(trimmedName, trimmedEmail, trimmedMessage);
        if (validationErrors.Count > 0)
        {
            return Task.FromResult(new ContactSubmissionResult
            {
                Success = false,
                Message = "Validation failed",
                ValidationErrors = validationErrors,
            });
        }

        var record = new ContactSubmissionRecord
        {
            Name = trimmedName!,
            Email = trimmedEmail!,
            Message = trimmedMessage!,
            CreatedAtUtc = DateTime.UtcNow,
            IpAddress = ipAddress,
            UserAgent = userAgent,
        };

        using var scope = _scopeProvider.CreateScope(autoComplete: true);

        try
        {
            scope.Database.Insert(ContactSubmissionRecord.TableName, "Id", true, record);
        }
        catch (SqliteException ex) when (ex.Message.Contains("NOT NULL constraint failed: ContactSubmissions.Id", StringComparison.OrdinalIgnoreCase))
        {
            // Fallback for legacy/broken table schemas where Id is non-null but not auto-generated.
            var nextId = scope.Database.ExecuteScalar<int>($"SELECT CASE WHEN IFNULL(MAX(Id), 0) < 1000 THEN 1001 ELSE MAX(Id) + 1 END FROM {ContactSubmissionRecord.TableName}");
            record.Id = nextId;
            scope.Database.Insert(ContactSubmissionRecord.TableName, "Id", false, record);

            _logger.LogWarning(ex, "Fallback insert path used for ContactSubmissions due to legacy Id schema. Assigned Id {Id}.", record.Id);
        }

        _logger.LogInformation("Saved contact submission for email {Email}", record.Email);

        return Task.FromResult(new ContactSubmissionResult
        {
            Success = true,
            Message = "Contact submission saved successfully",
        });
    }

    private static IDictionary<string, string[]> Validate(string? name, string? email, string? message)
    {
        var errors = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);

        if (string.IsNullOrWhiteSpace(name))
        {
            errors["name"] = ["Name is required."];
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            errors["email"] = ["Email is required."];
        }
        else if (!IsValidEmail(email))
        {
            errors["email"] = ["Email format is invalid."];
        }

        if (string.IsNullOrWhiteSpace(message))
        {
            errors["message"] = ["Message is required."];
        }

        return errors;
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            _ = new MailAddress(email);
            return true;
        }
        catch
        {
            return false;
        }
    }
}
