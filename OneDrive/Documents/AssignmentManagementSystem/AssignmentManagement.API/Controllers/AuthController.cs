using AssignmentManagement.Core.DTOs;
using AssignmentManagement.Core.Entities;
using AssignmentManagement.Core.Interfaces;
using AssignmentManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtProvider _jwtProvider;

    public AuthController(AppDbContext context, IPasswordHasher passwordHasher, IJwtProvider jwtProvider)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtProvider = jwtProvider;
    }

    // POST: api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var token = _jwtProvider.GenerateToken(user);

        return Ok(new AuthResponse
        {
            Token = token,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role.ToString()
        });
    }

    // POST: api/auth/register (Only Admin can create new users)
    [HttpPost("register")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        // 1. Check if email already exists
        var existingUser = await _context.Users.AnyAsync(u => u.Email == dto.Email);
        if (existingUser)
        {
            return BadRequest(new { message = "Email is already registered." });
        }

        // 2. Parse Role
        if (!Enum.TryParse<UserRole>(dto.Role, true, out var parsedRole))
        {
            return BadRequest(new { message = "Invalid Role. Allowed values: Student, Teacher, Admin." });
        }

        // 3. Hash Password
        var passwordHash = _passwordHasher.HashPassword(dto.Password);

        // 4. Create User Entity
        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = passwordHash,
            Role = parsedRole,
            CreatedAt = DateTime.UtcNow
        };

        // 🎯 dto.Role কে string তুলনা করে ফিক্স করা হলো
        if (dto.Role == UserRole.Student.ToString() && dto.CourseId.HasValue && dto.CourseId.Value != Guid.Empty)
        {
            var course = await _context.Courses.FindAsync(dto.CourseId.Value);
            if (course != null)
            {
                user.Courses.Add(course);
            }
        }

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"User ({dto.FullName}) registered successfully as {parsedRole}!" });
    }
}