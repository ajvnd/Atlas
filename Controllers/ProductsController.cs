using Atlas.Extensions;
using Atlas.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Atlas.Controllers;

public class ProductsController : Controller
{
    private readonly AtlasDbContext _dbContext;
    private readonly DbSet<Product> _products;

    public ProductsController(AtlasDbContext dbContext)
    {
        _dbContext = dbContext;
        _products = _dbContext.Set<Product>();
    }

    [HttpGet]
    public IActionResult Index()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> List([FromBody] BaseListViewModel viewModel)
    {
        var results = viewModel == null ? await _products.ToListAsync() : await ToListAsync(viewModel);

        return Ok(results);
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] Product viewModel)
    {
        var institute = MapInstitute(viewModel, new Product());

        await _products.AddAsync(institute);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost]
    public async Task<IActionResult> Edit([FromRoute] int id,
        [FromBody] Product viewModel)
    {
        var product = await _products.FindAsync(id);

        if (product == null)
            return NotFound();

        product = MapInstitute(viewModel, product);

        _dbContext.Update(product);

        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        var product = await _products.FindAsync(id);

        if (product == null)
            return NotFound();

        _products.Remove(product);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    private async Task<List<Product>> ToListAsync(BaseListViewModel viewModel)
    {
        var products = _products.Where(c => c.IsEnabled == viewModel.IsEnabled);

        if (viewModel.ProvinceIds != null)
            products = products.Where(c => c.ProvinceId != null && viewModel.ProvinceIds.Contains((int)c.ProvinceId));

        if (viewModel.DomainIds != null)
            products = products.Where(c => c.DomainId != null && viewModel.DomainIds.Contains((int)c.DomainId));

        return await products.ToListAsync();
    }

    private static Product MapInstitute(Product viewModel, Product product)
    {
        product.Title = viewModel.Title?.PersianToEnglishDigit();
        product.DomainId = viewModel.DomainId;
        product.ProvinceId = viewModel.ProvinceId;
        product.IsEnabled = viewModel.IsEnabled;
        product.ModifiedDate = DateTime.Now;
        product.Address = viewModel.Address;
        return product;
    }
}