using Newtonsoft.Json;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Web.Http;
using System.Web.Http.Results;

namespace TrempBossAPI.Services
{
    public class SuccessResponse
    {
        public bool status { get; set; }
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public object data { get; set; }
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string message { get; set; }

        public SuccessResponse(object successData, string successMessage)
        {
            status = true;
            data = successData;
            message = successMessage;
        }
    }

    public static class ResponseHandler
    {
        public static IHttpActionResult SuccessResponse(HttpRequestMessage request, object data, HttpStatusCode statusCode = HttpStatusCode.OK, string message = null)
        {
            SuccessResponse response = new SuccessResponse(data, message);
            HttpResponseMessage httpResponseMessage = request.CreateResponse(statusCode, response);
            return new ResponseMessageResult(httpResponseMessage);
        }
    }
}