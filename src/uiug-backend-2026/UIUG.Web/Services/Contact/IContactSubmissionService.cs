namespace UIUG.Web.Services.Contact;

public interface IContactSubmissionService
{
    Task<ContactSubmissionResult> SubmitAsync(
        ContactSubmissionRequest request,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);
}
