using Atlas.Extensions;
using Atlas.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Atlas.Controllers;

public class ResearchersController:Controller
{
    
    private readonly AtlasDbContext _dbContext;
    private readonly IWebHostEnvironment _hostEnvironment;
    private readonly DbSet<Researcher> _researchers;

    public ResearchersController(AtlasDbContext dbContext, IWebHostEnvironment hostEnvironment)
    {
        _dbContext = dbContext;
        _hostEnvironment = hostEnvironment;
        _researchers = _dbContext.Set<Researcher>();
    }

    [HttpGet]
    public IActionResult Index()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> List()
    {
        var results = await _researchers.ToListAsync();

        return Ok(results);
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] Researcher viewModel)
    {
        var researcher = MapResearcher(viewModel, new Researcher());

        await _researchers.AddAsync(researcher);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost]
    public async Task<IActionResult> Edit([FromRoute] int id,
        [FromBody] Researcher viewModel)
    {
        var researcher = await _researchers.FindAsync(id);

        if (researcher == null)
            return NotFound();

        researcher = MapResearcher(viewModel, researcher);

        _dbContext.Update(researcher);

        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        var researcher = await _researchers.FindAsync(id);

        if (researcher == null)
            return NotFound();

        _researchers.Remove(researcher);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }
    
    [HttpPost]
    public async Task<IActionResult> AddResume([FromRoute] int id, IFormFile resume)
    {
        var researcher = await _researchers.FindAsync(id);

        if (researcher == null)
            return NotFound();

        researcher.Resume = await Upload(resume, $"files/researchers/{id}");

        _dbContext.Update(researcher);

        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> DeleteResume([FromRoute] int id)
    {
        var researcher = await _researchers.FindAsync(id);

        if (researcher == null)
            return NotFound();

        researcher.Resume = "";

        _dbContext.Update(researcher);

        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    private async Task<string> Upload(IFormFile resume, string url)
    {
        var fileName = $"{Guid.NewGuid().ToString().Replace("-", "")}{Path.GetExtension(resume.FileName)}";

        if (!Directory.Exists(Path.Combine(_hostEnvironment.WebRootPath, url)))
            Directory.CreateDirectory(Path.Combine(_hostEnvironment.WebRootPath, url));

        var fullPath = Path.Combine(_hostEnvironment.WebRootPath, $"{url}/{fileName}");

        await using Stream fileStream = new FileStream(fullPath, FileMode.Create);
        await resume.CopyToAsync(fileStream);

        return $"/{url}/{fileName}";
    }
    
    private static Researcher MapResearcher(Researcher viewModel, Researcher researcher)
    {
        researcher.FirstName= viewModel.FirstName?.PersianToEnglishDigit();
        researcher.LastName= viewModel.LastName?.PersianToEnglishDigit();
        researcher.Address = viewModel.Address?.PersianToEnglishDigit();
        researcher.DomainId = viewModel.DomainId;
        researcher.ProvinceId = viewModel.ProvinceId;
        researcher.IsEnabled = viewModel.IsEnabled;
        researcher.ModifiedDate = DateTime.Now;
        return researcher;
    }
}