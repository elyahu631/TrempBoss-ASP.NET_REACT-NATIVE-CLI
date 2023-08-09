// TrempsController.cs

using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using TrempBossAPI.Services;
using TrempBossBLL;
using TrempBossBLL.Exceptions;
using TrempBossBLL.Models;

namespace TrempBossAPI.Controllers
{
    [JwtAuthentication]
    [RoutePrefix("api/tremps")]
    public class TrempsController : ApiController
    {
        private readonly TrempsBLL trempsBLL;

        public TrempsController() => trempsBLL = new TrempsBLL();

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                trempsBLL.Dispose();
            }
            base.Dispose(disposing);
        }

        /// <summary>
        /// Adds a new tremp based on the provided details.
        /// </summary>
        [HttpPost]
        [Route("add")]
        public async Task<IHttpActionResult> AddTrempAsync([FromBody] AddTrempRequest tremp)
        {
            await trempsBLL.AddTremp(tremp);
            return ResponseHandler.SuccessResponse(Request, null, HttpStatusCode.Created, "Tremp added successfully");
        }


        /// <summary>
        /// Retrieves tremps based on the provided filtering criteria.
        /// </summary>        
        [HttpPost]
        [Route("tremps-by-filters")]
        public async Task<IHttpActionResult> GetTremps([FromBody] GetUnJoinTrempsRequest unJoinTrempRequest)
        {
            List<TrempBossBLL.DTOs.TrempDto> tremps = await trempsBLL.GetTremps(unJoinTrempRequest);
            return ResponseHandler.SuccessResponse(Request, tremps, HttpStatusCode.Created);
        }

        /// <summary>
        /// Allows a user to join a specific tremp.
        /// </summary>
        [HttpPost]
        [Route("join-ride")]
        public async Task<IHttpActionResult> JoinUserToTremp([FromBody] JoinOrDeleteTrempRequest joinRequest)
        {
            await trempsBLL.JoinUserToTremp(joinRequest);
            return ResponseHandler.SuccessResponse(Request, null, HttpStatusCode.OK, "User joined to tremp successfully");
        }

        /// <summary>
        /// Approves or denies a user's participation in a tremp.
        /// </summary>
        [HttpPut]
        [Route("approve-user-in-tremp")]
        public async Task<IHttpActionResult> ApproveUserInTremp([FromBody] ApproveUserInTrempRequest approveRequest)
        {
            string message = await trempsBLL.ApproveUserInTremp(approveRequest.tremp_id, approveRequest.creator_id, approveRequest.user_id, approveRequest.approval);
            return ResponseHandler.SuccessResponse(Request, null, HttpStatusCode.OK, message);
        }


        /// <summary>
        /// Deletes a specific tremp or cancels a user's participation in it.
        /// </summary>
        [HttpPut]
        [Route("delete-tremp")]
        [HttpDelete]
        public async Task<IHttpActionResult> DeleteTremp([FromBody] JoinOrDeleteTrempRequest joinOrDeleteRequest)
        {
            string message = await trempsBLL.DeleteTremp(joinOrDeleteRequest.tremp_id, joinOrDeleteRequest.user_id);
            return ResponseHandler.SuccessResponse(Request, null, HttpStatusCode.OK, message);
        }


        /// <summary>
        /// Retrieves tremps associated with a specific user and tremp type.
        /// </summary>
        [HttpPost]
        [Route("get-user-tremps")]
        public async Task<IHttpActionResult> GetUserTrempsByType([FromBody] GetUserTrempsRequest request)
        {
            List<TrempBossBLL.DTOs.UserTrempsDetailsDto> result = await trempsBLL.GetUserTrempsByType(request.user_id, request.tremp_type);
            return ResponseHandler.SuccessResponse(Request, result, HttpStatusCode.OK, "Success");
        }

        /// <summary>
        /// Retrieves a list of users participating in a specific tremp.
        /// </summary>
        [HttpGet]
        [Route("get-users-in-tremp/{trempId}")]
        public async Task<IHttpActionResult> GetUsersInTremp(int trempId)
        {
            List<TrempBossBLL.DTOs.TrempUserDto> result = await Task.Run(() => trempsBLL.GetUsersInTremp(trempId));
            return ResponseHandler.SuccessResponse(Request, result, HttpStatusCode.OK, "Success");
        }

        /// <summary>
        /// Retrieves tremps that a user has been approved to participate in.
        /// </summary>
        [HttpPost]
        [Route("approved-tremps")]
        public async Task<IHttpActionResult> GetUserApprovedTremps([FromBody] GetUserTrempsRequest request)
        {
            List<TrempBossBLL.DTOs.ApprovedTrempDto> tremps = await trempsBLL.GetUserApprovedTremps(request.user_id, request.tremp_type);
            return ResponseHandler.SuccessResponse(Request, tremps, HttpStatusCode.OK);
        }
    }
}
