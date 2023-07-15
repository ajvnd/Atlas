using Microsoft.AspNetCore.Mvc;

namespace Atlas.Controllers;

public class HomeController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}