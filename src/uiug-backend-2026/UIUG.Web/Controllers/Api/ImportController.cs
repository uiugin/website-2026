using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using UIUG.Web.Options;
using UIUG.Web.Services.MeetupImport;

namespace UIUG.Web.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class ImportController : ControllerBase
{
    private readonly IMeetupImportService _importService;
    private readonly IOptionsSnapshot<MeetupImportOptions> _options;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<ImportController> _logger;

    public ImportController(
        IMeetupImportService importService,
        IOptionsSnapshot<MeetupImportOptions> options,
        IWebHostEnvironment env,
        ILogger<ImportController> logger)
    {
        _importService = importService;
        _options = options;
        _env = env;
        _logger = logger;
    }

    /// <summary>
    /// Run the Meetup import. Requires MeetupImport paths to be set.
    /// In production, X-Import-Key header must match MeetupImport:ImportApiKey when that value is set.
    /// </summary>
    [HttpPost("meetup")]
    public async Task<IActionResult> Meetup(CancellationToken cancellationToken)
    {
        var opts = _options.Value;
        var apiKey = opts.ImportApiKey;

        if (!_env.IsDevelopment() && string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogWarning("Meetup import rejected: no ImportApiKey configured in production.");
            return StatusCode(403, new { error = "Import is disabled in production when MeetupImport:ImportApiKey is not set." });
        }

        if (!string.IsNullOrWhiteSpace(apiKey))
        {
            var headerKey = Request.Headers["X-Import-Key"].FirstOrDefault();
            if (headerKey != apiKey)
            {
                _logger.LogWarning("Meetup import rejected: invalid or missing X-Import-Key.");
                return Unauthorized(new { error = "Invalid or missing X-Import-Key header." });
            }
        }

        var result = await _importService.ImportAsync(cancellationToken);

        if (!result.Success)
        {
            if (result.Error != null && (result.Error.Contains("not set") || result.Error.Contains("not found")))
                return BadRequest(new { error = result.Error, warnings = result.Warnings });
            return StatusCode(500, new { error = result.Error ?? "Import failed.", warnings = result.Warnings });
        }

        return Ok(new
        {
            success = true,
            mediaCreated = result.MediaCreated,
            attendeesCreated = result.AttendeesCreated,
            speakersCreated = result.SpeakersCreated,
            eventsCreated = result.EventsCreated,
            warnings = result.Warnings
        });
    }
}
