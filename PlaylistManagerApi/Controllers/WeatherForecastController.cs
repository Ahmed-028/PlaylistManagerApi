using Microsoft.AspNetCore.Mvc;

namespace PlaylistManagerApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        private static readonly string[] Summaries =
        [
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        ];

        //Can be removed as method is called get
        [HttpGet(Name = "GetWeatherForecast")]

        //ActionResult<> to cast type to return Ok,Bad request,Not found
        public ActionResult<IEnumerable<WeatherForecast>> Get()
        {
            var res= Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            })
            .ToArray();

            return Ok(res);
        }
    }
}
