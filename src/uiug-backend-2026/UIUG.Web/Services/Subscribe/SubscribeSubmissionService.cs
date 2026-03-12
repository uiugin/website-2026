using System.Net.Mail;
using Umbraco.Cms.Infrastructure.Scoping;

namespace UIUG.Web.Services.Subscribe;

public class SubscribeSubmissionService : ISubscribeSubmissionService
{
    private readonly IScopeProvider _scopeProvider;
    private readonly ILogger<SubscribeSubmissionService> _logger;

    public SubscribeSubmissionService(IScopeProvider scopeProvider, ILogger<SubscribeSubmissionService> logger)
    {
        _scopeProvider = scopeProvider;
        _logger = logger;
    }

    public Task<SubscribeSubmissionResult> SubmitAsync(
        SubscribeSubmissionRequest request,
        string? ipAddress,
        string? machineInfo,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var trimmedEmail = request.Email?.Trim();

        var validationErrors = Validate(trimmedEmail);
        if (validationErrors.Count > 0)
        {
            return Task.FromResult(new SubscribeSubmissionResult
            {
                Success = false,
                Message = "Validation failed",
                ValidationErrors = validationErrors,
            });
        }

        var record = new SubscribeSubmissionRecord
        {
            Email = trimmedEmail!,
            SubmittedAtUtc = DateTime.UtcNow,
            IpAddress = ipAddress,
            MachineInfo = machineInfo,
        };

        using var scope = _scopeProvider.CreateScope(autoComplete: true);
        scope.Database.Insert(SubscribeSubmissionRecord.TableName, "Id", true, record);

        _logger.LogInformation("Saved subscribe submission for email {Email}", record.Email);

        return Task.FromResult(new SubscribeSubmissionResult
        {
            Success = true,
            Message = "Subscribe submission saved successfully",
        });
    }

    private static IDictionary<string, string[]> Validate(string? email)
    {
        var errors = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);

        if (string.IsNullOrWhiteSpace(email))
        {
            errors["email"] = ["Email is required."];
        }
        else if (!IsValidEmail(email))
        {
            errors["email"] = ["Email format is invalid."];
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
