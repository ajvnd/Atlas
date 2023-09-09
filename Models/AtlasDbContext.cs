using System.ComponentModel.DataAnnotations.Schema;
using System.Globalization;
using Microsoft.EntityFrameworkCore;

namespace Atlas.Models;

public class AtlasDbContext : DbContext
{
    public AtlasDbContext(DbContextOptions options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Province> Provinces { get; set; }
    public DbSet<Domain> Domains { get; set; }
    public DbSet<Contract> Contracts { get; set; }
}

public class BaseEntity
{
    public int Id { get; set; }
    public DateTime ModifiedDate { get; set; }

    [NotMapped]
    public string PersianModifiedDate => ModifiedDate.ToString("H:mm yyyy/MM/dd", CultureInfo.GetCultureInfo("fa-IR"));
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

public class Domain : BaseEntity
{
    public string Title { get; set; }
}

public class Contract : BaseEntity
{
    public string Title { get; set; }
}

public class Resume
{
    public string Url { get; set; }
}