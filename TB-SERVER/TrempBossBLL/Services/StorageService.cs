using Google.Apis.Auth.OAuth2;
using Google.Cloud.Storage.V1;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using TrempBossBLL.Exceptions;

namespace TrempBossBLL.Services
{
    public class StorageService
    {
        private readonly string bucketName = "tremp-boss--storage.appspot.com";
        private readonly StorageClient storageClient;

        public StorageService()
        {
            GoogleCredential credential = GoogleCredential.FromJson(@"{
                'type': 'service_account',
                'project_id': 'tremp-boss--storage',
                'private_key_id': 'afa0bc35066818b14f2bbe70baa05680d41b1bb4',
                'private_key': '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCurDe6sLBZkKNn\nSgrM7GZJ5pACUFTsfS8/fckUiyKujLWTfktjwmYBR19EIW9fTYaL+Sc+uTpNFxF/\nGNigKFVdJP/62C4MP016bT5dorT40KG2wuqZOn+VBEuSAMihB3KcGYi522DcC8iY\nd4JZ89oZK7NSJcUugrsLbqM0C7yFkXufIkGkgS6BMEIADb7k0m1g2gL7g2G4i1Wj\nGPpx+0BKtnOxmhjZlwqJvkWmat1emosfvjjEO2UZ2ZbeUjAXAGDP8Xj5+0bySm8q\n7CNHZb3gFup7DiF/FN7CfrElB+KdIrERVYMzNBgf1q3lCJnllZl+1piUgDk7Kuin\nKN++ST3nAgMBAAECggEAOAhwAjgPAlRXTtmeOFm3gIpxdQSPEaQg5YW03R27HPJv\nhyaTCagBb/SU13bAUvq8KCffkov562P0jWiLiWkW5T/qy+3Qa8Zc1OK5iHEbC9xl\nnArQFiKBbezIT0hoE9wfRHsedLyuyDgRe/OOgcurkbqGlloedIqkdQjjWt1O9yuK\nAimRY8z2QhCZ7L0A2GgSSlqgfp4MdiI9DTwvMawYvIaDycViQCNCg+HldX86UjGf\nrTmDfJJxQjM32/2oSn4Vza0Rj8OHXPOkLCWPLDggJkC/KjM6jTBN9eAVa3zqTx8i\nOcEmZVh4LXZj7132Ag4WYjyM7bEpPuWLq72ywf6noQKBgQDdnBJNGLdm+Qx7R91N\nB3HXqhiQEIHF2fxdNJKeYyts2F1OMp+YGbxbeASSMbiQTKM9WR4E2VH5nINqccXK\nYlq5oH4Jkd/yFJJq8Xt/19Y5rkhgR2OHir15OzxDCR+LZhQaPPX4Px7BCk2NTMti\nOCXVN19m02LSNHbS4IPAelH9BwKBgQDJx3lW07Zq4kfU/7FMl68hEp/6AUb3nRZT\nd1gWo660v1I1Oyne4E++gG0cTMEPxdr1KrLsESwdUx0Zk+p9jusqxwL6pRfqE0py\nnC9yHbwRJi9tC4VISQuZmCkRd3eiXTIRe3WZbPoNM7DX5t9V41ejl7GOVP1K+FM8\nVJklbkNgIQKBgEJDRIWg+lXj6gOCvX0m2LdvuOB6zxLl1zvXWG/bn0RwfZXANVA5\ngcSn4lYEX/dlsvnJB9zTTlugnPrbAhU9y3rtrkIWSCwOUql/gzn6w6eDoUiIkA4b\nQgRZ3e79b10zLJeb2sBbv0phVkcFy1qXB1j1saUBV+8amNz9HOgUqydJAoGAG1cb\n6dfl77WZZhL/QxGKeUC8zHM/2m0+iTCyjt6+3V7PFMdfdQOPypA8OIlt32U/tdiD\nRdlN0OtiFgUk0L58vt8YWD3mb6ENhVoEU8ITqX8zDeNxu8mp+LXVWriFTUqzbgr8\ndD1/5CoM3DQ8LrcPOOtk85QwfegH3zTXS2sVVgECgYB7/nidR1gUeScRRtSCoHa1\nCflsw9klx2mX1lbHvACkodgWf35rCBLj7CBemFC7WNw+EgLXzrTCXA7Dq0n6I//E\nsDjHqs+4TMqbdbni/k18eibKtlJWaxmfzIV/WjR/HLeN71ZbStqVaz9xHD2a98zY\n024+eWhzjQdFarakm6VrzA==\n-----END PRIVATE KEY-----\n',
                'client_email': 'firebase-adminsdk-dfgnj@tremp-boss--storage.iam.gserviceaccount.com',
                'client_id': '111921769554018117237',
                'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
                'token_uri': 'https://oauth2.googleapis.com/token',
                'auth_provider_x509_cert_url': 'https://www.googleapis.com/oauth2/v1/certs',
                'client_x509_cert_url': 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-dfgnj%40tremp-boss--storage.iam.gserviceaccount.com',
                'universe_domain': 'googleapis.com'
                }
            ");
            storageClient = StorageClient.Create(credential);
        }

        public void DeleteImage(string objectName)
        {
            try
            {
                storageClient.DeleteObject(bucketName, objectName);
            }
            catch (Exception ex)
            {
                throw new ApiException($"An error occurred while deleting the object: {ex.Message}", HttpStatusCode.InternalServerError);
            }
        }


        public string UploadImage(Stream fileStream, string fileName)
        {
            try
            {
                string objectName = "users-images/" + fileName;
                storageClient.UploadObject(bucketName, objectName, null, fileStream);

                string publicUrl = $"https://firebasestorage.googleapis.com/v0/b/{bucketName}/o/{Uri.EscapeDataString(objectName)}?alt=media";
                return publicUrl;
            }
            catch (Exception ex)
            {
                throw new ApiException($"An error occurred: {ex.Message}",HttpStatusCode.InternalServerError);
            }
        }
    }
}
