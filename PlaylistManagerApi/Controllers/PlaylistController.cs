using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PlaylistManagerApi.Dtos;
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
        public async Task<ActionResult<List<PlaylistRes>>> GetPlaylists()
        {
            var result = await service.GetAllPlaylistsAsync();
            if (result.Count == 0)
            {
                return NoContent();
            }
            return Ok(result);

        }

        [HttpGet("Playlist_Id/{id}")]

        //Use async to prevent freezing
        public async Task<ActionResult<SongRes>> GetPlaylistById(int id)
        {
            var result = await service.GetPlaylistByIdAsync(id);
            if (result == null)
            {
                return NoContent();
            }
            return Ok(result);

        }


        [HttpGet("Playlist_Name/{name}")]
        //to search for all Playlists with this name
        public async Task<ActionResult<List<PlaylistRes>>> SearchPlaylistName(String name)
        {
            var result = await service.GetPlaylistByNameAsync(name);
            if (result.Count == 0)
            {
                return NotFound("No Playlist Found Having This Name");
            }
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<PlaylistRes>> AddPlaylist(CreatePlaylistReq playlist)
        {
            var createPlaylist = await service.AddPlaylistAsync(playlist);
            if (createPlaylist == null)
            {
                return NoContent();
            }
            return CreatedAtAction(nameof(GetPlaylistById), new { id = createPlaylist.Id }, createPlaylist);

        }

        [HttpPost("Add_Song_To_Playlist/")]
        public async Task<ActionResult<PlaylistSongRes>> AddSongToPlaylist(AddSongToPlaylistReq playlist)
        {
            var createPlaylist = await service.AddSongToPlaylistAsync(playlist);
            if (createPlaylist == null)
            {
                return NoContent();
            }
            //return CreatedAtAction(nameof(GetPlaylistById), new { id = createPlaylist.Id }, createPlaylist);
            return Ok();
        }


    }
}
