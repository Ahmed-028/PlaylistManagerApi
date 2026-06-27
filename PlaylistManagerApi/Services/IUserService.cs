using PlaylistManagerApi.Dtos;

namespace PlaylistManagerApi.Services
{
    public interface IUserService
    {
        Task<List<UserRes>> GetAllUsersAsync();

        Task<UserRes?> GetUserByIdAsync(int id);

        Task<List<UserRes>> GetUserByNameAsync(String name);

        Task<UserRes> AddUserAsync(AddUserReq user);
    }
}
