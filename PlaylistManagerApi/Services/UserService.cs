using Microsoft.EntityFrameworkCore;
using PlaylistManagerApi.Data;
using PlaylistManagerApi.Dtos;
using PlaylistManagerApi.Models;

namespace PlaylistManagerApi.Services
{
    public class UserService(AppDbContext context) : IUserService
    {
        public async Task<UserRes> AddUserAsync(AddUserReq user)
        {
            var newUser = new User
            {
                Name = user.Name,
                Playlists = new List<Playlist>()

            };

            context.Users.Add(newUser);
            await context.SaveChangesAsync();

            return new UserRes
            {
                Id = newUser.Id,
                Name = newUser.Name

            };
        }

        public async Task<List<UserRes>> GetAllUsersAsync()
        {
            return await context.Users.Select(u => new UserRes { Id = u.Id, Name = u.Name}).ToListAsync();
        }

        public async Task<UserRes?> GetUserByIdAsync(int id)
        {
            return await context.Users.Where(u => u.Id == id).Select(u => new UserRes { Id = u.Id, Name = u.Name}).FirstOrDefaultAsync();
        }

        public async Task<List<UserRes>> GetUserByNameAsync(string name)
        {
            var result = context.Users.Where(u => u.Name.Contains(name)).Select(u => new UserRes { Id = u.Id, Name = u.Name}).ToListAsync();
            return await result;
        }
    }
}
