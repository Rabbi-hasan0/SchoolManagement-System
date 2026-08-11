using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Core.Entities;

public enum SubmissionStatus
{
    Submitted = 1,
    Evaluated = 2,
    Resubmitted = 3
}

public class Submission
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, StringLength(10000)]
    public string AnswerText { get; set; } = string.Empty;

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    [Range(0, 1000)]
    public decimal? MarksObtained { get; set; }

    [StringLength(2000)]
    public string? Feedback { get; set; }

    public SubmissionStatus Status { get; set; } = SubmissionStatus.Submitted;

    public Guid AssignmentId { get; set; }
    public Guid StudentId { get; set; }

    public Assignment Assignment { get; set; } = null!;
    public User Student { get; set; } = null!;
}