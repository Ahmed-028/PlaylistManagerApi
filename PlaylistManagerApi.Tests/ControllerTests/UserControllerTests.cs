using FakeItEasy;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using PlaylistManagerApi.Controllers;
using PlaylistManagerApi.Dtos;
using PlaylistManagerApi.Services;

namespace PlaylistManagerApi.Tests.ControllerTests
{
    public class UserControllerTests
    {
        private readonly IUserService _userService = A.Fake<IUserService>();

        public UserControllerTests()
        {
            _userService = A.Fake<IUserService>();
        }

        
        private UserController CreateController() => new(_userService);

        [Fact]
        public async Task GetUsers_WithUsers_ReturnsOk()
        {
            A.CallTo(() => _userService.GetAllUsersAsync())
                .Returns(new List<UserRes> { new() { Id = 1, Name = "Ahmed" } });
            var controller = CreateController();

            var result = await controller.GetUsers();

            result.Result.Should().BeOfType<OkObjectResult>();
        }

        [Fact]
        public async Task GetUsers_WhenEmpty_ReturnsNoContent()
        {
            A.CallTo(() => _userService.GetAllUsersAsync()).Returns(new List<UserRes>());
            var controller = CreateController();

            var result = await controller.GetUsers();

            result.Result.Should().BeOfType<NoContentResult>();
        }

        [Fact]
        public async Task GetUserById_WhenMissing_ReturnsNotFound()
        {
            A.CallTo(() => _userService.GetUserByIdAsync(404)).Returns((UserRes?)null);
            var controller = CreateController();

            var result = await controller.GetUserById(404);

            result.Result.Should().BeOfType<NotFoundObjectResult>();
        }

        [Fact]
        public async Task AddUser_OnSuccess_ReturnsCreatedAtAction()
        {
            var created = new UserRes { Id = 9, Name = "Mona" };
            A.CallTo(() => _userService.AddUserAsync(A<AddUserReq>._)).Returns(created);
            var controller = CreateController();

            var result = await controller.AddUser(new AddUserReq { Name = "Mona" });

            var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
            createdResult.RouteValues!["id"].Should().Be(9);
        }

    }
}
