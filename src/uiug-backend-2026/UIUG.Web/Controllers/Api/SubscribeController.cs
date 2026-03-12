using Microsoft.AspNetCore.Mvc;
using UIUG.Web.Services.Subscribe;

namespace UIUG.Web.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class SubscribeController : ControllerBase
{
    private readonly ISubscribeSubmissionService _subscribeSubmissionService;
    private readonly ILogger<SubscribeController> _logger;

    public SubscribeController(ISubscribeSubmissionService subscribeSubmissionService, ILogger<SubscribeController> logger)
    {
        _subscribeSubmissionService = subscribeSubmissionService;
        _logger = logger;
    }

    [HttpPost("submit")]
    public async Task<IActionResult> Submit([FromBody] SubscribeSubmissionRequest? request, CancellationToken cancellationToken)
    {
        if (request == null)
        {
            return BadRequest(new SubscribeSubmitResponse
            {
                Success = false,
                Message = "Validation failed",
                Errors = new Dictionary<string, string[]>
                {
                    ["request"] = ["Request body is required."],
                },
            });
        }

        try
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var machineInfo = Request.Headers.UserAgent.ToString();

            var result = await _subscribeSubmissionService.SubmitAsync(request, ipAddress, machineInfo, cancellationToken);

            if (!result.Success && result.ValidationErrors.Count > 0)
            {
                return BadRequest(new SubscribeSubmitResponse
                {
                    Success = false,
                    Message = "Validation failed",
                    Errors = result.ValidationErrors,
                });
            }

            if (!result.Success)
            {
                return StatusCode(500, new SubscribeSubmitResponse
                {
                    Success = false,
                    Message = string.IsNullOrWhiteSpace(result.Message)
                        ? "Unable to save subscribe submission."
                        : result.Message,
                });
            }

            return Ok(new SubscribeSubmitResponse
            {
                Success = true,
                Message = "Subscribe submission saved successfully",
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to submit subscribe form.");
            return StatusCode(500, new SubscribeSubmitResponse
            {
                Success = false,
                Message = "An unexpected error occurred while saving subscribe submission.",
            });
        }
    }
}
