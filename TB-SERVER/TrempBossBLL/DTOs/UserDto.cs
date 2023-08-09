using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TrempBossBLL.DTOs
{
    public class UserDto
    {
        public int user_id { get; set; }
        public string email { get; set; }
        public string phone_number { get; set; }
        public string image_URL { get; set; }
        public string first_name { get; set; }
        public string last_name { get; set; }
        public string gender { get; set; }
        public Nullable<int> coins { get; set; }
        public System.DateTime created_date { get; set; }
        public System.DateTime update_date { get; set; }
        public bool deleted { get; set; }
        public string notification_token { get; set; }
        public Nullable<System.DateTime> last_login_date { get; set; }
    }

}
