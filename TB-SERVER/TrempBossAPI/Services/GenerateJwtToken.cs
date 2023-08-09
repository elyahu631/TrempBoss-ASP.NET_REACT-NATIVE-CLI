using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http.Headers;
using System.Net.Http;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Threading;
using System.Web;
using System.Web.Http.Filters;
using System.Web.Http.Results;
using TrempBossBLL.DTOs;
using System.Configuration;

namespace TrempBossAPI.Services
{
    public class JwtAuthenticationAttribute : Attribute, IAuthenticationFilter
    {
        public Task AuthenticateAsync(HttpAuthenticationContext context, CancellationToken cancellationToken)
        {
            HttpRequestMessage request = context.Request;
            AuthenticationHeaderValue authorizationHeader = request.Headers.Authorization;

            if (authorizationHeader == null || authorizationHeader.Scheme != "Bearer" || string.IsNullOrEmpty(authorizationHeader.Parameter))
            {
                context.ErrorResult = new UnauthorizedResult(new AuthenticationHeaderValue[0], request);
                return Task.CompletedTask;
            }

            JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
            string tokenKey = ConfigurationManager.AppSettings["TokenKEY"];
            byte[] key = Encoding.ASCII.GetBytes(tokenKey);

            TokenValidationParameters validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false
            };

            try
            {
                tokenHandler.ValidateToken(authorizationHeader.Parameter, validationParameters, out _);
            }
            catch (Exception)
            {
                context.ErrorResult = new UnauthorizedResult(new AuthenticationHeaderValue[0], request);
            }

            return Task.CompletedTask;
        }

        public Task ChallengeAsync(HttpAuthenticationChallengeContext context, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }

        public bool AllowMultiple => false;
    }
}
