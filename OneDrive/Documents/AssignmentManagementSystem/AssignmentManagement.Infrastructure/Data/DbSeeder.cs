using AssignmentManagement.Core.Entities;
using AssignmentManagement.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context, IPasswordHasher passwordHasher)
    {
        await context.Database.MigrateAsync();

        // 1. Seed Course & Subject
        if (!await context.Courses.AnyAsync())
        {
            var course = new Course
            {
                Name = "Class 10 - Computer Science",
                Code = "CS-10"
            };

            var subject = new Subject
            {
                Name = "Software Engineering Principles",
                Course = course
            };

            await context.Courses.AddAsync(course);
            await context.Subjects.AddAsync(subject);
            await context.SaveChangesAsync();
        }

        var defaultCourse = await context.Courses.FirstOrDefaultAsync();

        // 2. Seed Users (Admin, Teacher, Student)
        if (!await context.Users.AnyAsync())
        {
            var users = new List<User>
            {
                new User
                {
                    FullName = "System Admin",
                    Email = "admin@school.com",
                    PasswordHash = passwordHasher.HashPassword("Admin@123456"),
                    Role = UserRole.Admin
                },
                new User
                {
                    FullName = "John Doe (Teacher)",
                    Email = "teacher@school.com",
                    PasswordHash = passwordHasher.HashPassword("Teacher@123456"),
                    Role = UserRole.Teacher
                },
                new User
                {
                    FullName = "Alice Smith (Student)",
                    Email = "student@school.com",
                    PasswordHash = passwordHasher.HashPassword("Student@123456"),
                    Role = UserRole.Student,
                    // 🎯 CourseId এর বদলে Many-to-Many অনুযায়ী Courses লিস্টে কোর্স যোগ করা হলো
                    Courses = defaultCourse != null 
                        ? new List<Course> { defaultCourse } 
                        : new List<Course>()
                }
            };

            await context.Users.AddRangeAsync(users);
            await context.SaveChangesAsync();
        }
    }
}