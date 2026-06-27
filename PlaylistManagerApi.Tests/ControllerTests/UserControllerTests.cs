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
        private readonly IUserService _userService;

        public UserControllerTests()
        {
            _userService = A.Fake<IUserService>();
        }

        [Fact]
        public void UserController_GetUsers_ReturnOk()
        {
            //Arrange
            var users = A.Fake<ICollection<UserRes>>();
            var controller = new UserController(_userService);

            //Act
            var result = controller.GetUsers();

            //Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<Task<ActionResult<List<UserRes>>>>();
            //result.Should().BeOfType(typeof(OkObjectResult));
        }

    }
}
