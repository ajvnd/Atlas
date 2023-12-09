using Atlas.Extensions;
using Atlas.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Atlas.Controllers;

public class InstitutesController : Controller
{
    private readonly AtlasDbContext _dbContext;
    private readonly IWebHostEnvironment _hostEnvironment;
    private readonly DbSet<Institute> _institutes;

    public InstitutesController(AtlasDbContext dbContext, IWebHostEnvironment hostEnvironment)
    {
        _dbContext = dbContext;
        _hostEnvironment = hostEnvironment;
        _institutes = _dbContext.Set<Institute>();
    }

    [HttpGet]
    public IActionResult Index()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> List([FromBody] InstituteListViewModel viewModel)
    {
        var results = viewModel == null ? await _institutes.ToListAsync() : await ToListAsync(viewModel);

        return Ok(results);
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] Institute viewModel)
    {
        var institute = MapInstitute(viewModel, new Institute());

        await _institutes.AddAsync(institute);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost]
    public async Task<IActionResult> Edit([FromRoute] int id,
        [FromBody] Institute viewModel)
    {
        var institute = await _institutes.FindAsync(id);

        if (institute == null)
            return NotFound();

        institute = MapInstitute(viewModel, institute);

        _dbContext.Update(institute);

        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        var institute = await _institutes.FindAsync(id);

        if (institute == null)
            return NotFound();

        _institutes.Remove(institute);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost]
    public async Task<IActionResult> AddResume([FromRoute] int id, IFormFile resume)
    {
        var institute = await _institutes.FindAsync(id);

        if (institute == null)
            return NotFound();

        institute.Resume = await Upload(resume, $"files/institutes/{id}");

        _dbContext.Update(institute);

        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> DeleteResume([FromRoute] int id)
    {
        var institute = await _institutes.FindAsync(id);

        if (institute == null)
            return NotFound();

        institute.Resume = "";

        _dbContext.Update(institute);

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

    private async Task<List<Institute>> ToListAsync(InstituteListViewModel viewModel)
    {
        var institutes = _institutes.Where(c => c.IsEnabled == viewModel.IsEnabled);

        institutes = institutes.Where(c => c.IsKnowledgeBased == viewModel.IsKnowledgeBased);

        if (viewModel.ProvinceIds != null)
            institutes =
                institutes.Where(c => c.ProvinceId != null && viewModel.ProvinceIds.Contains((int)c.ProvinceId));

        if (viewModel.DomainIds != null)
            institutes = institutes.Where(c => c.DomainId != null && viewModel.DomainIds.Contains((int)c.DomainId));

        return await _institutes.ToListAsync();
    }

    private static Institute MapInstitute(Institute viewModel, Institute company)
    {
        company.Title = viewModel.Title?.PersianToEnglishDigit();
        company.Address = viewModel.Address?.PersianToEnglishDigit();
        company.DomainId = viewModel.DomainId;
        company.ProvinceId = viewModel.ProvinceId;
        company.IsEnabled = viewModel.IsEnabled;
        company.IsKnowledgeBased = viewModel.IsKnowledgeBased;
        company.ModifiedDate = DateTime.Now;

        return company;
    }
}

public class InstituteListViewModel : BaseListViewModel
{
    public bool IsKnowledgeBased { get; set; } = false;
}