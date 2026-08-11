using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Core.DTOs;

public class GradeSubmissionDto
{
    [Required, Range(0, 1000)]
    public decimal MarksObtained { get; set; }

    [StringLength(2000)]
    public string Feedback { get; set; } = string.Empty;
}