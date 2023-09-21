using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Atlas.Exceptions;
using Atlas.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Atlas.Controllers;

public class UsersController : Controller
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly AtlasDbContext _dbContext;
    private readonly DbSet<User> _users;

    public UsersController(
        IHttpContextAccessor httpContextAccessor,
        AtlasDbContext dbContext)
    {
        _httpContextAccessor = httpContextAccessor;
        _dbContext = dbContext;
        _users = dbContext.Set<User>();
    }

    [HttpGet]
    public IActionResult Index()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> List()
    {
        var users = await _users.Select(c =>
            new
            {
                c.Id,
                c.FirstName,
                c.LastName,
                c.UserName,
                c.IsEnabled,
                c.ModifiedDate,
                c.PersianModifiedDate
            }).ToListAsync();

        return Ok(users);
    }


    [HttpGet]
    public async Task<IActionResult> Get([FromRoute] int id)
    {
        var user = await _users.FindAsync(id);

        return Ok(user);
    }

    [HttpGet]
    public async Task<IActionResult> Current()
    {
        var id = _httpContextAccessor.HttpContext.User.Claims
            .FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier).Value;

        var user = await _users.FindAsync(int.Parse(id));

        return Ok(_users);
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] User viewModel)
    {
        await DuplicateUserNameAsync(viewModel);

        viewModel.Password ??= "12345";
        viewModel.ModifiedDate = DateTime.Now;

        HashPassword(viewModel);

        await _users.AddAsync(viewModel);

        await _dbContext.SaveChangesAsync();

        return Ok(viewModel.Id);
    }


    [HttpPost]
    public async Task<IActionResult> Edit([FromRoute] int id, [FromBody] User viewModel)
    {
        var user = await _users.FindAsync(id);

        if (user == null)
            return NotFound();

        if (user.IsProtected)
            throw new UnAllowedToEditException();

        await DuplicateUserNameWithIdAsync(user);

        user.IsEnabled = viewModel.IsEnabled;
        user.FirstName = viewModel.FirstName;
        user.LastName = viewModel.LastName;
        user.UserName = viewModel.UserName;
        user.ModifiedDate = DateTime.Now;

        if (!string.IsNullOrEmpty(viewModel.Password))
            HashPassword(user);

        _users.Update(user);

        await _dbContext.SaveChangesAsync();

        return NoContent();
    }


    [HttpGet]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        var user = await _users.FindAsync(id);

        if (user == null)
            return NotFound();

        if (user.IsProtected)
            throw new UnAllowedToDeleteException();

        _users.Remove(user);

        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    private void HashPassword(User user)
    {
        using var sha256 = SHA256.Create();
        var secretBytes = Encoding.UTF8.GetBytes(user.Password);
        var secretHash = sha256.ComputeHash(secretBytes);
        user.Password = Convert.ToHexString(secretHash);
    }

    private async Task DuplicateUserNameAsync(User user)
    {
        var duplicateUserName = await _users.FirstOrDefaultAsync(c => c.UserName == user.UserName);
        if (duplicateUserName is not null)
            throw new DuplicateUserNameException();
    }

    private async Task DuplicateUserNameWithIdAsync(User user)
    {
        var duplicateUserName = await _users.FirstOrDefaultAsync(c => c.UserName == user.UserName && c.Id != user.Id);
        if (duplicateUserName is not null)
            throw new DuplicateUserNameException();
    }
}