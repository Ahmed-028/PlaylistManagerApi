using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using PlaylistManagerApi.Data;
using PlaylistManagerApi.Dtos;
using PlaylistManagerApi.Models;
using PlaylistManagerApi.Services;


namespace PlaylistManagerApi.Tests.ServiceTests
{
    public class UserServiceTests
    {
        private async Task<AppDbContext> GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(databaseName:Guid.NewGuid().ToString()).Options;
            var databaseContext = new AppDbContext(options);
            databaseContext.Database.EnsureCreated();

            if(await databaseContext.Users.CountAsync() <= 0)
            {
                databaseContext.Users.Add(
                    new Models.User()
                    {
                        Name = "Ahmed",
                        Playlists = new List<Models.Playlist>()
                    }
                );
                await databaseContext.SaveChangesAsync();
            }

            return databaseContext;

        }





        [Fact]
        public async Task AddUserAsync_WithValidUser_CreatesAndReturnsUserRes()
        {
            await using var ctx = await GetDbContext();
            var service = new UserService(ctx);

            var result = await service.AddUserAsync(new AddUserReq { Name = "Mohammed" });

            result.Should().NotBeNull();
            result.Name.Should().Be("Mohammed");
            result.Id.Should().Be(2);
            result.Id.Should().BeGreaterThan(0);
        }


        [Fact]
        public async Task GetUserByNameAsync_MatchesSubstringCaseSensitively()
        {
            await using var ctx = await GetDbContext();
            var service = new UserService(ctx);

            var found = await service.GetUserByNameAsync("Ahm");

            found.Should().ContainSingle().Which.Name.Should().Be("Ahmed");
        }

        


    }
}
