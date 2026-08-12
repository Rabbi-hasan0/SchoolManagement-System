using AssignmentManagement.Core.Entities;

namespace AssignmentManagement.Core.Interfaces;

public interface IJwtProvider
{
    string GenerateToken(User user);
}