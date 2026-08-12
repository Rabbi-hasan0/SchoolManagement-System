using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Core.Entities;

public enum UserRole
{
    Admin = 1,
    Teacher = 2,
    Student = 3
}

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, StringLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }

    public ICollection<Course> Courses { get; set; } = new List<Course>();
    public ICollection<Subject> TeachingSubjects { get; set; } = new List<Subject>();

    public int FailedLoginAttempts { get; set; } = 0;
    public DateTimeOffset? LockoutEnd { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Assignment> CreatedAssignments { get; set; } = new List<Assignment>();
    public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
}