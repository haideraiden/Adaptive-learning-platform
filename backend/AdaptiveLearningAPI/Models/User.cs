namespace AdaptiveLearningAPI.Models;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string PreferredFormat { get; set; } = "text"; // video, text, quiz
    public string LearningGoals { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<QuizResult> QuizResults { get; set; } = new List<QuizResult>();
}

public enum UserRole
{
    Student,
    Instructor
}