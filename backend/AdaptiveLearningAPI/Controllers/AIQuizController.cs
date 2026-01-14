using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AdaptiveLearningAPI.Data;
using AdaptiveLearningAPI.Models;
using AdaptiveLearningAPI.Services;
using System.Text.Json;

namespace AdaptiveLearningAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AIQuizController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly GeminiService _geminiService;
    
    public AIQuizController(AppDbContext context, GeminiService geminiService)
    {
        _context = context;
        _geminiService = geminiService;
    }
    
    [HttpPost("generate")]
    public async Task<IActionResult> GenerateAIQuiz([FromBody] GenerateQuizRequest request)
    {
        var user = await _context.Users.FindAsync(request.UserId);
        if (user == null)
            return NotFound("User not found");
            
        var module = await _context.Modules.FindAsync(request.ModuleId);
        if (module == null)
            return NotFound("Module not found");
            
        // Generate AI questions
        var questionsJson = await _geminiService.GenerateQuizQuestions(
            module.Title, 
            user.LearningGoals ?? "general programming", 
            request.QuestionCount);
            
        try
        {
            Console.WriteLine($"AI Response: {questionsJson}");
            
            // Clean the response - remove markdown formatting if present
            var cleanJson = questionsJson.Trim();
            if (cleanJson.StartsWith("```json"))
            {
                cleanJson = cleanJson.Substring(7);
            }
            if (cleanJson.EndsWith("```"))
            {
                cleanJson = cleanJson.Substring(0, cleanJson.Length - 3);
            }
            cleanJson = cleanJson.Trim();
            
            var aiQuestions = JsonSerializer.Deserialize<AIQuestionData[]>(cleanJson);
            
            if (aiQuestions == null || aiQuestions.Length == 0)
            {
                return BadRequest("AI generated no questions. Please try again.");
            }
            
            // Create quiz
            var quiz = new Quiz
            {
                Title = $"AI Generated Quiz: {module.Title}",
                ModuleId = request.ModuleId
            };
            
            _context.Quizzes.Add(quiz);
            await _context.SaveChangesAsync();
            
            // Create questions
            var questions = aiQuestions.Select(aq => new Question
            {
                Text = aq.text,
                Options = JsonSerializer.Serialize(aq.options),
                CorrectAnswer = aq.correctAnswer,
                QuizId = quiz.Id
            }).ToList();
            
            _context.Questions.AddRange(questions);
            await _context.SaveChangesAsync();
            
            return Ok(new { quizId = quiz.Id, message = "AI Quiz generated successfully!" });
        }
        catch (JsonException ex)
        {
            Console.WriteLine($"JSON Parse Error: {ex.Message}");
            Console.WriteLine($"Raw AI Response: {questionsJson}");
            return BadRequest($"Failed to parse AI response: {ex.Message}");
        }
    }
}

public class GenerateQuizRequest
{
    public int UserId { get; set; }
    public int ModuleId { get; set; }
    public int QuestionCount { get; set; } = 3;
}

public class AIQuestionData
{
    public string text { get; set; } = string.Empty;
    public string[] options { get; set; } = Array.Empty<string>();
    public int correctAnswer { get; set; }
}