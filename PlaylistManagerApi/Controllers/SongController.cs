using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PlaylistManagerApi.Models;

namespace PlaylistManagerApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SongController : ControllerBase
    {
        //Using this to test functions before connecting database

        static List<Song> testList = new List<Song> { 
           new Song {Id = 1,Name="Sharks",Artist ="Imagine dragons",PublishDate= DateTime.Now},
           new Song {Id = 2,Name="Beliver",Artist ="Imagine dragons",PublishDate= DateTime.Now},
           new Song {Id = 3,Name="Radioactive",Artist ="Imagine dragons",PublishDate= DateTime.Now}

        };

        [HttpGet]

        //Use async to prevent freezing
        public async Task<ActionResult<List<Song>>> GetSongs()
        {
            return Ok(testList);
        }
    }
}
