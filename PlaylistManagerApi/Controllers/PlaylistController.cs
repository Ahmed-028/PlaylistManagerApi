using Microsoft.AspNetCore.Mvc;
using PlaylistManagerApi.Dtos;
using PlaylistManagerApi.Services;

namespace PlaylistManagerApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlaylistController(IPlaylistService service) : ControllerBase
    {
        [HttpGet("search/userId/{userId}")]

        //Use async to prevent freezing
        public async Task<ActionResult<List<PlaylistRes>>> GetPlaylists(int userId)
        {
            var result = await service.GetUserPlaylistsAsync(userId);
            if (result.Count == 0)
            {
                return NoContent();
            }
            return Ok(result);

        }

        [HttpGet("search/playlistId/{id}")]

        //Use async to prevent freezing
        public async Task<ActionResult<PlaylistRes>> GetPlaylistById(int id)
        {
            var result = await service.GetPlaylistByIdAsync(id);
            if (result == null)
            {
                return NotFound("No Playlist Found Having This Id");
            }
            return Ok(result);

        }


        [HttpGet("search/name/{name}")]
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
            try
            {
                var createPlaylist = await service.AddPlaylistAsync(playlist);
                if (createPlaylist == null)
                {
                    return NoContent();
                }
                return CreatedAtAction(nameof(GetPlaylistById), new { id = createPlaylist.Id }, createPlaylist);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            

        }

        [HttpPost("addsong/")]
        public async Task<ActionResult<PlaylistSongRes>> AddSongToPlaylist(AddSongToPlaylistReq request)
        {
            try
            {
                var tempPlaylist = await service.AddSongToPlaylistAsync(request);
                if (tempPlaylist == null)
                {
                    return NoContent();
                }
                return CreatedAtAction(nameof(GetPlaylistById), new { id = request.PlaylistId }, tempPlaylist);
            }
            catch(ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }


        }

        [HttpDelete]
        public async Task<ActionResult<PlaylistSongRes>> DeletePlaylist(int playlistId, int userId)
        {
            bool result = await service.DeletePlaylistAsync(playlistId, userId);

            if (result == false)
            {
                return NotFound();
            }

            return NoContent();
        }
    


    }
}
