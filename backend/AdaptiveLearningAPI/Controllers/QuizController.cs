using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AdaptiveLearningAPI.Data;
using AdaptiveLearningAPI.Models;
using AdaptiveLearningAPI.Services;

namespace AdaptiveLearningAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuizController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly GeminiService _geminiService;
    
    public QuizController(AppDbContext context, GeminiService geminiService)
    {
        _context = context;
        _geminiService = geminiService;
    }
    
    [HttpPost("submit")]
    public async Task<IActionResult> SubmitQuiz([FromBody] QuizSubmission submission)
    {
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .Include(q => q.Module)
            .FirstOrDefaultAsync(q => q.Id == submission.QuizId);
            
        if (quiz == null)
            return NotFound("Quiz not found");
            
        var user = await _context.Users.FindAsync(submission.UserId);
        if (user == null)
            return NotFound("User not found");
            
        int score = 0;
        for (int i = 0; i < submission.Answers.Length && i < quiz.Questions.Count; i++)
        {
            if (submission.Answers[i] == quiz.Questions.ElementAt(i).CorrectAnswer)
                score++;
        }
        
        var goals = user.LearningGoals ?? "general programming";
        var recommendation = await _geminiService.GetLearningRecommendation(
            score, quiz.Questions.Count, $"{quiz.Module.Title} (User goal: {goals})");
            
        var result = new QuizResult
        {
            UserId = submission.UserId,
            QuizId = submission.QuizId,
            Score = score,
            TotalQuestions = quiz.Questions.Count,
            AIRecommendation = recommendation
        };
        
        _context.QuizResults.Add(result);
        await _context.SaveChangesAsync();
        
        return Ok(new
        {
            Score = score,
            Total = quiz.Questions.Count,
            Percentage = (double)score / quiz.Questions.Count * 100,
            Recommendation = recommendation
        });
    }
    
    [HttpGet("{quizId}")]
    public async Task<IActionResult> GetQuiz(int quizId)
    {
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .Where(q => q.Id == quizId)
            .Select(q => new
            {
                q.Id,
                q.Title,
                Questions = q.Questions.Select(question => new
                {
                    question.Id,
                    question.Text,
                    question.Options,
                    question.CorrectAnswer
                }).ToList()
            })
            .FirstOrDefaultAsync();
            
        if (quiz == null)
            return NotFound();
            
        return Ok(quiz);
    }
}

public class QuizSubmission
{
    public int UserId { get; set; }
    public int QuizId { get; set; }
    public int[] Answers { get; set; } = Array.Empty<int>();
}