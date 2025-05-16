// venomHandler.js
const venom = require('venom-bot');
const path = require('path');

let clientInstance = null; // Para armazenar a instância do cliente

async function initializeVenom() {
  return new Promise((resolve, reject) => {
    venom
      .create({
        session: 'lotus-bot', // Nome da sessão
        multidevice: false,
        folderNameToken: 'lotus-bot', // Nome da subpasta dentro de ../token
        mkdirFolderToken: path.resolve(__dirname, '../token'), // Caminho absoluto para a pasta ../token
        disableWelcome: true // Opcional: remove mensagens de boas-vindas no console
      })
      .then((client) => {
        clientInstance = client;
        resolve(client);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getClient() {
  if (!clientInstance) {
    throw new Error('Venom Client not initialized!');
  }
  return clientInstance;
}

module.exports = { initializeVenom, getClient };
