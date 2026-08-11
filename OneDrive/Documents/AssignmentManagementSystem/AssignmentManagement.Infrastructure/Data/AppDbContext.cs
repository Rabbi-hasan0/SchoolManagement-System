using AssignmentManagement.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<Assignment> Assignments => Set<Assignment>();
    public DbSet<Submission> Submissions => Set<Submission>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // --- Fast Queries & Indexes ---
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Role);

        modelBuilder.Entity<Course>()
            .HasIndex(c => c.Code)
            .IsUnique();

        modelBuilder.Entity<Subject>()
            .HasIndex(s => s.CourseId);

        modelBuilder.Entity<Assignment>()
            .HasIndex(a => a.SubjectId);
        modelBuilder.Entity<Assignment>()
            .HasIndex(a => a.TeacherId);
        modelBuilder.Entity<Assignment>()
            .HasIndex(a => a.Deadline);
        modelBuilder.Entity<Assignment>()
            .HasIndex(a => a.Status);

        modelBuilder.Entity<Submission>()
            .HasIndex(s => new { s.AssignmentId, s.StudentId })
            .IsUnique();

        // --- Foreign Key Restrictions ---
        modelBuilder.Entity<Assignment>()
            .HasOne(a => a.Teacher)
            .WithMany(u => u.CreatedAssignments)
            .HasForeignKey(a => a.TeacherId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Submission>()
            .HasOne(s => s.Student)
            .WithMany(u => u.Submissions)
            .HasForeignKey(s => s.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        // --- Decimal Precision ---
        modelBuilder.Entity<Assignment>()
            .Property(a => a.MaxMarks)
            .HasPrecision(5, 2);

        modelBuilder.Entity<Submission>()
            .Property(s => s.MarksObtained)
            .HasPrecision(5, 2);
    }
}