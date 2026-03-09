using UIUG.Web.Options;
using UIUG.Web.Services.MeetupImport;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<MeetupImportOptions>(
    builder.Configuration.GetSection(MeetupImportOptions.SectionName));
builder.Services.AddScoped<IMeetupImportService, MeetupImportService>();
builder.Services.AddControllers();

builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddDeliveryApi()
    .AddComposers()
    .Build();

WebApplication app = builder.Build();

await app.BootUmbracoAsync();


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
