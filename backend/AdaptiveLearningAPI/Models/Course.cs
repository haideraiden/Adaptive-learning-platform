namespace AdaptiveLearningAPI.Models;

public class Course
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int InstructorId { get; set; }
    public User Instructor { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public ICollection<Module> Modules { get; set; } = new List<Module>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
}

public class Module
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string ContentType { get; set; } = "text"; // text, video, quiz
    public int Order { get; set; }
    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;
    
    public ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
}

public class Enrollment
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int CourseId { get; set; }
    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
    public double Progress { get; set; } = 0;
    
    public User User { get; set; } = null!;
    public Course Course { get; set; } = null!;
}