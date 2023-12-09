using System.ComponentModel.DataAnnotations.Schema;
using System.Globalization;
using Atlas.Controllers;
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
    public DbSet<ContractType> ContractTypes { get; set; }
    public DbSet<Company> Companies { get; set; }
    public DbSet<Institute> Institutes { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Researcher> Researchers { get; set; }

    public void Seed()
    {
        Users.Add(new User()
        {
            UserName = "Admin",
            FirstName = "مدیر",
            LastName = "سیستم",
            Password = AccountController.CreatePassword("admin")
        });

        var province1 = new Province()
        {
            Title = "تهران",
            ModifiedDate = DateTime.Now
        };
        var province2 = new Province()
        {
            Title = "قم",
            ModifiedDate = DateTime.Now
        };

        Provinces.Add(province1);
        Provinces.Add(province2);

        var domain1 = new Domain()
        {
            Title = "هوش مصنوعی",
            ModifiedDate = DateTime.Now
        };

        var domain2 = new Domain()
        {
            Title = "سخت افزار",
            ModifiedDate = DateTime.Now
        };

        Domains.Add(domain1);
        Domains.Add(domain2);


        ContractTypes.Add(new ContractType()
        {
            Title = "نوع ۱",
            ModifiedDate = DateTime.Now
        });

        ContractTypes.Add(new ContractType()
        {
            Title = "نوع ۲",
            ModifiedDate = DateTime.Now
        });

        Products.AddRange(new[]
        {
            new Product()
            {
                Province = province1,
                Domain = domain1,
                IsEnabled = true,
                Title = "محصول ۱",
                ModifiedDate = DateTime.Now,
            },
            new Product()
            {
                Province = province2,
                Domain = domain2,
                IsEnabled = true,
                Title = "محصول۲",
                ModifiedDate = DateTime.Now,
            }
        });
    }
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
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string UserName { get; set; }
    public string Password { get; set; }
    public bool IsProtected { get; set; }
    public bool IsEnabled { get; set; }

    public string FullName => $"{FirstName} {LastName}";
}

public class Province : BaseEntity
{
    public string Title { get; set; }
}

public class Domain : BaseEntity
{
    public string Title { get; set; }
}

public class ContractType : BaseEntity
{
    public string Title { get; set; }
}

public class Company : BaseEntity
{
    public string Title { get; set; }
    public string Address { get; set; }
    public string Resume { get; set; }

    public bool IsEnabled { get; set; }
    public bool IsKnowledgeBased { get; set; }
    public bool HasSamta { get; set; }

    public int? DomainId { get; set; }
    public int? ProvinceId { get; set; }

    public int? ContractTypeId { get; set; }

    public virtual ContractType ContractType { get; set; }
    public virtual Domain Domain { get; set; }
    public virtual Province Province { get; set; }
}

public class Institute : BaseEntity
{
    public string Title { get; set; }
    public string Address { get; set; }
    public string Resume { get; set; }

    public bool IsEnabled { get; set; }
    public bool IsKnowledgeBased { get; set; }

    public int? DomainId { get; set; }
    public int? ProvinceId { get; set; }

    public virtual Domain Domain { get; set; }
    public virtual Province Province { get; set; }
}

public class Product : BaseEntity
{
    public string Title { get; set; }
    public string Address { get; set; }
    public bool IsEnabled { get; set; }
    public int? DomainId { get; set; }
    public int? ProvinceId { get; set; }

    public virtual Domain Domain { get; set; }
    public virtual Province Province { get; set; }
}

public class Researcher : BaseEntity
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Resume { get; set; }
    public string Address { get; set; }
    public bool IsEnabled { get; set; }

    public int? DomainId { get; set; }
    public int? ProvinceId { get; set; }

    public virtual Domain Domain { get; set; }
    public virtual Province Province { get; set; }
}