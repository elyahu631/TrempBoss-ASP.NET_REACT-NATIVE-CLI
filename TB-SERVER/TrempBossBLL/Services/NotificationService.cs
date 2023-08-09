using System;
using System.Collections.Generic;
using System.Configuration;
using System.Net;
using System.Threading.Tasks;
using TrempBossBLL.Exceptions;
using TrempBossBLL.Services;

public interface INotificationService
{
    Task SendNotificationAsync(string notificationToken, string title, string body, Dictionary<string, string> data = null);
}


public class NotificationService : INotificationService
{
    private readonly string serverKey;

    public NotificationService()
    {

        //KeyVaultManager keyVaultManager = new KeyVaultManager("https://trempboss-vault.vault.azure.net/");
        //serverKey = keyVaultManager.GetSecretValueAsync("FcmServerKey").GetAwaiter().GetResult();
          
        // Retrieve the server key from the environment variable
        //serverKey = Environment.GetEnvironmentVariable("FcmServerKey");
        serverKey = "AAAAkTb7CQw:APA91bHwMaGomL76D8Mt2iKmhzfHR6spQBS9-ZadzKN5pWpOa-W4XXXxrqWEpjHbeRc3pt73AWpzyzrcc-QiLq3JUf44UB_xwXavHjBYAen95D-LXzUDArJfMfp4vvcfWpRXUgvZLDPP"; // Retrieve the server key from Web.config

        if (string.IsNullOrEmpty(serverKey))
        {
            throw new ConfigurationErrorsException("FcmServerKey environment variable is not set.");
        }
    }

    public async Task SendNotificationAsync(string notificationToken, string title, string body, Dictionary<string, string> data = null)
    {
        if (string.IsNullOrEmpty(notificationToken) || string.IsNullOrEmpty(title) || string.IsNullOrEmpty(body))
        {
            throw new ArgumentException("Notification parameters should not be null or empty.");
        }

        try
        {
            FcmNotification notification = new FcmNotification
            {
                To = notificationToken,
                Notification = new FcmNotification.NotificationBody
                {
                    Title = title,
                    Body = body
                },
                Data = data
            };

            // Send the notification
            await FcmNotification.SendAsync(notification, serverKey);
        }
        catch (Exception ex)
        {          
            throw new ApiException($"Failed to send notification {ex},{serverKey}", HttpStatusCode.InternalServerError);
        }
    }
}
