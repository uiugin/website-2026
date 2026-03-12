using NPoco;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;
using UIUG.Web.Services.Contact;

namespace UIUG.Web.Migrations.ContactSubmissions;

public class CreateContactSubmissionsTableMigration : AsyncMigrationBase
{
    public CreateContactSubmissionsTableMigration(IMigrationContext context)
        : base(context)
    {
    }

    protected override Task MigrateAsync()
    {
        if (!TableExists(ContactSubmissionRecord.TableName))
        {
            Create.Table<ContactSubmissionSchema>().Do();
        }

        return Task.CompletedTask;
    }

    [TableName("ContactSubmissions")]
    [PrimaryKey("Id", AutoIncrement = true)]
    [ExplicitColumns]
    public class ContactSubmissionSchema
    {
        [PrimaryKeyColumn(AutoIncrement = true, IdentitySeed = 1)]
        [Column("Id")]
        public int Id { get; set; }

        [Column("Name")]
        public string Name { get; set; } = string.Empty;

        [Column("Email")]
        public string Email { get; set; } = string.Empty;

        [Column("Message")]
        public string Message { get; set; } = string.Empty;

        [Column("CreatedAtUtc")]
        public DateTime CreatedAtUtc { get; set; }

        [Column("IpAddress")]
        public string? IpAddress { get; set; }

        [Column("UserAgent")]
        public string? UserAgent { get; set; }
    }
}
