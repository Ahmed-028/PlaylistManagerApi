using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using PlaylistManagerApi.Data;
using PlaylistManagerApi.Dtos;
using PlaylistManagerApi.Models;
using PlaylistManagerApi.Services;


namespace PlaylistManagerApi.Tests.ServiceTests
{
    public class PlaylistServiceTests
    {

        private async Task<AppDbContext> GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()).Options;
            var databaseContext = new AppDbContext(options);
            databaseContext.Database.EnsureCreated();

            if (await databaseContext.Playlists.CountAsync() <= 0)
            {
                databaseContext.Playlists.Add(
                    new Models.Playlist()
                    {
                        Name = "Favourite",
                        CreationDate = DateTime.UtcNow,
                        UserId = 1,
                        PlaylistSongs = new List<PlaylistSongs>()
                    }
                );
                await databaseContext.SaveChangesAsync();
            }

            return databaseContext;

        }



        [Fact]
        public async Task PlaylistService_GetPlaylistByNameAsync_ReturnPlaylistRes()
        {
            //Arrange
            var name = "Ahmed";
            var dbContext = await GetDbContext();
            var userService = new PlaylistService(dbContext);

            //Act
            var result = userService.GetPlaylistByNameAsync(name);

            //Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<Task<List<PlaylistRes>>>();

        }

    }
}
