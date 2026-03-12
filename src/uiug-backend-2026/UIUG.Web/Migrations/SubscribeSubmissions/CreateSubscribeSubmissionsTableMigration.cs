using NPoco;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;
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
        if (!TableExists(SubscribeSubmissionRecord.TableName))
        {
            Create.Table<SubscribeSubmissionSchema>().Do();
        }

        return Task.CompletedTask;
    }

    [TableName("SubscribeSubmissions")]
    [PrimaryKey("Id", AutoIncrement = true)]
    [ExplicitColumns]
    public class SubscribeSubmissionSchema
    {
        [PrimaryKeyColumn(AutoIncrement = true, IdentitySeed = 1)]
        [Column("Id")]
        public int Id { get; set; }

        [Column("Email")]
        public string Email { get; set; } = string.Empty;

        [Column("SubmittedAtUtc")]
        public DateTime SubmittedAtUtc { get; set; }

        [Column("IpAddress")]
        public string? IpAddress { get; set; }

        [Column("MachineInfo")]
        public string? MachineInfo { get; set; }
    }
}
