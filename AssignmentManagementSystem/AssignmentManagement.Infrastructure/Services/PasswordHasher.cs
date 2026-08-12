using AssignmentManagement.Core.Interfaces;
using BCrypt.Net;

namespace AssignmentManagement.Infrastructure.Services;

public class PasswordHasher : IPasswordHasher
{
    public string HashPassword(string password)
    {
        // WorkFactor 12 ensures high security against brute-force attacks
        return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
    }

    public bool VerifyPassword(string password, string hashedPassword)
    {
        return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
    }
}