using Microsoft.AspNetCore.Mvc;
using UIUG.Web.Services.Contact;

namespace UIUG.Web.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly IContactSubmissionService _contactSubmissionService;
    private readonly ILogger<ContactController> _logger;

    public ContactController(IContactSubmissionService contactSubmissionService, ILogger<ContactController> logger)
    {
        _contactSubmissionService = contactSubmissionService;
        _logger = logger;
    }

    [HttpPost("submit")]
    public async Task<IActionResult> Submit([FromBody] ContactSubmissionRequest? request, CancellationToken cancellationToken)
    {
        if (request == null)
        {
            return BadRequest(new ContactSubmitResponse
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
            var userAgent = Request.Headers.UserAgent.ToString();

            var result = await _contactSubmissionService.SubmitAsync(request, ipAddress, userAgent, cancellationToken); 

            if (!result.Success && result.ValidationErrors.Count > 0)
            {
                return BadRequest(new ContactSubmitResponse
                {
                    Success = false,
                    Message = "Validation failed",
                    Errors = result.ValidationErrors,
                });
            }

            if (!result.Success)
            {
                return StatusCode(500, new ContactSubmitResponse
                {
                    Success = false,
                    Message = string.IsNullOrWhiteSpace(result.Message)
                        ? "Unable to save contact submission."
                        : result.Message,
                });
            }

            return Ok(new ContactSubmitResponse
            {
                Success = true,
                Message = "Contact submission saved successfully",
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to submit contact form.");
            return StatusCode(500, new ContactSubmitResponse
            {
                Success = false,
                Message = "An unexpected error occurred while saving contact submission.",
            });
        }
    }
}
