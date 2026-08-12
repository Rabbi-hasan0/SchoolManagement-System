using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Core.Entities;

public enum AssignmentStatus
{
    Draft = 1,
    Published = 2
}

public class Assignment
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required, StringLength(5000)]
    public string Description { get; set; } = string.Empty;

    public DateTime Deadline { get; set; }

    [Range(0, 1000)]
    public decimal MaxMarks { get; set; }

    public AssignmentStatus Status { get; set; } = AssignmentStatus.Draft;

    public Guid SubjectId { get; set; }
    public Guid TeacherId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Subject Subject { get; set; } = null!;
    public User Teacher { get; set; } = null!;
    public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
}