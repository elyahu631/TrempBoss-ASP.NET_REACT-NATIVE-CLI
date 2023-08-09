using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TrempBossDataAccess;

namespace TrempBossBLL.Models
{
    /// <summary>
    /// Represents a request to add a new tremp.
    /// </summary>
    public class AddTrempRequest : IValidatableObject
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Creator ID must be a number above 0")]
        public int creator_id { get; set; }

        [Required]
        [RegularExpression("^(driver|hitchhiker)$", ErrorMessage = "Tremp type must be 'driver' or 'hitchhiker'")]
        public string tremp_type { get; set; }

        [Required]
        public DateTime tremp_time { get; set; }

        [Required]
        public string from_route { get; set; }

        [Required]
        public string to_route { get; set; }

        [StringLength(500, ErrorMessage = "Note must be under 500 characters")]
        public string note { get; set; }

        [Required]
        [Range(1, 5, ErrorMessage = "Seats amount must be between 1 and 5")]
        public int seats_amount { get; set; }

      

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (from_route == to_route)
            {
                yield return new ValidationResult("From Route and To Route must be different.", new[] { nameof(from_route) });
            }
        }
    }

    /// <summary>
    /// Represents a request to get unjoined tremps.
    /// </summary>
    public class GetUnJoinTrempsRequest
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Creator ID must be a number above 0")]
        public int creator_id { get; set; }

        [Required]
        [RegularExpression("^(driver|hitchhiker)$", ErrorMessage = "Tremp type must be 'driver' or 'hitchhiker'")]
        public string tremp_type { get; set; }

        [Required]
        public DateTime tremp_time { get; set; }
    }

    /// <summary>
    /// Represents a request to join or delete a tremp.
    /// </summary>
    public class JoinOrDeleteTrempRequest
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Tremp ID must be a number above 0")]
        public int tremp_id { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "User ID must be a number above 0")]
        public int user_id { get; set; }
    }

    /// <summary>
    /// Represents a request to approve a user in a tremp.
    /// </summary>
    public class ApproveUserInTrempRequest
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Tremp ID must be a number above 0")]
        public int tremp_id { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Creator ID must be a number above 0")]
        public int creator_id { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "User ID must be a number above 0")]
        public int user_id { get; set; }

        [Required]
        [RegularExpression("^(approved|denied)$", ErrorMessage = "Approval must be 'approved' or 'denied'")]
        public string approval { get; set; }
    }

    /// <summary>
    /// Represents a request to retrieve user's joined or created tremps by type.
    /// </summary>
    public class GetUserTrempsRequest
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "User ID must be a number above 0")]
        public int user_id { get; set; }

        [Required]
        [RegularExpression("^(driver|hitchhiker)$", ErrorMessage = "Tremp type must be 'driver' or 'hitchhiker'")]
        public string tremp_type { get; set; }
    }

}