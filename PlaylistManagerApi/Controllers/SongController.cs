using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using PlaylistManagerApi.Dtos;
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
        public async Task<ActionResult<List<SongRes>>> GetSongs()
        {
            List<SongRes> result = await service.GetAllSongsAsync();
            if (result.Count == 0)
            {
                return NoContent();
            }
            return Ok(result);
            
        }

        [HttpGet("Song_Name/{name}")]
        //to search for all songs with this name
        public async Task<ActionResult<List<SongRes>>> SearchSongName(String name)
        {
            List<SongRes> result = await service.GetSongByNameAsync(name);
            if (result.Count == 0)
            {
                return NotFound("No Songs Found Having This Name");
            }
            return Ok(result);
        }

        [HttpGet("Artist_Name/{artist}")]
        //to search for all songs from this artist
        public async Task<ActionResult<List<SongRes>>> SearchArtistName(String artist)
        {
            List<SongRes> result = await service.GetSongsByArtistAsync(artist);
            if (result.Count == 0)
            {
                return NotFound("No Songs Found by this Artist");
            }
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<SongRes>> AddSong(CreateSongReq song)
        {
            var createSong = await service.AddSongAsync(song);
            if (createSong == null)
            {
                return NoContent();
            }
            return CreatedAtAction(nameof(service.GetSongByIdAsync),createSong);

        }


    }
}

