using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TrempBossBLL.Services
{
    public class KeyVaultManager
    {
        private readonly SecretClient _secretClient;

        public KeyVaultManager(string keyVaultUri)
        {
            _secretClient = new SecretClient(new Uri(keyVaultUri), new DefaultAzureCredential());
        }

        public async Task<string> GetSecretValueAsync(string secretName)
        {
            KeyVaultSecret secret = await _secretClient.GetSecretAsync(secretName);
            return secret.Value;
        }
    }
}
