//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace TrempBossDataAccess
{
    using System;
    using System.Collections.Generic;
    
    public partial class User
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public User()
        {
            this.User_Tremps = new HashSet<User_Tremps>();
        }
    
        public int user_Id { get; set; }
        public string email { get; set; }
        public string phone_number { get; set; }
        public string password { get; set; }
        public string image_URL { get; set; }
        public string gender { get; set; }
        public Nullable<int> coins { get; set; }
        public System.DateTime created_date { get; set; }
        public System.DateTime update_date { get; set; }
        public bool deleted { get; set; }
        public string notification_token { get; set; }
        public Nullable<System.DateTime> last_login_date { get; set; }
        public string first_name { get; set; }
        public string last_name { get; set; }
    
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<User_Tremps> User_Tremps { get; set; }
    }
}
