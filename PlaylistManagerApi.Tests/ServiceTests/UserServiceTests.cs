using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using PlaylistManagerApi.Data;
using PlaylistManagerApi.Dtos;
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
        public async Task UserService_GetUserByNameAsync_ReturnUserRes()
        {
            //Arrange
            var name = "Ahmed";
            var dbContext  = await GetDbContext();
            var userService = new UserService(dbContext);

            //Act
            var result = userService.GetUserByNameAsync(name);

            //Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<Task<List<UserRes>>>();


        }


    }
}
