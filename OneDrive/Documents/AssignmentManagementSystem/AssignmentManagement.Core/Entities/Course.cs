using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Core.Entities;

public class Course
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, StringLength(20)]
    public string Code { get; set; } = string.Empty;

    // 🌟 Navigation Properties
    public ICollection<User> Students { get; set; } = new List<User>();
    public ICollection<Subject> Subjects { get; set; } = new List<Subject>();
}