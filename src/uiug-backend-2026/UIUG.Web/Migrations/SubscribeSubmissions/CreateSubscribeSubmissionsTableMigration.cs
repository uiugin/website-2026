using Umbraco.Cms.Infrastructure.Migrations;
using UIUG.Web.Services.Subscribe;

namespace UIUG.Web.Migrations.SubscribeSubmissions;

public class CreateSubscribeSubmissionsTableMigration : AsyncMigrationBase
{
    public CreateSubscribeSubmissionsTableMigration(IMigrationContext context)
        : base(context)
    {
    }

    protected override Task MigrateAsync()
    {
        if (TableExists(SubscribeSubmissionRecord.TableName))
        {
            return Task.CompletedTask;
        }

        Execute.Sql(@"
CREATE TABLE SubscribeSubmissions (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Email TEXT NOT NULL,
    SubmittedAtUtc TEXT NOT NULL,
    IpAddress TEXT NULL,
    MachineInfo TEXT NULL
    );").Do();

        return Task.CompletedTask;
    }
}
