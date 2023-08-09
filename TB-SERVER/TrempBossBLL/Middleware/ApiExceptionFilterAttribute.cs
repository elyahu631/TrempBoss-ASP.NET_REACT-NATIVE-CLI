using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using System.Web.Http.ModelBinding;

namespace TrempBossBLL.Exceptions
{
    public class ApiExceptionFilterAttribute : ExceptionFilterAttribute
    {
        public override void OnException(HttpActionExecutedContext context)
        {
            HttpStatusCode statusCode = HttpStatusCode.InternalServerError; // Default status code
            string message = context.Exception.Message;

            // Handle custom exceptions or specific exception types here
            if (context.Exception is TrempBossBLL.Exceptions.ApiException apiException)
            {
                // Use the status code from the ApiException
                statusCode = apiException.StatusCode;
            }

            var errorResponse = new
            {
                status = false,
                error = new
                {
                    message,
                    StatusCode = (int)statusCode
                }
            };

            context.Response = context.Request.CreateResponse(statusCode, errorResponse);
        }
    }

    public class ValidateModelFilterAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            if (!actionContext.ModelState.IsValid)
            {
                List<string> errors = actionContext.ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => string.IsNullOrEmpty(e.ErrorMessage) ? e.Exception?.Message : e.ErrorMessage)
                    .ToList();

                string errorMessage = string.Join("; ", errors);

                if (string.IsNullOrWhiteSpace(errorMessage))
                {
                    errorMessage = "Invalid request format or missing fields.";
                }

                throw new ApiException(errorMessage, HttpStatusCode.BadRequest);
            }
        }
    }

}
