using System;
using System.Data.Entity;
using System.Data.Entity.Core.Objects;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using TrempBossBLL.AutoMapperProfiles;
using TrempBossBLL.DTOs;
using TrempBossBLL.Exceptions;
using TrempBossBLL.HelperModels;
using TrempBossBLL.Services;
using TrempBossDataAccess;


namespace TrempBossBLL
{
    public class UsersBLL
    {
        private readonly Tremp_Boss_DBEntities entities;
        private readonly StorageService _firebaseStorageService;

        public UsersBLL()
        {
            entities = new Tremp_Boss_DBEntities();
            _firebaseStorageService = new StorageService();
        }

        public async Task<UserDto> GetUserById(int userId)
        {
            User userEntity = await entities.Users.FindAsync(userId); // Asynchronous find method

            if (userEntity == null)
                throw new ApiException("User not found", HttpStatusCode.BadRequest);

            UserDto userDto = MapperConfig.Mapper.Map<UserDto>(userEntity);
            return userDto;
        }

        public async Task RegisterUser(UserRegistrationAndLoginRequest user)
        {
            // Check if the user already exists
            bool userExists = await entities.Users.AnyAsync(u => u.email == user.email);

            if (userExists)
            {
                throw new ApiException("User already exists", HttpStatusCode.Conflict);
            }

            // Hash the password before storing it
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(user.password);

            int result = await entities.Proc_User_Registration(user.email, hashedPassword);

            if (result != -1)
            {
                throw new ApiException("Failed to register user", HttpStatusCode.BadRequest);
            }
            await entities.SaveChangesAsync();
        }

        public async Task<UserDto> UserLogin(UserRegistrationAndLoginRequest user)
        {

            string storedHashedPassword = entities.Users.Where(u => u.email == user.email).Select(u => u.password).FirstOrDefault();

            if (storedHashedPassword == null || !BCrypt.Net.BCrypt.Verify(user.password, storedHashedPassword))
            {
                throw new ApiException("Invalid email or password", HttpStatusCode.Unauthorized);
            }

            ObjectParameter userIdParam = new ObjectParameter("userId", typeof(int));

            int result = await entities.Proc_User_Login(user.email, userIdParam);

            int userId = (int)userIdParam.Value;

            if (result != 0 && userId < 0)
            {
                throw new ApiException("here was a problem in the database. Please try again later", HttpStatusCode.InternalServerError);
            }

            await entities.SaveChangesAsync();

            return await GetUserById(userId);
        }

        public async Task UpdateUser(int id, UserUpdateRequest updateRequest)
        {
            IsUserExists(id); // Assuming this is a synchronous method, keep as is.
            int result = await entities.Proc_Update_User(id, updateRequest.email, updateRequest.phone_number,
                    updateRequest.image_URL, updateRequest.first_name, updateRequest.last_name, updateRequest.gender,
                    updateRequest.notification_token, updateRequest.deleted);

            if (result == 0)
                throw new ApiException("Update operation failed", HttpStatusCode.BadRequest);

            await entities.SaveChangesAsync();
        }

        public async Task UpdatePassword(PasswordUpdateRequest passwordUpdate)
        {
            // Verify current password
            User user = await entities.Users.FirstOrDefaultAsync(u => u.email == passwordUpdate.email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(passwordUpdate.current_password, user.password))
            {
                throw new ApiException("Invalid email or password", HttpStatusCode.Unauthorized);
            }

            // Hash the new password before storing it
            string hashedNewPassword = BCrypt.Net.BCrypt.HashPassword(passwordUpdate.new_password);

            user.password = hashedNewPassword;

            await entities.SaveChangesAsync();
        }

        public async Task<string> UploadImageAndUpdateUrlAsync(int userId, HttpContent file)
        {
            string contentType = file.Headers.ContentType.MediaType;
            if (contentType != "image/jpeg" && contentType != "image/png" && contentType != "image/jpg")
                throw new ApiException("Invalid image type", HttpStatusCode.UnsupportedMediaType);

            IsUserExists(userId);

            // Find the existing user and retrieve the old image URL
            User user = entities.Users.Find(userId);
            string oldImageUrl = user.image_URL;

            byte[] imageBytes = await file.ReadAsByteArrayAsync();

            // Generate a unique identifier
            string uniqueIdentifier = Guid.NewGuid().ToString();

            string fileName = $"user_{userId}_{uniqueIdentifier}.jpg";

            // Upload the new image to Firebase using the FirebaseStorageService instance
            string newImageUrl = _firebaseStorageService.UploadImage(new MemoryStream(imageBytes), fileName);

            // Update the user's image URL in the database
            user.image_URL = newImageUrl;
            await entities.SaveChangesAsync();

            DeleteOldImage(oldImageUrl);
            return (newImageUrl);
        }

        private void DeleteOldImage(string oldImageUrl)
        {
            // Extract the object name from the old image URL (if applicable)
            string oldObjectName = null;
            if (!string.IsNullOrEmpty(oldImageUrl))
            {
                // Extracting the path after "o/"
                int startIndex = oldImageUrl.IndexOf("o/") + 2;
                oldObjectName = WebUtility.UrlDecode(oldImageUrl.Substring(startIndex).Split('?').First());
            }
            // Delete the old image if it exists
            if (oldObjectName != null)
            {
                _firebaseStorageService.DeleteImage(oldObjectName);
            }
        }

        private void IsUserExists(int id)
        {
            bool userExists = entities.Users.Any(u => u.user_Id == id);

            if (!userExists)
            {
                throw new ApiException("ID does not exist", HttpStatusCode.BadRequest);
            }
        }

        public void Dispose()
        {
            entities.Dispose();
        }
    }
}
