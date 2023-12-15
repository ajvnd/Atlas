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
    public async Task<IActionResult> List(CompanyListViewModel viewModel)
    {
        var results = viewModel == null ? await _companies.ToListAsync() : await ToListAsync(viewModel);

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

    private async Task<List<Company>> ToListAsync(CompanyListViewModel viewModel)
    {
        var companies = _companies.Where(c => c.IsEnabled == viewModel.IsEnabled);

        companies = companies.Where(c => c.IsKnowledgeBased == viewModel.IsKnowledgeBased);

        companies = companies.Where(c => c.IsKnowledgeBased == viewModel.HasSamta);

        if (!string.IsNullOrEmpty(viewModel.Text?.PersianToEnglishDigit()))
            companies = companies.Where(c => c.Title.Contains(viewModel.Text));


        if (viewModel.ProvinceIds != null)
            companies =
                companies.Where(c => c.ProvinceId != null && viewModel.ProvinceIds.Contains((int)c.ProvinceId));

        if (viewModel.DomainIds != null)
            companies = companies.Where(c => c.DomainId != null && viewModel.DomainIds.Contains((int)c.DomainId));

        if (viewModel.ContractTypeIds != null)
            companies = companies.Where(c =>
                c.ContractTypeId != null && viewModel.ContractTypeIds.Contains((int)c.ContractTypeId));

        return await companies.ToListAsync();
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

public class CompanyListViewModel : BaseListViewModel
{
    public int[] ContractTypeIds { get; set; }
    public bool IsKnowledgeBased { get; set; }
    public bool HasSamta { get; set; }
}