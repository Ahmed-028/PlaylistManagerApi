using FakeItEasy;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using PlaylistManagerApi.Controllers;
using PlaylistManagerApi.Dtos;
using PlaylistManagerApi.Services;


namespace PlaylistManagerApi.Tests.ControllerTests
{
    public class PlaylistControllerTests
    {
        private readonly IPlaylistService _playlistService;

        public PlaylistControllerTests()
        {
            _playlistService = A.Fake<IPlaylistService>();
        }

        [Fact]
        public async Task GetPlaylists_ReturnsOkWithPayload()
        {
            var data = new List<PlaylistRes> { new() { Id = 1, Name = "Favourites", UserId = 1 } };
            A.CallTo(() => _playlistService.GetUserPlaylistsAsync(1)).Returns(data);
            var controller = new PlaylistController(_playlistService);

            var result = await controller.GetPlaylists(1);

            var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            ok.Value.Should().BeEquivalentTo(data);
        }

        [Fact]
        public async Task GetPlaylists_WithNoPlaylists_StillReturnsOkEmptyList()
        {
            A.CallTo(() => _playlistService.GetUserPlaylistsAsync(7)).Returns(new List<PlaylistRes>());
            var controller = new PlaylistController(_playlistService);

            var result = await controller.GetPlaylists(7);

            var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            ok.Value.Should().BeAssignableTo<IEnumerable<PlaylistRes>>().Which.Should().BeEmpty();
        }

        [Fact]
        public async Task GetPlaylistById_WhenMissing_ReturnsNotFound()
        {
            A.CallTo(() => _playlistService.GetPlaylistByIdAsync(99)).Returns((PlaylistRes?)null);
            var controller = new PlaylistController(_playlistService);

            var result = await controller.GetPlaylistById(99);

            result.Result.Should().BeOfType<NotFoundObjectResult>();
        }

        [Fact]
        public async Task AddPlaylist_OnSuccess_ReturnsCreatedAtAction()
        {
            var created = new PlaylistRes { Id = 5, Name = "Road Trip", UserId = 1 };
            A.CallTo(() => _playlistService.AddPlaylistAsync(A<CreatePlaylistReq>._)).Returns(created);
            var controller = new PlaylistController(_playlistService);

            var result = await controller.AddPlaylist(new CreatePlaylistReq { Name = "Road Trip", UserId = 1 });

            var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
            createdResult.RouteValues!["id"].Should().Be(5);
            createdResult.Value.Should().Be(created);
        }

        [Fact]
        public async Task AddSongToPlaylist_OnSuccess_ReturnsCreatedAtAction()
        {
            var created = new PlaylistSongRes { PlaylistId = 1, SongId = 2, OrderInPlaylist = 1 };
            A.CallTo(() => _playlistService.AddSongToPlaylistAsync(A<AddSongToPlaylistReq>._)).Returns(created);
            var controller = new PlaylistController(_playlistService);

            var result = await controller.AddSongToPlaylist(
                new AddSongToPlaylistReq { PlaylistId = 1, SongId = 2, UserId = 1 });

            result.Result.Should().BeOfType<CreatedAtActionResult>();
        }


    }
}
