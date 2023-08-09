using Microsoft.IdentityModel.Tokens;
using System;
using System.Text;
using System.Web.Http;
using System.Web.Http.Cors;
using TrempBossAPI.Services;
using TrempBossBLL.Exceptions;

namespace TrempBossAPI
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {

            config.Filters.Add(new TrempBossBLL.Exceptions.ApiExceptionFilterAttribute());

            config.Filters.Add(new ValidateModelFilterAttribute());

            //config.Filters.Add(new JwtAuthenticationAttribute());

            // Web API configuration and services
            EnableCorsAttribute cors = new EnableCorsAttribute("*", "*", "*");
            config.EnableCors(cors);

            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
        }
    }
}
