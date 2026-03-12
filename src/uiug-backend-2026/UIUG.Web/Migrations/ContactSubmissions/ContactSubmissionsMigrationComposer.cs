using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Migrations;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Infrastructure.Migrations.Upgrade;

namespace UIUG.Web.Migrations.ContactSubmissions;

public class ContactSubmissionsMigrationComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Components().Append<ContactSubmissionsMigrationComponent>();
    }
}

public class ContactSubmissionsMigrationComponent : IAsyncComponent
{
    private readonly IMigrationPlanExecutor _migrationPlanExecutor;
    private readonly ICoreScopeProvider _coreScopeProvider;
    private readonly IKeyValueService _keyValueService;
    private readonly ILogger<ContactSubmissionsMigrationComponent> _logger;

    public ContactSubmissionsMigrationComponent(
        IMigrationPlanExecutor migrationPlanExecutor,
        ICoreScopeProvider coreScopeProvider,
        IKeyValueService keyValueService,
        ILogger<ContactSubmissionsMigrationComponent> logger)
    {
        _migrationPlanExecutor = migrationPlanExecutor;
        _coreScopeProvider = coreScopeProvider;
        _keyValueService = keyValueService;
        _logger = logger;
    }

    public async Task InitializeAsync(bool isCompleted, CancellationToken cancellationToken)
    {
        var migrationPlan = new MigrationPlan("ContactSubmissions");
        migrationPlan.From(string.Empty)
            .To<CreateContactSubmissionsTableMigration>("contact-submissions-db");

        var upgrader = new Upgrader(migrationPlan);
        await upgrader.ExecuteAsync(_migrationPlanExecutor, _coreScopeProvider, _keyValueService);

        _logger.LogInformation("Contact submissions migration plan executed.");
    }

    public Task TerminateAsync(bool isCompleted, CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
