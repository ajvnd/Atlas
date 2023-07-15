using System.Security.Claims;
using Atlas.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;

namespace Atlas.Controllers;

public class AccountController : Controller
{
    private readonly IAuthenticationService _authenticationService;
    private readonly AtlasDbContext _dbContext;

    public AccountController(IAuthenticationService authenticationService, AtlasDbContext dbContext)
    {
        _authenticationService = authenticationService;
        _dbContext = dbContext;
    }

    [HttpGet]
    public IActionResult SignIn()
    {
        return View(new User());
    }

    [HttpPost]
    public async Task<IActionResult> SignIn([FromBody]User user, string returnUrl = null)
    {
        if (_dbContext.Users.Any(c => c.UserName == user.UserName && c.Password == user.Password))
        {
            var claimsIdentity = new ClaimsIdentity(null, CookieAuthenticationDefaults.AuthenticationScheme);

            await _authenticationService.SignInAsync(HttpContext,
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity),
                new AuthenticationProperties()
            );
            
            return string.IsNullOrEmpty(returnUrl)
                ? RedirectToAction(nameof(HomeController.Index), "Home")
                : RedirectToAction(returnUrl);
        }

        ModelState.AddModelError(string.Empty, "Invalid login attempt.");
        return View();
    }

    
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> SignOut()
    {
        await _authenticationService.SignOutAsync(HttpContext, CookieAuthenticationDefaults.AuthenticationScheme,
            new AuthenticationProperties());
        return RedirectToAction(nameof(HomeController.Index), "Home");
    }

}