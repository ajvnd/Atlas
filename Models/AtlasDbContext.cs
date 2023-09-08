using Microsoft.EntityFrameworkCore;

namespace Atlas.Models;

public class AtlasDbContext : DbContext
{
    public AtlasDbContext(DbContextOptions options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Province> Provinces { get; set; }
}

public class BaseEntity
{
    public int Id { get; set; }
    public DateTime ModifiedDate { get; set; }
}

public class User : BaseEntity
{
    public string UserName { get; set; }
    public string Password { get; set; }
}

public class Province : BaseEntity
{
    public string PersianTitle { get; set; }
    public string EnglishTitle { get; set; }
}