using AdaptiveLearningAPI.Models;
using System.Text.Json;

namespace AdaptiveLearningAPI.Data;

public static class DataSeeder
{
    public static void SeedData(AppDbContext context)
    {
        if (context.Users.Any()) return;

        // Create instructor
        var instructor = new User
        {
            Email = "instructor@example.com",
            Password = "password123",
            Name = "Dr. Sarah Johnson",
            Role = UserRole.Instructor,
            PreferredFormat = "text",
            LearningGoals = "Teaching excellence"
        };
        context.Users.Add(instructor);
        context.SaveChanges();

        // Create sample course
        var course = new Course
        {
            Title = "Introduction to Programming",
            Description = "Learn the fundamentals of programming with hands-on exercises and adaptive content.",
            InstructorId = instructor.Id
        };
        context.Courses.Add(course);
        context.SaveChanges();

        // Create modules
        var modules = new[]
        {
            new Module
            {
                Title = "Variables and Data Types",
                Content = "Learn about different data types and how to declare variables in programming.",
                ContentType = "text",
                Order = 1,
                CourseId = course.Id
            },
            new Module
            {
                Title = "Control Structures",
                Content = "Understanding if statements, loops, and conditional logic.",
                ContentType = "text",
                Order = 2,
                CourseId = course.Id
            }
        };
        
        context.Modules.AddRange(modules);
        context.SaveChanges();

        // Create sample quiz
        var quiz = new Quiz
        {
            Title = "Variables Quiz",
            ModuleId = modules[0].Id
        };
        context.Quizzes.Add(quiz);
        context.SaveChanges();

        // Create questions
        var questions = new[]
        {
            new Question
            {
                Text = "Which of the following is a valid variable name?",
                Options = JsonSerializer.Serialize(new[] { "123name", "my_variable", "class", "my-variable" }),
                CorrectAnswer = 1,
                QuizId = quiz.Id
            },
            new Question
            {
                Text = "What data type would you use to store a person's age?",
                Options = JsonSerializer.Serialize(new[] { "string", "boolean", "integer", "float" }),
                CorrectAnswer = 2,
                QuizId = quiz.Id
            }
        };
        
        context.Questions.AddRange(questions);
        context.SaveChanges();
    }
}