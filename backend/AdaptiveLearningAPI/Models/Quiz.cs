namespace AdaptiveLearningAPI.Models;

public class Quiz
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int ModuleId { get; set; }
    public Module Module { get; set; } = null!;
    
    public ICollection<Question> Questions { get; set; } = new List<Question>();
    public ICollection<QuizResult> Results { get; set; } = new List<QuizResult>();
}

public class Question
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string Options { get; set; } = string.Empty; // JSON array
    public int CorrectAnswer { get; set; }
    public int QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;
}

public class QuizResult
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int QuizId { get; set; }
    public int Score { get; set; }
    public int TotalQuestions { get; set; }
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
    public string AIRecommendation { get; set; } = string.Empty;
    
    public User User { get; set; } = null!;
    public Quiz Quiz { get; set; } = null!;
}