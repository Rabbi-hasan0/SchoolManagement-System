using AssignmentManagement.Core.DTOs;
using AssignmentManagement.Core.Entities;
using AssignmentManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AssignmentManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] 
public class CoursesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CoursesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/courses (Safe Anonymous Selection)
    [HttpGet]
    public async Task<IActionResult> GetCourses()
    {
        try
        {
            var rawCourses = await _context.Courses
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Code,
                    SubjectsCount = c.Subjects.Count,
                    StudentsCount = c.Students.Count,
                    // 🎯 Guid? থেকে সরাসরি নিশ্চিত করা হচ্ছে যেন Non-null Guid পাওয়া যায়
                    TeacherIds = c.Subjects
                        .Where(s => s.TeacherId.HasValue && s.TeacherId.Value != Guid.Empty)
                        .Select(s => s.TeacherId!.Value)
                        .ToList(),
                    StudentIds = c.Students
                        .Select(s => s.Id)
                        .ToList()
                })
                .ToListAsync();
            
            var courses = rawCourses.Select(c => new
            {
                c.Id,
                c.Name,
                c.Code,
                c.SubjectsCount,
                c.StudentsCount,
                AssignedTeacherIds = c.TeacherIds
                    .Where(id => id != Guid.Empty)
                    .Select(id => id.ToString().ToLower())
                    .Distinct()
                    .ToList(),
                AssignedStudentIds = c.StudentIds
                    .Select(id => id.ToString().ToLower())
                    .Distinct()
                    .ToList()
            });

            return Ok(courses);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error fetching courses", error = ex.Message });
        }
    }

    // POST: api/courses (Admin Only - Create Course/Class)
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateCourse([FromBody] CreateCourseDto dto)
    {
        var course = new Course
        {
            Name = dto.Name,
            Code = dto.Code
        };

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        return Ok(new CourseResponseDto { Id = course.Id, Name = course.Name, Code = course.Code });
    }

    // PUT: api/courses/{id} (Admin Only)
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateCourse(Guid id, [FromBody] CreateCourseDto dto)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null)
            return NotFound(new { message = "Course not found." });

        course.Name = dto.Name;
        course.Code = dto.Code;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Course updated successfully!" });
    }

    // DELETE: api/courses/{id} (Admin Only)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCourse(Guid id)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null)
            return NotFound(new { message = "Course not found." });

        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Course deleted successfully!" });
    }   

    // POST: api/courses/{courseId}/subjects (Admin Only - Add Subject under Course)
    [HttpPost("{courseId}/subjects")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddSubjectToCourse(Guid courseId, [FromBody] CreateSubjectDto dto)
    {
        var course = await _context.Courses.FindAsync(courseId);
        if (course == null)
            return NotFound(new { message = "Course not found." });

        var subject = new Subject
        {
            Name = dto.Name,
            CourseId = courseId
        };

        _context.Subjects.Add(subject);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Subject added to course successfully!", subjectId = subject.Id });
    }

    // POST: api/courses/{courseId}/assign-teachers (Admin Only)
    [HttpPost("{courseId}/assign-teachers")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignTeachersToCourse(Guid courseId, [FromBody] AssignTeachersDto dto)
    {
        var course = await _context.Courses
            .Include(c => c.Subjects)
            .FirstOrDefaultAsync(c => c.Id == courseId);

        if (course == null)
            return NotFound(new { message = "Course not found." });

        var selectedTeacherIds = dto.TeacherIds ?? new List<Guid>();

        // 🎯 ১. সিলেক্টেড টিচার না থাকলে কোর্সের সব সাবজেক্টের টিচার নাল করা (Uncheck All)
        if (!selectedTeacherIds.Any())
        {
            foreach (var subject in course.Subjects)
            {
                subject.TeacherId = null;
            }
        }
        else
        {
            var subjectsList = course.Subjects.ToList();

            // 🎯 ২. সাবজেক্ট সংখ্যা নির্বাচন করা টিচারের চেয়ে কম হলে নতুন প্রয়োজন অনুযায়ী সাবজেক্ট তৈরি করা
            while (subjectsList.Count < selectedTeacherIds.Count)
            {
                var newSub = new Subject
                {
                    Name = $"{course.Name} - Section {subjectsList.Count + 1}",
                    CourseId = course.Id
                };
                _context.Subjects.Add(newSub);
                subjectsList.Add(newSub);
            }

            // 🎯 ৩. প্রতিটি নির্বাচিত টিচারকে আলাদা সাবজেক্টে অ্যাসাইন নিশ্চিত করা
            for (int i = 0; i < subjectsList.Count; i++)
            {
                if (i < selectedTeacherIds.Count)
                {
                    subjectsList[i].TeacherId = selectedTeacherIds[i];
                }
                else
                {
                    subjectsList[i].TeacherId = selectedTeacherIds[i % selectedTeacherIds.Count];
                }
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Teacher assignments saved successfully!" });
    }

    // POST: api/courses/{courseId}/assign-students
    [HttpPost("{courseId}/assign-students")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignStudentsToCourse(Guid courseId, [FromBody] AssignStudentsDto dto)
    {
        var course = await _context.Courses
            .Include(c => c.Students)
            .FirstOrDefaultAsync(c => c.Id == courseId);

        if (course == null)
            return NotFound(new { message = "Course not found." });

        var selectedStudentIds = dto.StudentIds ?? new List<Guid>();

        var selectedStudents = await _context.Users
            .Where(u => selectedStudentIds.Contains(u.Id) && u.Role == UserRole.Student)
            .ToListAsync();

        course.Students = selectedStudents;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Students assigned to course successfully!" });
    }
    
    // GET: api/courses/my-assigned-courses (Teacher Only)
    [HttpGet("my-assigned-courses")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> GetMyAssignedCourses()
    {
        var teacherIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(teacherIdStr, out var teacherId))
        {
            return Unauthorized(new { message = "Invalid token user ID." });
        }

        var assignedSubjects = await _context.Subjects
            .Include(s => s.Course)
            .Where(s => s.TeacherId == teacherId)
            .Select(s => new
            {
                SubjectId = s.Id,
                SubjectName = s.Name,
                CourseId = s.CourseId,
                CourseName = s.Course != null ? s.Course.Name : "N/A",
                CourseCode = s.Course != null ? s.Course.Code : "N/A"
            })
            .ToListAsync();

        return Ok(assignedSubjects);
    }
}

// --- DTOs Used in Controller ---

public class CreateSubjectDto
{
    public string Name { get; set; } = string.Empty;
}

public class AssignTeacherDto
{
    public List<Guid> TeacherIds { get; set; } = new List<Guid>();
}

public class AssignTeachersDto
{
    public List<Guid> TeacherIds { get; set; } = new();
}

public class AssignStudentsDto
{
    public List<Guid> StudentIds { get; set; } = new();
}