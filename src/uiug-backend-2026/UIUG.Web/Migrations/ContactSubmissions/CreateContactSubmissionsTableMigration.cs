using Umbraco.Cms.Infrastructure.Migrations;
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
        if (TableExists(ContactSubmissionRecord.TableName))
        {
            return Task.CompletedTask;
        }

        Execute.Sql(@"
CREATE TABLE ContactSubmissions (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Email TEXT NOT NULL,
    Message TEXT NOT NULL,
    CreatedAtUtc TEXT NOT NULL,
    IpAddress TEXT NULL,
    UserAgent TEXT NULL
);");

        return Task.CompletedTask;
    }
}

public class EnsureContactSubmissionsIdentityMigration : AsyncMigrationBase
{
    public EnsureContactSubmissionsIdentityMigration(IMigrationContext context)
        : base(context)
    {
    }

    protected override Task MigrateAsync()
    {
        if (!TableExists(ContactSubmissionRecord.TableName))
        {
            return Task.CompletedTask;
        }

        // SQLite auto-increment works only when PK is declared as INTEGER PRIMARY KEY.
        string? idType = Database.ExecuteScalar<string>(
            "SELECT type FROM pragma_table_info('ContactSubmissions') WHERE name = 'Id' LIMIT 1;");
        var idPk = Database.ExecuteScalar<long>(
            "SELECT pk FROM pragma_table_info('ContactSubmissions') WHERE name = 'Id' LIMIT 1;");

        var hasSqliteIdentityPk = string.Equals(idType, "INTEGER", StringComparison.OrdinalIgnoreCase) && idPk == 1;
        if (hasSqliteIdentityPk)
        {
            return Task.CompletedTask;
        }

        Execute.Sql(@"
CREATE TABLE ContactSubmissions__new (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Email TEXT NOT NULL,
    Message TEXT NOT NULL,
    CreatedAtUtc TEXT NOT NULL,
    IpAddress TEXT NULL,
    UserAgent TEXT NULL
);");

        Execute.Sql(@"
INSERT INTO ContactSubmissions__new (Id, Name, Email, Message, CreatedAtUtc, IpAddress, UserAgent)
SELECT Id, Name, Email, Message, CreatedAtUtc, IpAddress, UserAgent
FROM ContactSubmissions;");

        Execute.Sql("DROP TABLE ContactSubmissions;");
        Execute.Sql("ALTER TABLE ContactSubmissions__new RENAME TO ContactSubmissions;");

        return Task.CompletedTask;
    }
}

public class RebuildContactSubmissionsWithSeedMigration : AsyncMigrationBase
{
    public RebuildContactSubmissionsWithSeedMigration(IMigrationContext context)
        : base(context)
    {
    }

    protected override Task MigrateAsync()
    {
        if (!TableExists(ContactSubmissionRecord.TableName))
        {
            Execute.Sql(@"
CREATE TABLE ContactSubmissions (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Email TEXT NOT NULL,
    Message TEXT NOT NULL,
    CreatedAtUtc TEXT NOT NULL,
    IpAddress TEXT NULL,
    UserAgent TEXT NULL
);");

            // Ensure first generated id starts from 1001.
            Execute.Sql("INSERT OR REPLACE INTO sqlite_sequence(name, seq) VALUES ('ContactSubmissions', 1000);");
            return Task.CompletedTask;
        }

        Execute.Sql(@"
CREATE TABLE ContactSubmissions__rebuild (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Email TEXT NOT NULL,
    Message TEXT NOT NULL,
    CreatedAtUtc TEXT NOT NULL,
    IpAddress TEXT NULL,
    UserAgent TEXT NULL
);");

        Execute.Sql(@"
INSERT INTO ContactSubmissions__rebuild (Id, Name, Email, Message, CreatedAtUtc, IpAddress, UserAgent)
SELECT
    CASE WHEN Id IS NULL OR Id = 0 THEN NULL ELSE Id END,
    Name,
    Email,
    Message,
    CreatedAtUtc,
    IpAddress,
    UserAgent
FROM ContactSubmissions;");

        Execute.Sql("DROP TABLE ContactSubmissions;");
        Execute.Sql("ALTER TABLE ContactSubmissions__rebuild RENAME TO ContactSubmissions;");

        // Keep incrementing from current max id, but never below 1001.
        Execute.Sql(@"
INSERT INTO sqlite_sequence(name, seq)
VALUES (
    'ContactSubmissions',
    (SELECT CASE WHEN IFNULL(MAX(Id), 0) < 1000 THEN 1000 ELSE IFNULL(MAX(Id), 0) END FROM ContactSubmissions)
)
ON CONFLICT(name) DO UPDATE SET seq = excluded.seq;");

        return Task.CompletedTask;
    }
}
