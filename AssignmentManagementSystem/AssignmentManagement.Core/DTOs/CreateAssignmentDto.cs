using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Core.DTOs;

public class CreateAssignmentDto
{
    [Required, StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required, StringLength(5000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public DateTime Deadline { get; set; }

    [Required, Range(1, 1000)]
    public decimal MaxMarks { get; set; }

    [Required]
    public Guid SubjectId { get; set; }

    public bool IsPublished { get; set; } = true;
}