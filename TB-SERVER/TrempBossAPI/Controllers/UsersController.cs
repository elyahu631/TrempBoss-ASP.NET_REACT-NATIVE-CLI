using Microsoft.IdentityModel.Tokens;
using System;
using System.Configuration;
using System.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using TrempBossAPI.Services;
using TrempBossBLL;
using TrempBossBLL.DTOs;
using TrempBossBLL.Exceptions;
using TrempBossBLL.HelperModels;


namespace TrempBossAPI.Controllers
{

    [RoutePrefix("api/users")]
    public class UsersController : ApiController
    {
        private readonly UsersBLL usersBLL;

        public UsersController() => usersBLL = new UsersBLL();


        /// <summary>
        /// Gets a user by their ID.
        /// </summary>
        [HttpGet]
        [JwtAuthentication]
        [Route("{id}")]
        public async Task<IHttpActionResult> GetUserById(int id)
        {
            UserDto user = await usersBLL.GetUserById(id);
            return ResponseHandler.SuccessResponse(Request, user, HttpStatusCode.OK, "User found");
        }


        /// <summary>
        /// Registers a new user. with email and password
        /// </summary>
        [HttpPost]
        [Route("register")]
        public async Task<IHttpActionResult> RegisterUser([FromBody] UserRegistrationAndLoginRequest user)
        {
            await usersBLL.RegisterUser(user);
            return ResponseHandler.SuccessResponse(Request, null, HttpStatusCode.Created, "User registered successfully");
        }


        /// <summary>
        /// Logs in a user and generates an authentication token.
        /// </summary>
        [HttpPost]
        [Route("login")]
        public async Task<IHttpActionResult> UserLogin([FromBody] UserRegistrationAndLoginRequest user)
        {
            UserDto userLogin = await usersBLL.UserLogin(user);

            // Initialize the TokenService with your secret key
            string tokenKey = ConfigurationManager.AppSettings["TokenKEY"];
            TokenService tokenService = new TokenService(tokenKey);

            // Generate the token
            string token = tokenService.GenerateJwtToken(userLogin.email);
            return ResponseHandler.SuccessResponse(Request, new { user = userLogin, token }, HttpStatusCode.OK, "User logged in successfully");
        }



        /// <summary>
        /// Updates user information.
        /// </summary>
        [JwtAuthentication]
        [HttpPut]
        [Route("update/{id}")]
        public async Task<IHttpActionResult> UpdateUser(int id, [FromBody] UserUpdateRequest updateRequest)
        {
            if (id <= 0)
                throw new ApiException("Invalid ID", HttpStatusCode.BadRequest);
            await usersBLL.UpdateUser(id, updateRequest);
            return ResponseHandler.SuccessResponse(Request, null, HttpStatusCode.OK, "User updated successfully");
        }


        /// <summary>
        /// Updates user password.
        /// </summary>
        [HttpPut]
        [JwtAuthentication]
        [Route("update-password")]
        public async Task<IHttpActionResult> UpdatePassword([FromBody] PasswordUpdateRequest passwordUpdate)
        {
            await usersBLL.UpdatePassword(passwordUpdate);
            return ResponseHandler.SuccessResponse(Request, null, HttpStatusCode.OK, "Password updated successfully");
        }


        /// <summary>
        /// Updates user image.
        /// </summary>
        [JwtAuthentication]
        [HttpPost]
        [Route("update-image/{id}")]
        public async Task<IHttpActionResult> updateImageAsync(int id) // Updated to return a Task<IHttpActionResult>
        {
            if (!Request.Content.IsMimeMultipartContent())
            {
                throw new ApiException("Invalid image type", HttpStatusCode.UnsupportedMediaType);
            }

            MultipartMemoryStreamProvider provider = new MultipartMemoryStreamProvider();
            await Request.Content.ReadAsMultipartAsync(provider);

            // Get the file from the request
            HttpContent file = provider.Contents[0];

            // Upload the image and update the URL in the database
            string imageUrl = await usersBLL.UploadImageAndUpdateUrlAsync(id, file);

            return ResponseHandler.SuccessResponse(Request, new { imageUrl }, HttpStatusCode.OK, "Image uploaded successfully");
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                usersBLL.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}

