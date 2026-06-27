using Microsoft.AspNetCore.Mvc;
using PlaylistManagerApi.Dtos;
using PlaylistManagerApi.Services;

namespace PlaylistManagerApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController(IUserService service) : ControllerBase
    {
        [HttpGet]

        //Use async to prevent freezing
        public async Task<ActionResult<List<UserRes>>> GetUsers()
        {
            List<UserRes> result = await service.GetAllUsersAsync();
            if (result.Count == 0)
            {
                return NoContent();
            }
            return Ok(result);

        }

        [HttpGet("search/id/{id}")]

        //Use async to prevent freezing
        public async Task<ActionResult<UserRes>> GetUserById(int id)
        {
            var result = await service.GetUserByIdAsync(id);
            if (result == null)
            {
                return NotFound("No User Found Having This Id");
            }
            return Ok(result);

        }

        [HttpGet("search/name/{name}")]
        //to search for all users with this name
        public async Task<ActionResult<List<UserRes>>> SearchUserName(String name)
        {
            List<UserRes> result = await service.GetUserByNameAsync(name);
            if (result.Count == 0)
            {
                return NotFound("No Users Found Having This Name");
            }
            return Ok(result);
        }


        [HttpPost]
        public async Task<ActionResult<UserRes>> AddUser(AddUserReq user)
        {
            var createUser = await service.AddUserAsync(user);
            if (createUser == null)
            {
                return NoContent();
            }
            return CreatedAtAction(nameof(GetUserById), new { id = createUser.Id }, createUser);

        }

    }
}
