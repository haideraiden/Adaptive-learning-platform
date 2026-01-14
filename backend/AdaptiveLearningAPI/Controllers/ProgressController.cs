using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AdaptiveLearningAPI.Data;

namespace AdaptiveLearningAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProgressController : ControllerBase
{
    private readonly AppDbContext _context;
    
    public ProgressController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpGet("{studentId}")]
    public async Task<IActionResult> GetProgress(int studentId)
    {
        var enrollments = await _context.Enrollments
            .Include(e => e.Course)
            .Where(e => e.UserId == studentId)
            .ToListAsync();
            
        var quizResults = await _context.QuizResults
            .Include(qr => qr.Quiz)
            .ThenInclude(q => q.Module)
            .ThenInclude(m => m.Course)
            .Where(qr => qr.UserId == studentId)
            .OrderByDescending(qr => qr.CompletedAt)
            .ToListAsync();
            
        var progress = enrollments.Select(e => new
        {
            CourseId = e.CourseId,
            CourseTitle = e.Course.Title,
            Progress = e.Progress,
            EnrolledAt = e.EnrolledAt,
            RecentQuizzes = quizResults
                .Where(qr => qr.Quiz.Module.CourseId == e.CourseId)
                .Take(3)
                .Select(qr => new
                {
                    qr.Score,
                    qr.TotalQuestions,
                    qr.CompletedAt,
                    ModuleTitle = qr.Quiz.Module.Title
                })
        });
        
        return Ok(progress);
    }
}