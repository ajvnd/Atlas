using Atlas.Extensions;
using Atlas.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Atlas.Controllers;

public class ContractTypesController : Controller
{
    private readonly AtlasDbContext _dbContext;
    private readonly DbSet<ContractType> _contractTypes;

    public ContractTypesController(AtlasDbContext dbContext)
    {
        _dbContext = dbContext;
        _contractTypes = _dbContext.Set<ContractType>();
    }


    [HttpGet]
    public IActionResult Index()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> List()
    {
        var results = await _contractTypes.ToListAsync();

        return Ok(results);
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] ContractType viewModel)
    {
        var contractType = MapContractType(viewModel, new ContractType());

        await _contractTypes.AddAsync(contractType);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost]
    public async Task<IActionResult> Edit([FromRoute] int id,
        [FromBody] ContractType viewModel)
    {
        var contractType = await _contractTypes.FindAsync(id);

        if (contractType == null)
            return NotFound();

        contractType = MapContractType(viewModel, contractType);

        _contractTypes.Update(contractType);
        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        var contractType = await _contractTypes.FindAsync(id);

        if (contractType == null)
            return NotFound();

        _contractTypes.Remove(contractType);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }
    
    private static ContractType MapContractType(ContractType viewModel, ContractType contractType)
    {
        contractType.Title = viewModel.Title.PersianToEnglishDigit();
        contractType.ModifiedDate = DateTime.Now;

        return contractType;
    }
}