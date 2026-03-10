using UIUG.Web.Options;
using UIUG.Web.Services.Contact;
using UIUG.Web.Services.MeetupImport;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

string[] frontendOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();

builder.Services.Configure<MeetupImportOptions>(
    builder.Configuration.GetSection(MeetupImportOptions.SectionName));
builder.Services.AddScoped<IMeetupImportService, MeetupImportService>();
builder.Services.AddScoped<IContactSubmissionService, ContactSubmissionService>();
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendApp", policy =>
    {
        if (frontendOrigins.Length > 0)
        {
            policy.WithOrigins(frontendOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    });
});

builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddDeliveryApi()
    .AddComposers()
    .Build();

WebApplication app = builder.Build();

await app.BootUmbracoAsync();

if (frontendOrigins.Length > 0)
{
    app.UseCors("FrontendApp");
}

app.UseUmbraco()
    .WithMiddleware(u =>
    {
        u.UseBackOffice();
        u.UseWebsite();
    })
    .WithEndpoints(u =>
    {
        u.UseBackOfficeEndpoints();
        u.UseWebsiteEndpoints();
    });

app.MapControllers();

await app.RunAsync();
