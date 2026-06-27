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
        public void PlaylistController_GetPlaylists_ReturnOk()
        {
            //Arrange
            var playlists = A.Fake<ICollection<PlaylistRes>>();
            var controller = new PlaylistController(_playlistService);

            //Act
            var result = controller.GetPlaylists(1);

            //Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<Task<ActionResult<List<PlaylistRes>>>>();
            //result.Should().BeOfType(typeof(OkObjectResult));
        }
    }
}
