using Atlas.Configurations;
using Atlas.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllersWithViews().AddRazorRuntimeCompilation();

builder.Services.AddDbContext<AtlasDbContext>((c) =>
{
    var connectionString = builder.Configuration.GetConnectionString("default");
    c.UseLazyLoadingProxies().UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
});

builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

// Add Middlewares
var app = builder.Build();

app.UseDeveloperExceptionPage();

ErrorHandlerMiddleware.Use(app);

using var serviceScope = app.Services.CreateScope();
using var dbContext = serviceScope.ServiceProvider.GetRequiredService<AtlasDbContext>();

dbContext.Database.EnsureDeleted();
dbContext.Database.EnsureCreated();

app.UseStaticFiles();
app.UseRouting();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();