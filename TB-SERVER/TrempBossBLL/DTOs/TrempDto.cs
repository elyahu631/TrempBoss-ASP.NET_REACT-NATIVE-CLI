using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TrempBossDataAccess;

namespace TrempBossBLL.DTOs
{
    public class CreatorDto
    {
        public int creator_id { get; set; }
        public string first_name { get; set; }
        public string last_name { get; set; }
        public string image_URL { get; set; }
    }

    public class TrempDto
    {
        public int tremp_id { get; set; }
        public string tremp_type { get; set; } 
        public DateTime create_date { get; set; }
        public DateTime tremp_time { get; set; }
        public string from_route { get; set; }
        public string to_route { get; set; }
        public string note { get; set; }
        public int seats_amount { get; set; }
        public int group_id { get; set; }
        public Nullable<int> hitchhikers_count { get; set; } // Newly added property
        public CreatorDto creator { get; set; }
    }

    public class UserTrempsDetailsDto
    {
        public int tremp_id { get; set; }
        public string tremp_type { get; set; } 
        public DateTime create_date { get; set; }
        public DateTime tremp_time { get; set; }
        public string from_route { get; set; }
        public string to_route { get; set; }
        public string note { get; set; }
        public int seats_amount { get; set; }
        public int group_id { get; set; }
        public string  approvalStatus { get; set;}
    }

    public class TrempUserDto
    {
        public int user_id { get; set; }
        public string first_name { get; set; }
        public string last_name { get; set; }
        public string image_URL { get; set; }
        public string gender { get; set; }
        public string is_confirmed { get; set; }
    }


    public class ApprovedUserDto
    {
        public int user_id { get; set; }
        public string first_name { get; set; }
        public string last_name { get; set; }
    }

    public class ApprovedTrempDto
    {
        public int tremp_id { get; set; }
        public string tremp_type { get; set; }
        public DateTime tremp_time { get; set; }
        public string from_route { get; set; }
        public string to_route { get; set; }
        public string note { get; set; }
        public int seats_amount { get; set; }
        public ApprovedUserDto driver { get; set; }
        public List<ApprovedUserDto> hitchhikers { get; set; }
    }

}
