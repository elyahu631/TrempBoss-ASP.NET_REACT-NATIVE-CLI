using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using TrempBossBLL.Exceptions;

public class FcmNotification
{
    [JsonProperty("to")]
    public string To { get; set; }

    [JsonProperty("notification")]
    public NotificationBody Notification { get; set; }

    [JsonProperty("data")]
    public Dictionary<string, string> Data { get; set; }

    public class NotificationBody
    {
        [JsonProperty("title")]
        public string Title { get; set; }

        [JsonProperty("body")]
        public string Body { get; set; }
    }

    public static async Task SendAsync(FcmNotification notification, string serverKey)
    {
        try
        {
            using (HttpClient client = new HttpClient())
            {
                string jsonMessage = JsonConvert.SerializeObject(notification);
                StringContent content = new StringContent(jsonMessage, Encoding.UTF8, "application/json");
                client.DefaultRequestHeaders.Add("Authorization", $"Bearer {serverKey}");
                HttpResponseMessage response = await client.PostAsync("https://fcm.googleapis.com/fcm/send", content);

                if (!response.IsSuccessStatusCode)
                {
                    string error = await response.Content.ReadAsStringAsync();
                    throw new ApiException($"Failed to send notification: {error},{serverKey}", HttpStatusCode.InternalServerError);
                }
            }
        }
        catch (Exception ex)
        {
            throw new ApiException($"Failed to send notification: {ex.Message}", HttpStatusCode.InternalServerError);
        }
    }

}
