using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Core.DTOs;

public class RegisterDto
{
    [Required, StringLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required, StringLength(100, MinimumLength = 6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string Role { get; set; } = "Student"; // Default: Student (Options: Student, Teacher, Admin)

    public Guid? CourseId { get; set; } // Required if Role is Student
}