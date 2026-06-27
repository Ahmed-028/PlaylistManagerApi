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
                databaseContext.Users.AddRange(
                new User { Name = "Ahmed" },   // -> Id 1
                new User { Name = "Sara" });    // -> Id 2
                databaseContext.Songs.AddRange(
                    new Song { Name = "Imagine", Artist = "John Lennon" },   // -> Id 1
                    new Song { Name = "Yesterday", Artist = "The Beatles" }); // -> Id 2
                databaseContext.Playlists.Add(new Playlist { Name = "Favourites", CreationDate = DateTime.UtcNow, UserId = 1 }); // -> Id 1
                await databaseContext.SaveChangesAsync();
            }

            return databaseContext;

        }



        [Fact]
        public async Task AddPlaylistAsync_WithValidUser_CreatesAndReturnsPlaylist()
        {
            await using var ctx = await GetDbContext();
            var service = new PlaylistService(ctx);

            var result = await service.AddPlaylistAsync(new CreatePlaylistReq { Name = "Road Trip", UserId = 1 });

            result.Should().NotBeNull();
            result.Name.Should().Be("Road Trip");
            result.UserId.Should().Be(1);
            result.Id.Should().BeGreaterThan(0);
            (await ctx.Playlists.CountAsync(p => p.UserId == 1)).Should().Be(2);
        }


        [Fact]
        public async Task AddPlaylistAsync_WithWrongUser_ThrowsArgumentException()
        {
            await using var ctx = await GetDbContext();
            var service = new PlaylistService(ctx);

            var result = await service.AddPlaylistAsync(new CreatePlaylistReq { Name = "Road Trip", UserId = 1 });

            var act = () => service.AddPlaylistAsync(new CreatePlaylistReq { Name = "Ghost", UserId = 999 });

            await act.Should().ThrowAsync<ArgumentException>().WithMessage("*User not found*");
        }

        [Fact]
        public async Task AddSongToPlaylistAsync_FirstSong_GetsOrderOne()
        {
            await using var ctx = await GetDbContext();
            var service = new PlaylistService(ctx);

            var result = await service.AddSongToPlaylistAsync(
                new AddSongToPlaylistReq { PlaylistId = 1, SongId = 1, UserId = 1 });

            result.OrderInPlaylist.Should().Be(1);
            result.SongId.Should().Be(1);
            result.PlaylistId.Should().Be(1);
        }

        [Fact]
        public async Task AddSongToPlaylistAsync_SecondSong_GetsIncrementedOrder()
        {
            await using var ctx = await GetDbContext();
            var service = new PlaylistService(ctx);

            await service.AddSongToPlaylistAsync(new AddSongToPlaylistReq { PlaylistId = 1, SongId = 1, UserId = 1 });
            var second = await service.AddSongToPlaylistAsync(new AddSongToPlaylistReq { PlaylistId = 1, SongId = 2, UserId = 1 });

            second.OrderInPlaylist.Should().Be(2);
        }

        [Fact]
        public async Task AddSongToPlaylistAsync_WhenPlaylistNotOwnedByUser_ThrowsArgumentException()
        {
            await using var ctx = await GetDbContext();
            var service = new PlaylistService(ctx);

            // Playlist 1 belongs to user 1; user 2 must not be able to add to it.
            var act = () => service.AddSongToPlaylistAsync(
                new AddSongToPlaylistReq { PlaylistId = 1, SongId = 1, UserId = 2 });

            await act.Should().ThrowAsync<ArgumentException>().WithMessage("*not yours*");
        }

        [Fact]
        public async Task AddSongToPlaylistAsync_WithUnknownSong_ThrowsArgumentException()
        {
            await using var ctx = await GetDbContext();
            var service = new PlaylistService(ctx);

            var act = () => service.AddSongToPlaylistAsync(
                new AddSongToPlaylistReq { PlaylistId = 1, SongId = 999, UserId = 1 });

            await act.Should().ThrowAsync<ArgumentException>().WithMessage("*Song Not Found*");
        }

        [Fact]
        public async Task AddSongToPlaylistAsync_Duplicate_ThrowsInvalidOperationException()
        {
            await using var ctx = await GetDbContext();
            var service = new PlaylistService(ctx);

            await service.AddSongToPlaylistAsync(new AddSongToPlaylistReq { PlaylistId = 1, SongId = 1, UserId = 1 });

            var act = () => service.AddSongToPlaylistAsync(
                new AddSongToPlaylistReq { PlaylistId = 1, SongId = 1, UserId = 1 });

            await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("*Already in Playlist*");
        }

        [Fact]
        public async Task GetUserPlaylistsAsync_ReturnsOnlyThatUsersPlaylists()
        {
            await using var ctx = await GetDbContext();
            ctx.Playlists.Add(new Playlist { Name = "Sara's Mix", CreationDate = DateTime.UtcNow, UserId = 2 }); // -> Id 2
            await ctx.SaveChangesAsync();
            var service = new PlaylistService(ctx);

            var user1 = await service.GetUserPlaylistsAsync(1);
            var user2 = await service.GetUserPlaylistsAsync(2);

            user1.Should().ContainSingle().Which.UserId.Should().Be(1);
            user2.Should().ContainSingle().Which.Name.Should().Be("Sara's Mix");
        }

        [Fact]
        public async Task GetUserPlaylistsAsync_WithNoPlaylists_ReturnsEmptyList()
        {
            await using var ctx = await GetDbContext();
            var service = new PlaylistService(ctx);

            var result = await service.GetUserPlaylistsAsync(2);

            result.Should().NotBeNull().And.BeEmpty();
        }

        [Fact]
        public async Task DeletePlaylistAsync_AsOwner_RemovesPlaylistAndReturnsTrue()
        {
            await using var ctx = await GetDbContext();
            var service = new PlaylistService(ctx);

            var ok = await service.DeletePlaylistAsync(playlistId: 1, userId: 1);

            ok.Should().BeTrue();
            (await ctx.Playlists.AnyAsync(p => p.Id == 1)).Should().BeFalse();
        }

        [Fact]
        public async Task DeletePlaylistAsync_AsNonOwner_ReturnsFalseAndKeepsPlaylist()
        {
            await using var ctx = await GetDbContext();
            var service = new PlaylistService(ctx);

            var ok = await service.DeletePlaylistAsync(playlistId: 1, userId: 2);

            ok.Should().BeFalse();
            (await ctx.Playlists.AnyAsync(p => p.Id == 1)).Should().BeTrue();
        }

        [Fact]
        public async Task UpdatePlaylistAsync_AsOwner_RenamesAndReturnsTrue()
        {
            await using var ctx = await GetDbContext();
            var service = new PlaylistService(ctx);

            var ok = await service.UpdatePlaylistAsync(
                new UpdatePlaylistReq { PlaylistId = 1, UserId = 1, Name = "Renamed" });

            ok.Should().BeTrue();
            (await ctx.Playlists.FirstAsync(p => p.Id == 1)).Name.Should().Be("Renamed");
        }

        [Fact]
        public async Task UpdatePlaylistAsync_AsNonOwner_ReturnsFalse()
        {
            await using var ctx = await GetDbContext();
            var service = new PlaylistService(ctx);

            var ok = await service.UpdatePlaylistAsync(
                new UpdatePlaylistReq { PlaylistId = 1, UserId = 2, Name = "Hijacked" });

            ok.Should().BeFalse();
        }

        [Fact]
        public async Task GetPlaylistByNameAsync_MatchesSubstringCaseSensitively()
        {
            await using var ctx = await GetDbContext();
            var service = new PlaylistService(ctx);

            var found = await service.GetPlaylistByNameAsync("Favou");

            found.Should().ContainSingle().Which.Name.Should().Be("Favourites");
        }
    

}
}
