using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PlaylistManagerApi.Models;
using PlaylistManagerApi.Services;

namespace PlaylistManagerApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlaylistController(IPlaylistService service) : ControllerBase
    {
        [HttpGet]

        //Use async to prevent freezing
        public async Task<ActionResult<List<Playlist>>> GetPlaylists()
        {
            List<Playlist> result = await service.GetAllPlaylistsAsync();
            if (result.Count == 0)
            {
                return NoContent();
            }
            return Ok(result);

        }

        [HttpGet("Playlist_Name/{name}")]
        //to search for all Playlists with this name
        public async Task<ActionResult<List<Playlist>>> SearchPlaylistName(String name)
        {
            List<Playlist> result = await service.GetPlaylistByNameAsync(name);
            if (result.Count == 0)
            {
                return NotFound("No Playlist Found Having This Name");
            }
            return Ok(result);
        }

        


    }
}
