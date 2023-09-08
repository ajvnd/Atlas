using Atlas.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Atlas.Controllers;

public class ProvincesController : Controller
{
    private readonly AtlasDbContext _dbContext;
    private readonly DbSet<Province> _provinces;

    public ProvincesController(AtlasDbContext dbContext)
    {
        _dbContext = dbContext;
        _provinces = _dbContext.Set<Province>();
    }

    [HttpGet]
    public IActionResult Index()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> List()
    {
        var results = await _provinces.AsNoTracking().ToListAsync();

        return Ok(results);
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] (string persianTitle, string englishTitle) viewModel)
    {
        var province = new Province()
        {
            PersianTitle = viewModel.persianTitle,
            EnglishTitle = viewModel.englishTitle,
            ModifiedDate = DateTime.Now
        };

        await _provinces.AddAsync(province);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost]
    public async Task<IActionResult> Edit([FromRoute] int id,
        [FromBody] (string persianTitle, string englishTitle) viewModel)
    {
        var province = await _provinces.FindAsync(id);

        if (province == null)
            return NotFound();

        province.PersianTitle = viewModel.persianTitle;
        province.EnglishTitle = viewModel.englishTitle;

        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        var province = await _provinces.FindAsync(id);

        if (province == null)
            return NotFound();

        _provinces.Remove(province);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }
}