using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Core.Entities;

public class Subject
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, StringLength(100)]
    public string Name { get; set; } = string.Empty;

    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;

    // 🌟 শিক্ষক অ্যাসাইন ও অ্যাসাইনমেন্টের জন্য Navigation Properties
    public Guid? TeacherId { get; set; }
    public User? Teacher { get; set; }

    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
}