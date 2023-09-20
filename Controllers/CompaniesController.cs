using Atlas.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Atlas.Controllers;

public class CompaniesController : Controller
{
    private readonly AtlasDbContext _dbContext;
    private readonly DbSet<Company> _companies;

    public CompaniesController(AtlasDbContext dbContext)
    {
        _dbContext = dbContext;
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
        var results = await _companies.AsNoTracking().ToListAsync();

        return Ok(results);
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] Company viewModel)
    {
        var company = new Company();
        
        MapCompany(company, viewModel);

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

        MapCompany(viewModel, company);

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
    
    private static void MapCompany(Company viewModel, Company company)
    {
        company.Title = viewModel.Title;
        company.Address = viewModel.Address;
        company.DomainId = viewModel.DomainId;
        company.ProvinceId = viewModel.ProvinceId;
        company.HasSamta = viewModel.HasSamta;
        company.IsEnabled = viewModel.IsEnabled;
        company.IsKnowledgeBased = viewModel.IsKnowledgeBased;
        company.ModifiedDate = DateTime.Now;
    }
}