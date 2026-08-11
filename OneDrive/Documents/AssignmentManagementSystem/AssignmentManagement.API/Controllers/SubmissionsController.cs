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
public class SubmissionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SubmissionsController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/submissions (Student submits or updates their answer)
    [HttpPost]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> SubmitAssignment([FromBody] CreateSubmissionDto dto)
    {
        var studentId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var assignment = await _context.Assignments.FindAsync(dto.AssignmentId);
        if (assignment == null || assignment.Status != AssignmentStatus.Published)
        {
            return BadRequest(new { message = "Assignment not found or not published yet." });
        }

        // Check Deadline
        if (DateTime.UtcNow > assignment.Deadline)
        {
            return BadRequest(new { message = "Deadline has passed. Submissions are closed." });
        }

        // Check existing submission
        var existingSubmission = await _context.Submissions
            .FirstOrDefaultAsync(s => s.AssignmentId == dto.AssignmentId && s.StudentId == studentId);

        if (existingSubmission != null)
        {
            // Update submission before deadline
            existingSubmission.AnswerText = dto.AnswerText;
            existingSubmission.SubmittedAt = DateTime.UtcNow;
            existingSubmission.Status = SubmissionStatus.Resubmitted;
        }
        else
        {
            // Create new submission
            var submission = new Submission
            {
                AssignmentId = dto.AssignmentId,
                StudentId = studentId,
                AnswerText = dto.AnswerText,
                SubmittedAt = DateTime.UtcNow,
                Status = SubmissionStatus.Submitted
            };

            _context.Submissions.Add(submission);
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Assignment submitted successfully!" });
    }

    // GET: api/submissions/assignment/{assignmentId} (Teacher/Admin views all submissions for an assignment with feedback)
    [HttpGet("assignment/{assignmentId}")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> GetSubmissionsByAssignment(Guid assignmentId)
    {
        var submissions = await _context.Submissions
            .Include(s => s.Student)
            .Where(s => s.AssignmentId == assignmentId)
            .Select(s => new
            {
                s.Id,
                StudentName = s.Student.FullName,
                s.AnswerText,
                s.SubmittedAt,
                s.MarksObtained,
                s.Feedback,
                Status = s.Status.ToString()
            })
            .ToListAsync();

        return Ok(submissions);
    }

    // PUT: api/submissions/{id}/grade (Teacher/Admin provides marks and feedback)
    [HttpPut("{id}/grade")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> GradeSubmission(Guid id, [FromBody] GradeSubmissionDto dto)
    {
        var submission = await _context.Submissions
            .Include(s => s.Assignment)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (submission == null)
        {
            return NotFound(new { message = "Submission not found." });
        }

        if (dto.MarksObtained > submission.Assignment.MaxMarks)
        {
            return BadRequest(new { message = $"Marks cannot exceed maximum marks ({submission.Assignment.MaxMarks})." });
        }

        submission.MarksObtained = dto.MarksObtained;
        submission.Feedback = dto.Feedback;
        submission.Status = SubmissionStatus.Evaluated;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Grade and feedback saved successfully!" });
    }

    // GET: api/submissions/my-submissions (Student views all their own submissions with grades & feedback)
    [HttpGet("my-submissions")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetMySubmissions()
    {
        var studentId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var mySubmissions = await _context.Submissions
            .Include(s => s.Assignment)
            .ThenInclude(a => a.Subject)
            .Where(s => s.StudentId == studentId)
            .Select(s => new
            {
                s.Id,
                s.AssignmentId,
                AssignmentTitle = s.Assignment.Title,
                SubjectName = s.Assignment.Subject.Name,
                s.AnswerText,
                s.SubmittedAt,
                s.MarksObtained,
                MaxMarks = s.Assignment.MaxMarks,
                s.Feedback,
                Status = s.Status.ToString()
            })
            .ToListAsync();

        return Ok(mySubmissions);
    }
}