using System.Text;
using System.Text.Json;

namespace AdaptiveLearningAPI.Services;

public class GeminiService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey = "AIzaSyCYYqZHG8bZsDYtxZpgsOGuhlpEzWTRFVM";
    
    public GeminiService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }
    
    public async Task<string> GetLearningRecommendation(int score, int totalQuestions, string topic)
    {
        var prompt = $@"You are a learning assistant. A student has completed a module on '{topic}' with a score of {score}/{totalQuestions}. 
        Based on this performance, suggest:
        1. Next topics to study
        2. Recommended format (video, text, quiz)
        3. Personalized study tips
        4. Encouraging message
        
        Keep the response concise and motivating.";
        
        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            }
        };
        
        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        var response = await _httpClient.PostAsync(
            $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={_apiKey}",
            content);
            
        if (response.IsSuccessStatusCode)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseContent);
            return geminiResponse?.candidates?[0]?.content?.parts?[0]?.text ?? "Keep practicing!";
        }
        
        return "Great job! Continue learning at your own pace.";
    }
    
    public async Task<string> GenerateQuizQuestions(string topic, string userGoals, int questionCount = 3)
    {
        var prompt = $@"Generate {questionCount} multiple choice questions about '{topic}' for someone whose learning goal is '{userGoals}'.
        
        Return ONLY a JSON array in this exact format:
        [
          {{
            ""text"": ""Question text here?"",
            ""options"": [""Option A"", ""Option B"", ""Option C"", ""Option D""],
            ""correctAnswer"": 0
          }}
        ]
        
        Make questions relevant to {userGoals}. Use 0-based indexing for correctAnswer.";
        
        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            }
        };
        
        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        var response = await _httpClient.PostAsync(
            $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={_apiKey}",
            content);
            
        if (response.IsSuccessStatusCode)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseContent);
            return geminiResponse?.candidates?[0]?.content?.parts?[0]?.text ?? "[]";
        }
        
        return "[]";
    }
}

public class GeminiResponse
{
    public Candidate[]? candidates { get; set; }
}

public class Candidate
{
    public Content? content { get; set; }
}

public class Content
{
    public Part[]? parts { get; set; }
}

public class Part
{
    public string? text { get; set; }
}