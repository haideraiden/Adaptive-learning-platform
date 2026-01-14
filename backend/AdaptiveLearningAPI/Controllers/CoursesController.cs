using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AdaptiveLearningAPI.Data;
using AdaptiveLearningAPI.Models;

namespace AdaptiveLearningAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly AppDbContext _context;
    
    public CoursesController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetCourses()
    {
        var courses = await _context.Courses
            .Include(c => c.Instructor)
            .Include(c => c.Modules)
            .Select(c => new
            {
                c.Id,
                c.Title,
                c.Description,
                Instructor = c.Instructor.Name,
                ModuleCount = c.Modules.Count
            })
            .ToListAsync();
            
        return Ok(courses);
    }
    
    [HttpPost("enroll")]
    public async Task<IActionResult> EnrollInCourse([FromBody] EnrollRequest request)
    {
        var existingEnrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.UserId == request.UserId && e.CourseId == request.CourseId);
            
        if (existingEnrollment != null)
            return BadRequest("Already enrolled");
            
        var enrollment = new Enrollment
        {
            UserId = request.UserId,
            CourseId = request.CourseId
        };
        
        _context.Enrollments.Add(enrollment);
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "Enrolled successfully", success = true });
    }
    
    [HttpGet("{courseId}/modules")]
    public async Task<IActionResult> GetCourseModules(int courseId)
    {
        var modules = await _context.Modules
            .Where(m => m.CourseId == courseId)
            .OrderBy(m => m.Order)
            .ToListAsync();
            
        return Ok(modules);
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateCourse([FromBody] CreateCourseRequest request)
    {
        var course = new Course
        {
            Title = request.Title,
            Description = request.Description,
            InstructorId = request.InstructorId
        };
        
        _context.Courses.Add(course);
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "Course created successfully", courseId = course.Id });
    }
}

public class EnrollRequest
{
    public int UserId { get; set; }
    public int CourseId { get; set; }
}

public class CreateCourseRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int InstructorId { get; set; }
}