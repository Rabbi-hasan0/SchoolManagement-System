using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Core.DTOs;

public class CreateSubmissionDto
{
    [Required]
    public Guid AssignmentId { get; set; }

    [Required, StringLength(10000)]
    public string AnswerText { get; set; } = string.Empty;
}