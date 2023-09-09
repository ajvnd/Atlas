using Atlas.Extensions;
using Atlas.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Atlas.Controllers;

public class DomainsController : Controller
{
    private readonly AtlasDbContext _dbContext;
    private readonly DbSet<Domain> _domains;

    public DomainsController(AtlasDbContext dbContext)
    {
        _dbContext = dbContext;
        _domains = _dbContext.Set<Domain>();
    }

    [HttpGet]
    public IActionResult Index()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> List()
    {
        var results = await _domains.AsNoTracking().ToListAsync();

        return Ok(results);
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] Domain viewModel)
    {
        var domain = new Domain()
        {
            Title = viewModel.Title.PersianToEnglishDigit(),
            ModifiedDate = DateTime.Now
        };

        await _domains.AddAsync(domain);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost]
    public async Task<IActionResult> Edit([FromRoute] int id,
        [FromBody] Domain viewModel)
    {
        var domain = await _domains.FindAsync(id);

        if (domain == null)
            return NotFound();

        domain.Title = viewModel.Title.PersianToEnglishDigit();

        _domains.Update(domain);
        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        var domain = await _domains.FindAsync(id);

        if (domain == null)
            return NotFound();

        _domains.Remove(domain);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }
}