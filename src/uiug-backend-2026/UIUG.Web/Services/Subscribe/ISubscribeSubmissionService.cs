namespace UIUG.Web.Services.Subscribe;

public interface ISubscribeSubmissionService
{
    Task<SubscribeSubmissionResult> SubmitAsync(
        SubscribeSubmissionRequest request,
        string? ipAddress,
        string? machineInfo,
        CancellationToken cancellationToken = default);
}
