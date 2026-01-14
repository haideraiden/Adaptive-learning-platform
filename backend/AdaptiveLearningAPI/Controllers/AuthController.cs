using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AdaptiveLearningAPI.Data;
using AdaptiveLearningAPI.Models;

namespace AdaptiveLearningAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    
    public AuthController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpPost("signup")]
    public async Task<IActionResult> SignUp([FromBody] SignUpRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            return BadRequest("Email already exists");
            
        var user = new User
        {
            Email = request.Email,
            Password = request.Password, // In production, hash this
            Name = request.Name,
            Role = request.Role,
            PreferredFormat = request.PreferredFormat ?? "text",
            LearningGoals = request.LearningGoals ?? ""
        };
        
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        
        return Ok(new { user.Id, user.Email, user.Name, user.Role, user.PreferredFormat, user.LearningGoals });
    }
    
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.Password == request.Password);
            
        if (user == null)
            return Unauthorized("Invalid credentials");
            
        return Ok(new { user.Id, user.Email, user.Name, user.Role, user.PreferredFormat, user.LearningGoals });
    }
}

public class SignUpRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string? PreferredFormat { get; set; }
    public string? LearningGoals { get; set; }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}