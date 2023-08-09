// TrempsBLL.cs

using AutoMapper;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using TrempBossBLL.AutoMapperProfiles;
using TrempBossBLL.DTOs;
using TrempBossBLL.Exceptions;
using TrempBossBLL.Models;
using TrempBossDataAccess;

namespace TrempBossBLL
{
    public class TrempsBLL : IDisposable
    {
        private readonly Tremp_Boss_DBEntities entities;
        INotificationService notificationService;

        public TrempsBLL()
        {
            entities = new Tremp_Boss_DBEntities();
            notificationService = new NotificationService();
        }

        public void Dispose()
        {
            entities.Dispose();
        }

        public async Task AddTremp(AddTrempRequest tremp)
        {
            // Check if the user exists
            bool userExists = await entities.Users.AnyAsync(u => u.user_Id == tremp.creator_id);
            if (!userExists)
                throw new ApiException("User does not exist.", HttpStatusCode.BadRequest);

            // Add the new tremp to the Tremps table
            int res = await Task.Run(() => entities.Proc_Add_Tremp(tremp.creator_id, ConvertFromStringToBool(tremp.tremp_type),
                        tremp.tremp_time, tremp.from_route, tremp.to_route, tremp.note, tremp.seats_amount));

            await entities.SaveChangesAsync();                                               
        }

        public async Task<List<TrempDto>> GetTremps(GetUnJoinTrempsRequest trempRequest)
        {
            var retrievedTremps = await Task.Run(() => entities.Proc_Get_Tremps(
                trempRequest.creator_id,
                ConvertFromStringToBool(trempRequest.tremp_type),
                trempRequest.tremp_time
            ).ToList());

            List<TrempDto> trempDataTransferObjects = MapperConfig.Mapper.Map<List<TrempDto>>(retrievedTremps);

            return trempDataTransferObjects;
        }


        public async Task<string> JoinUserToTremp(JoinOrDeleteTrempRequest joinRequest)
        {
            int trempId = joinRequest.tremp_id;
            int userId = joinRequest.user_id;

            // Check if the tremp and user exist
            Tremp tremp = entities.Tremps.FirstOrDefault(t => t.tremp_id == trempId);
            User user = entities.Users.FirstOrDefault(u => u.user_Id == userId);

            if (tremp == null || user == null)
                throw new ApiException("Tremp or User does not exist.", HttpStatusCode.BadRequest);

            string trempType = GetTrempTypeAsString(tremp.tremp_type);

            // Join the user to the tremp
            int? result = entities.Proc_Add_User_To_Tremp(trempId, userId).FirstOrDefault();

            if (result == userId)
                throw new ApiException("There is a problem with the data you sent, the tremp is full or the user is already in the tremp", HttpStatusCode.BadRequest);

            entities.SaveChanges();

            // Get the user's notification token
            string notificationToken = entities.Proc_Get_User_NotificationToken(result).FirstOrDefault();

            if (!string.IsNullOrEmpty(notificationToken))
            {
                Dictionary<string, string> notificationData = new Dictionary<string, string>
                {
                    { "tremp_id", trempId.ToString() },
                    { "page_to_navigate", "get-user-tremps"},
                    { "tremp_type", trempType },
                };

                await notificationService.SendNotificationAsync(notificationToken, "Tremp Request", $"{user.first_name} {user.last_name} has joined your tremp.", notificationData);
            }

            // Return the user's name
            return  $"{user.first_name} {user.last_name}";
        }

        public async Task<string> ApproveUserInTremp(int trempId, int creatorId, int userId, string approval)
        {
            int result = await Task.Run(() => entities.Proc_Approve_User_In_Tremp(trempId, creatorId, userId, approval));

            if (result < 1)
                throw new ApiException("Tremp, User, or Creator does not exist or the User is not the Creator of the Tremp.", HttpStatusCode.BadRequest);

            Tremp tremp = entities.Tremps.FirstOrDefault(t => t.tremp_id == trempId && !t.tremp_type);
            if (tremp != null)
                tremp.is_full = true;


            // Get the user's notification token
            string notificationToken = await Task.Run(() => entities.Proc_Get_User_NotificationToken(userId).FirstOrDefault());

            if (!string.IsNullOrEmpty(notificationToken))
                await notificationService.SendNotificationAsync(notificationToken, $"Approval Status update", $"You have been {approval} in tremp.");

            return "User has been successfully " + approval;
        }

        public async Task<string> DeleteTremp(int trempId, int creatorId)
        {
            try
            {
                Tremp tremp = await entities.Tremps.FirstOrDefaultAsync(t => t.tremp_id == trempId);
                if (tremp == null)
                    throw new ApiException("Tremp not found.", HttpStatusCode.NotFound);

                // Execute stored procedure and get user IDs
                List<int?> userIds = await Task.Run(() => entities.Proc_Delete_Tremp(trempId, creatorId).ToList());
                bool isCreator = tremp.User_Tremps.Any(ut => ut.user_id == creatorId && ut.created_ride);

                string title;
                string body;

                if (isCreator)
                {
                    // User is the creator of the tremp
                    title = "Tremp Deleted";
                    body = $"Tremp #{trempId} has been deleted.";
                }
                else
                {
                    // User is a participant in the tremp
                    title = "Tremp Cancelled";
                    body = $"Tremp #{trempId} has been cancelled by a participant.";
                }

                // Send notifications to relevant users
                foreach (int? userId in userIds)
                {
                    string notificationToken = (await Task.Run(() => entities.Proc_Get_User_NotificationToken(userId))).FirstOrDefault();
                    if (!string.IsNullOrEmpty(notificationToken))
                    {
                        await notificationService.SendNotificationAsync(notificationToken, title, body);
                    }
                }

                await entities.SaveChangesAsync();

                if (isCreator)
                    return "Tremp deleted successfully.";
                else
                    return "Tremp Cancelled successfully.";

            }
            catch (Exception ex)
            {
                throw new ApiException("An error occurred while deleting the tremp." + ex, HttpStatusCode.InternalServerError);
            }
        }

        public async Task<List<UserTrempsDetailsDto>> GetUserTrempsByType(int userId, string trempType)
        {
            bool type = ConvertFromStringToBool(trempType);

            // Get all tremps created by the user of the given type
            List<Tremp> createdTremps = await entities.Tremps.Where(t => t.User_Tremps.Any(ut => ut.user_id == userId &&
            ut.created_ride == true && t.tremp_type == type && !t.deleted)).ToListAsync();

            // Get all tremps NOT created by the user of the opposite type
            List<Tremp> notCreatedTremps = await entities.Tremps.Where(t => t.User_Tremps.Any(ut => ut.user_id == userId &&
            ut.created_ride == false && t.tremp_type != type && !t.deleted)).ToListAsync();

            // Combine the lists
            List<Tremp> allTremps = createdTremps.Concat(notCreatedTremps).ToList();

            MapperConfiguration config = new MapperConfiguration(cfg =>
            {
                cfg.CreateMap<Tremp, UserTrempsDetailsDto>()
                    .ForMember(dest => dest.tremp_type, opt => opt.MapFrom(src => GetTrempTypeAsString(src.tremp_type)))
                    .ForMember(dest => dest.approvalStatus, opt => opt.MapFrom(src => DetermineApprovalStatus(src, userId)));
            });

            IMapper mapper = config.CreateMapper();
            List<UserTrempsDetailsDto> trempDtos = mapper.Map<List<UserTrempsDetailsDto>>(allTremps);

            return trempDtos;
        }

        public async Task<List<TrempUserDto>> GetUsersInTremp(int trempId)
        {
            Tremp tremp = await entities.Tremps.FirstOrDefaultAsync(t => t.tremp_id == trempId);
            if (tremp == null) throw new ApiException("Tremp not found.", HttpStatusCode.NotFound);


            List<TrempUserDto> users = tremp.User_Tremps.Where(ut => ut.created_ride == false)
                .Select(ut => new TrempUserDto
                {
                    user_id = ut.user_id,
                    first_name = ut.User.first_name,
                    last_name = ut.User.last_name,
                    image_URL = ut.User.image_URL,
                    gender = ut.User.gender,
                    is_confirmed = ut.is_confirmed
                })
                .ToList();

            return users;
        }

        public async Task<List<ApprovedTrempDto>> GetUserApprovedTremps(int userId, string trempType)
        {
            bool type = ConvertFromStringToBool(trempType);

            // Query for tremps that the user created
            List<Tremp> createdTremps = await entities.Tremps
            .Where(t =>
                t.User_Tremps.Any(ut => ut.user_id == userId && ut.created_ride) &&
                t.tremp_type == type && !t.deleted &&
                t.User_Tremps.Any(ut => ut.is_confirmed == "approved") &&
                t.User_Tremps.Any(ut => !ut.created_ride && ut.is_confirmed.Equals("approved")))
            .ToListAsync();

            // Query for tremps that the user didn't create but is approved to join and not deleted
            List<Tremp> notCreatedTremps = await entities.Tremps
                .Where(t => t.User_Tremps.Any(ut => ut.user_id == userId &&
                       !ut.created_ride && ut.is_confirmed == "approved") &&
                       t.tremp_type != type && !t.deleted).ToListAsync();

            List<Tremp> allTremps = createdTremps.Concat(notCreatedTremps).ToList();

            AutoMapper.MapperConfiguration config = new MapperConfiguration(cfg =>
            {
                cfg.CreateMap<Tremp, ApprovedTrempDto>()
                    .ForMember(dest => dest.tremp_id, opt => opt.MapFrom(src => src.tremp_id))
                    .ForMember(dest => dest.tremp_type, opt => opt.MapFrom(src => GetTrempTypeAsString(src.tremp_type)))
                    .ForMember(dest => dest.tremp_time, opt => opt.MapFrom(src => src.tremp_time))
                    .ForMember(dest => dest.from_route, opt => opt.MapFrom(src => src.from_route))
                    .ForMember(dest => dest.to_route, opt => opt.MapFrom(src => src.to_route))
                    .ForMember(dest => dest.note, opt => opt.MapFrom(src => src.note))
                    .ForMember(dest => dest.seats_amount, opt => opt.MapFrom(src => src.seats_amount))
                    .ForMember(dest => dest.driver, opt => opt.MapFrom(src => src.User_Tremps.Where(ut => ut.created_ride == true && ut.is_confirmed == "approved").Select(ut => new ApprovedUserDto
                    {
                        user_id = ut.user_id,
                        first_name = ut.User.first_name,
                        last_name = ut.User.last_name
                    }).FirstOrDefault()))
                    .ForMember(dest => dest.hitchhikers, opt => opt.MapFrom(src => src.User_Tremps.Where(ut => ut.created_ride == false && ut.is_confirmed == "approved").Select(ut => new ApprovedUserDto
                    {
                        user_id = ut.user_id,
                        first_name = ut.User.first_name,
                        last_name = ut.User.last_name
                    }).ToList()));
            });

            IMapper mapper = config.CreateMapper();
            List<ApprovedTrempDto> trempDtos = mapper.Map<List<ApprovedTrempDto>>(allTremps);

            return trempDtos;
        }

        private enum ApprovalStatus
        {
            NoOffers,
            AwaitingConfirmation,
            Approved,
            PendingConfirmation,
            NotApproved
        }

        private string DetermineApprovalStatus(Tremp tremp, int userId)
        {
            User_Tremps currentUser = tremp.User_Tremps.FirstOrDefault(ut => ut.user_id == userId);
            ApprovalStatus status = ApprovalStatus.NotApproved;

            if (currentUser.created_ride)
            {
                if (!tremp.User_Tremps.Any(ut => ut.user_id != userId) || tremp.User_Tremps.All(ut => ut.is_confirmed != "pending" && ut.is_confirmed != "approved"))
                {
                    status = ApprovalStatus.NoOffers;
                }
                else if (tremp.User_Tremps.Any(ut => ut.is_confirmed == "pending"))
                {
                    status = ApprovalStatus.AwaitingConfirmation;
                }
                else if (tremp.User_Tremps.Any(ut => ut.is_confirmed == "approved"))
                {
                    status = ApprovalStatus.Approved;
                }
            }
            else
            {
                switch (currentUser.is_confirmed)
                {
                    case "pending":
                        status = ApprovalStatus.PendingConfirmation;
                        break;
                    case "approved":
                        status = ApprovalStatus.Approved;
                        break;
                }
            }

            return GetApprovalStatusMessage(status, tremp.tremp_type);
        }

        private string GetApprovalStatusMessage(ApprovalStatus status, bool trempType)
        {
            switch (status)
            {
                case ApprovalStatus.NoOffers:
                    return "no offers";
                case ApprovalStatus.AwaitingConfirmation:
                    return "awaiting confirmation from you";
                case ApprovalStatus.PendingConfirmation:
                    return $"pending confirmation from {(trempType ? "the driver" : "the hitchhiker")}";
                case ApprovalStatus.Approved:
                    return "approved";
                case ApprovalStatus.NotApproved:
                    return "not approved";
                default:
                    return "";
            }
        }

        private bool ConvertFromStringToBool(string type) { return type == "driver"; }

        private string GetTrempTypeAsString(bool isDriver)
        {
            return isDriver ? "driver" : "hitchhiker";
        }
    }
}

