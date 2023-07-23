using Microsoft.EntityFrameworkCore;

namespace Atlas.Models;

public class AtlasDbContext : DbContext
{
    public AtlasDbContext(DbContextOptions options) : base(options)
    {
    }
    
    public DbSet<User> Users { get; set; }
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

