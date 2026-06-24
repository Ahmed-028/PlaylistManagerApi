using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PlaylistManagerApi.Models;
using PlaylistManagerApi.Services;

namespace PlaylistManagerApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SongController(ISongService service) : ControllerBase
    {
        

        [HttpGet]

        //Use async to prevent freezing
        public async Task<ActionResult<List<Song>>> GetSongs()
        {
            return Ok(await service.GetAllSongsAsync());
        }

        [HttpGet("Song_Name/{name}")]
        //to search for all songs with this name
        public async Task<ActionResult<List<Song>>> SearchSongName(String name)
        {
            List<Song> result = await service.GetSongByNameAsync(name);
            if (result.Count == 0)
            {
                return NoContent();
            }
            return Ok(result);
        }

        [HttpGet("Artist_Name/{artist}")]
        //to search for all songs from this artist
        public async Task<ActionResult<List<Song>>> SearchArtistName(String artist)
        {
            List<Song> result = await service.GetSongsByArtistAsync(artist);
            if (result.Count == 0)
            {
                return NoContent();
            }
            return Ok(result);
        }


    }
}

