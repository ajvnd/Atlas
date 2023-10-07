using Atlas.Extensions;
using Atlas.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Atlas.Controllers;

public class CompaniesController : Controller
{
    private readonly AtlasDbContext _dbContext;
    private readonly IWebHostEnvironment _hostEnvironment;
    private readonly DbSet<Company> _companies;

    public CompaniesController(AtlasDbContext dbContext, IWebHostEnvironment hostEnvironment)
    {
        _dbContext = dbContext;
        _hostEnvironment = hostEnvironment;
        _companies = _dbContext.Set<Company>();
    }

    [HttpGet]
    public IActionResult Index()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> List()
    {
        var results = await _companies.ToListAsync();

        return Ok(results);
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] Company viewModel)
    {
        var company = MapCompany(viewModel, new Company());

        await _companies.AddAsync(company);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost]
    public async Task<IActionResult> Edit([FromRoute] int id,
        [FromBody] Company viewModel)
    {
        var company = await _companies.FindAsync(id);

        if (company == null)
            return NotFound();

        company = MapCompany(viewModel, company);

        _dbContext.Update(company);

        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        var company = await _companies.FindAsync(id);

        if (company == null)
            return NotFound();

        _companies.Remove(company);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost]
    public async Task<IActionResult> AddResume([FromRoute] int id, IFormFile resume)
    {
        var company = await _companies.FindAsync(id);

        if (company == null)
            return NotFound();

        company.Resume = await Upload(resume, $"files/companies/{id}");

        _dbContext.Update(company);

        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> DeleteResume([FromRoute] int id)
    {
        var company = await _companies.FindAsync(id);

        if (company == null)
            return NotFound();

        company.Resume = "";

        _dbContext.Update(company);

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

    private static Company MapCompany(Company viewModel, Company company)
    {
        company.Title = viewModel.Title?.PersianToEnglishDigit();
        company.Address = viewModel.Address?.PersianToEnglishDigit();
        company.DomainId = viewModel.DomainId;
        company.ProvinceId = viewModel.ProvinceId;
        company.ContractTypeId = viewModel.ContractTypeId;
        company.HasSamta = viewModel.HasSamta;
        company.IsEnabled = viewModel.IsEnabled;
        company.IsKnowledgeBased = viewModel.IsKnowledgeBased;
        company.ModifiedDate = DateTime.Now;

        return company;
    }
}