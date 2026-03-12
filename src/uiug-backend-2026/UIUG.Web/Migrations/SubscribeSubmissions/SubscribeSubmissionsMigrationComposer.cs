using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Migrations;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Infrastructure.Migrations.Upgrade;

namespace UIUG.Web.Migrations.SubscribeSubmissions;

public class SubscribeSubmissionsMigrationComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Components().Append<SubscribeSubmissionsMigrationComponent>();
    }
}

public class SubscribeSubmissionsMigrationComponent : IAsyncComponent
{
    private readonly IMigrationPlanExecutor _migrationPlanExecutor;
    private readonly ICoreScopeProvider _coreScopeProvider;
    private readonly IKeyValueService _keyValueService;
    private readonly ILogger<SubscribeSubmissionsMigrationComponent> _logger;

    public SubscribeSubmissionsMigrationComponent(
        IMigrationPlanExecutor migrationPlanExecutor,
        ICoreScopeProvider coreScopeProvider,
        IKeyValueService keyValueService,
        ILogger<SubscribeSubmissionsMigrationComponent> logger)
    {
        _migrationPlanExecutor = migrationPlanExecutor;
        _coreScopeProvider = coreScopeProvider;
        _keyValueService = keyValueService;
        _logger = logger;
    }

    public async Task InitializeAsync(bool isCompleted, CancellationToken cancellationToken)
    {
        var migrationPlan = new MigrationPlan("SubscribeSubmissions");
        migrationPlan.From(string.Empty)
            .To<CreateSubscribeSubmissionsTableMigration>("subscribe-submissions-db-v1");

        var upgrader = new Upgrader(migrationPlan);
        await upgrader.ExecuteAsync(_migrationPlanExecutor, _coreScopeProvider, _keyValueService);

        _logger.LogInformation("Subscribe submissions migration plan executed.");
    }

    public Task TerminateAsync(bool isCompleted, CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
