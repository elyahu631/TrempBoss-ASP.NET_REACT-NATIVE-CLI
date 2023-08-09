using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TrempBossBLL.HelperModels
{
    public class UserUpdateRequest
    {
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string email { get; set; }

        [RegularExpression(@"^\d{10}$", ErrorMessage = "Invalid phone number format")]
        public string phone_number { get; set; }

        [Url(ErrorMessage = "Invalid URL format")]
        public string image_URL { get; set; }

        [StringLength(20, ErrorMessage = "First name must be under 20 characters")]
        public string first_name { get; set; }

        [StringLength(20, ErrorMessage = "Last name must be under 20 characters")]
        public string last_name { get; set; }

        [RegularExpression("^(M|F)$", ErrorMessage = "Gender must be 'M' or 'F'")]
        public string gender { get; set; }

        public string notification_token { get; set; }
        public bool deleted { get; set; }
    }

    public class UserRegistrationAndLoginRequest
    {
        [Required]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string email { get; set; }

        [Required]
        [StringLength(20, ErrorMessage = "The {0} must be at least {2} characters long and no more than {1}.", MinimumLength = 8)]
        [RegularExpression(@"^(?=.*\d)(?=.*[a-z]).+$", ErrorMessage = "The password must contain at least one number and one lowercase letter.")]
        public string password { get; set; }
    }


    public class PasswordUpdateRequest : IValidatableObject
    {
        [Required]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string email { get; set; }

        [Required]
        [StringLength(20, ErrorMessage = "The {0} must be at least {2} characters long and no more than {1}.", MinimumLength = 8)]
        [RegularExpression(@"^(?=.*\d)(?=.*[a-z]).+$", ErrorMessage = "The password must contain at least one number and one lowercase letter.")]
        public string current_password { get; set; }

        [Required]
        [StringLength(20, ErrorMessage = "The {0} must be at least {2} characters long and no more than {1}.", MinimumLength = 8)]
        [RegularExpression(@"^(?=.*\d)(?=.*[a-z]).+$", ErrorMessage = "The password must contain at least one number and one lowercase letter.")]
        public string new_password { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (current_password == new_password)
            {
                yield return new ValidationResult("New password must be different from the current password", new[] { nameof(new_password) });
            }
        }

    }
}
