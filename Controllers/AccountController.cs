using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
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
    public async Task<IActionResult> SignIn([FromBody] User model, string returnUrl = null)
    {
        var hashPassword = CreatePassword(model.Password);
        var user = _dbContext.Users.FirstOrDefault(c => c.UserName == model.UserName && c.Password == hashPassword);

        if (user != null)
        {
            var claimsIdentity = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.UserName),
                    new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}")
                }, CookieAuthenticationDefaults.AuthenticationScheme
            );

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

    public string CreatePassword(string password)
    {
        using var sha256 = SHA256.Create();
        var secretBytes = Encoding.UTF8.GetBytes(password);
        var secretHash = sha256.ComputeHash(secretBytes);
        return Convert.ToHexString(secretHash);
    }
}