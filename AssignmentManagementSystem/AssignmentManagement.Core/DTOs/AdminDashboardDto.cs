namespace AssignmentManagement.Core.DTOs;

public class AdminStatsDto
{
    public int TotalStudents { get; set; }
    public int TotalTeachers { get; set; }
    public int TotalSubjects { get; set; }
    public int TotalAssignments { get; set; }
}

public class UserDetailDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? CourseName { get; set; }
}