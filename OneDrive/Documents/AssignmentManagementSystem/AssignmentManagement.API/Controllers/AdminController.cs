using AssignmentManagement.Core.DTOs;
using AssignmentManagement.Core.Entities;
using AssignmentManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")] // 🔒 শুধুমাত্র Admin এক্সেস পাবে
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/admin/stats (ড্যাশবোর্ড সামারি)
    [HttpGet("stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var stats = new AdminStatsDto
        {
            TotalStudents = await _context.Users.CountAsync(u => u.Role == UserRole.Student),
            TotalTeachers = await _context.Users.CountAsync(u => u.Role == UserRole.Teacher),
            TotalSubjects = await _context.Subjects.CountAsync(),
            TotalAssignments = await _context.Assignments.CountAsync()
        };

        return Ok(stats);
    }

    // GET: api/admin/users (সব টিচার, স্টুডেন্ট ও তাদের কোর্স ডিটেইলস)
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers([FromQuery] string? role = null)
    {
        var query = _context.Users
            .Include(u => u.Courses)
            .AsQueryable();

        if (!string.IsNullOrEmpty(role) && Enum.TryParse<UserRole>(role, true, out var parsedRole))
        {
            query = query.Where(u => u.Role == parsedRole);
        }

        var users = await query.Select(u => new UserDetailDto
        {
            Id = u.Id,
            FullName = u.FullName,
            Email = u.Email,
            Role = u.Role.ToString(),
            CourseName = u.Courses.Any() 
                ? string.Join(", ", u.Courses.Select(c => c.Name)) 
                : "N/A"
        }).ToListAsync();

        return Ok(users);
    }

    // PUT: api/admin/users/{id}
    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        if (!Enum.TryParse<UserRole>(dto.Role, true, out var parsedRole))
        {
            return BadRequest(new { message = "Invalid Role value." });
        }

        user.FullName = dto.FullName;
        user.Role = parsedRole;

        await _context.SaveChangesAsync();

        return Ok(new { message = "User updated successfully!" });
    }

    // DELETE: api/admin/users/{id}
    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "User deleted successfully!" });
    }

    // GET: api/admin/users/{id}/details
    [HttpGet("users/{id}/details")]
    public async Task<IActionResult> GetUserDetails(Guid id)
    {
        var user = await _context.Users
            .Include(u => u.Courses)
                .ThenInclude(c => c.Subjects)
            .Include(u => u.TeachingSubjects)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        // Teacher-এর তৈরি করা অ্যাসাইনমেন্টসমূহ
        var createdAssignments = await _context.Assignments
            .Where(a => a.TeacherId == id)
            .Select(a => new { a.Id, a.Title, a.Deadline, a.MaxMarks, Status = a.Status.ToString() })
            .ToListAsync();

        // 🎯 ইউজারের ভূমিকা অনুযায়ী Courses/Subjects ফিল্টার করা
        object assignedCourses;

        if (user.Role == UserRole.Student && user.Courses.Any())
        {
            // 🎯 স্টুডেন্টের সবকটি এনরোল করা কোর্স (Many-to-Many)
            assignedCourses = user.Courses.Select(c => new
            {
                c.Id,
                c.Name,
                c.Code,
                Subjects = c.Subjects.Select(s => new { s.Id, s.Name }).ToList()
            }).ToList();
        }
        else if (user.Role == UserRole.Teacher && user.TeachingSubjects.Any())
        {
            assignedCourses = user.TeachingSubjects.Select(s => new 
            { 
                s.Id, 
                s.Name, 
                Code = "SUBJECT",
                Subjects = new object[] { }
            }).ToList();
        }
        else
        {
            // System-wide Courses Overview (Fallback)
            assignedCourses = await _context.Courses
                .Select(c => new { c.Id, c.Name, c.Code, Subjects = c.Subjects.Select(s => new { s.Id, s.Name }).ToList() })
                .ToListAsync();
        }

        return Ok(new
        {
            user.Id,
            user.FullName,
            user.Email,
            Role = user.Role.ToString(),
            user.CreatedAt,
            TotalAssignmentsCreated = createdAssignments.Count,
            Assignments = createdAssignments,
            AssignedCourses = assignedCourses
        });
    }

    // GET: api/admin/assignments-overview
    [HttpGet("assignments-overview")]
    public async Task<IActionResult> GetAssignmentsOverview()
    {
        var assignments = await _context.Assignments
            .Include(a => a.Teacher)
            .Include(a => a.Subject)
                .ThenInclude(s => s.Course)
            .Include(a => a.Submissions)
                .ThenInclude(sub => sub.Student)
            .Select(a => new
            {
                a.Id,
                a.Title,
                a.Description,
                a.Deadline,
                a.MaxMarks,
                TeacherName = a.Teacher != null ? a.Teacher.FullName : "Unknown",
                TeacherEmail = a.Teacher != null ? a.Teacher.Email : "",
                CourseName = a.Subject != null && a.Subject.Course != null ? a.Subject.Course.Name : "N/A",
                SubjectName = a.Subject != null ? a.Subject.Name : "N/A",
                SubmissionsCount = a.Submissions.Count,
                Submissions = a.Submissions.Select(sub => new
                {
                    sub.Id,
                    StudentName = sub.Student != null ? sub.Student.FullName : "Student",
                    StudentEmail = sub.Student != null ? sub.Student.Email : "",
                    sub.AnswerText,
                    sub.SubmittedAt,
                    sub.MarksObtained,
                    sub.Feedback,
                    Status = sub.Status.ToString()
                }).ToList()
            })
            .ToListAsync();

        return Ok(assignments);
    }

}