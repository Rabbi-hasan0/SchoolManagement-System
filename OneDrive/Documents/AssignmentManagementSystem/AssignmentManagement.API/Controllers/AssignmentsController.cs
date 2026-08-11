using System.Security.Claims;
using AssignmentManagement.Core.DTOs;
using AssignmentManagement.Core.Entities;
using AssignmentManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssignmentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AssignmentsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/assignments (Role-based filtering for Admin, Teacher, Student)
    [HttpGet]
    public async Task<IActionResult> GetAssignments()
    {
        var userRole = User.FindFirstValue(ClaimTypes.Role);
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized(new { message = "Invalid token user ID." });
        }

        IQueryable<Assignment> query = _context.Assignments
            .Include(a => a.Subject)
                .ThenInclude(s => s.Course)
            .Include(a => a.Teacher)
            .Include(a => a.Submissions);

        if (userRole == "Teacher")
        {
            // 🎯 শিক্ষক শুধুমাত্র তার নিজের তৈরি অ্যাসাইনমেন্ট দেখবেন
            query = query.Where(a => a.TeacherId == userId);
        }
        else if (userRole == "Student")
        {
            // 🎯 স্টুডেন্টের এনরোল করা সবকটি কোর্স (Many-to-Many) ইনক্লুড করা
            var student = await _context.Users
                .Include(u => u.Courses)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (student == null || !student.Courses.Any())
            {
                return Ok(new List<object>()); // স্টুডেন্ট কোনো কোর্সে অ্যাসাইনড না থাকলে ফাঁকা লিস্ট যাবে
            }

            // 🎯 স্টুডেন্টের সবকটি এনরোল করা কোর্সের আইডি বের করা
            var studentCourseIds = student.Courses.Select(c => c.Id).ToList();

            // 🎯 স্টুডেন্ট তার এনরোল করা যেকোনো কোর্সের অধীনে থাকা Published অ্যাসাইনমেন্ট দেখবে
            query = query.Where(a => a.Status == AssignmentStatus.Published 
                                 && a.Subject != null 
                                 && studentCourseIds.Contains(a.Subject.CourseId));
        }

        var result = await query.Select(a => new
        {
            a.Id,
            a.Title,
            a.Description,
            a.Deadline,
            a.MaxMarks,
            Status = a.Status.ToString(),
            SubjectId = a.SubjectId,
            SubjectName = a.Subject != null ? a.Subject.Name : "N/A",
            CourseName = a.Subject != null && a.Subject.Course != null ? a.Subject.Course.Name : "N/A",
            CourseCode = a.Subject != null && a.Subject.Course != null ? a.Subject.Course.Code : "N/A",
            TeacherName = a.Teacher != null ? a.Teacher.FullName : "N/A",
            a.CreatedAt,
            // 🎯 স্টুডেন্টের নিজের সাবমিশন
            MySubmission = a.Submissions
                .Where(sub => sub.StudentId == userId)
                .Select(sub => new
                {
                    sub.Id,
                    sub.AnswerText,
                    sub.SubmittedAt,
                    sub.MarksObtained,
                    sub.Feedback,
                    sub.Status
                })
                .FirstOrDefault()
        }).ToListAsync();

        return Ok(result);
    }

    // POST: api/assignments (Only Teachers & Admin)
    [HttpPost]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> CreateAssignment([FromBody] CreateAssignmentDto dto)
    {
        var teacherId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // 🔍 ১. ড্রপডাউন থেকে পাঠানো SubjectId টেস্ট করা
        var targetSubjectId = dto.SubjectId;
        var subjectExists = await _context.Subjects.AnyAsync(s => s.Id == targetSubjectId);

        // 🔍 ২. যদি পাঠানো SubjectId না পাওয়া যায়, ডাটাবেজ থেকে প্রথম বিদ্যমান SubjectId টি নেওয়া
        if (!subjectExists)
        {
            var firstSubject = await _context.Subjects.FirstOrDefaultAsync();
            if (firstSubject == null)
            {
                return BadRequest(new { message = "No subjects available in system. Please create a subject first." });
            }
            targetSubjectId = firstSubject.Id;
        }

        var assignment = new Assignment
        {
            Title = dto.Title,
            Description = dto.Description,
            Deadline = dto.Deadline,
            MaxMarks = dto.MaxMarks,
            Status = dto.IsPublished ? AssignmentStatus.Published : AssignmentStatus.Draft,
            SubjectId = targetSubjectId,
            TeacherId = teacherId
        };

        _context.Assignments.Add(assignment);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Assignment created successfully!" });
    }

    // PUT: api/assignments/{id} (Teacher Update Assignment)
    [HttpPut("{id}")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> UpdateAssignment(Guid id, [FromBody] CreateAssignmentDto dto)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null)
        {
            return NotFound(new { message = "Assignment not found." });
        }

        assignment.Title = dto.Title;
        assignment.Description = dto.Description;
        assignment.Deadline = dto.Deadline;
        assignment.MaxMarks = dto.MaxMarks;
        assignment.Status = dto.IsPublished ? AssignmentStatus.Published : AssignmentStatus.Draft;

        // 🔒 SubjectId Validation: ডাটাবেজে SubjectExists কিনা তা নিশ্চিত করা
        if (dto.SubjectId != Guid.Empty)
        {
            var subjectExists = await _context.Subjects.AnyAsync(s => s.Id == dto.SubjectId);
            if (subjectExists)
            {
                assignment.SubjectId = dto.SubjectId;
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Assignment updated successfully!" });
    }

    // DELETE: api/assignments/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> DeleteAssignment(Guid id)
    {
        var assignment = await _context.Assignments
            .Include(a => a.Submissions) // 👈 সাবমিশনগুলোসহ ইনক্লুড করা
            .FirstOrDefaultAsync(a => a.Id == id);

        if (assignment == null)
        {
            return NotFound(new { message = "Assignment not found." });
        }

        // 🔒 সংশ্লিষ্ট সব Submissions আগে রিমুভ করা
        if (assignment.Submissions.Any())
        {
            _context.Submissions.RemoveRange(assignment.Submissions);
        }

        _context.Assignments.Remove(assignment);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Assignment deleted successfully!" });
    }
}   