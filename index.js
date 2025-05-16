// index.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const { solicitarArquivo } = require('./cli/inputHandler');
const { initializeVenom } = require('./cli/venomHandler'); // Importe o venomHandler

const app = express();
const port = 3333;

const nomeArquivo = `LOTUS-${new Date().toISOString().split('T')[0]}.xlsx`;
const caminhoOutput = path.resolve(__dirname, nomeArquivo);

app.use(express.json());

app.listen(port, async () => { // Torne a função assíncrona
  console.log('Lotus Inicializado na porta 3333');

  try {
    const venomClient = await initializeVenom(); // Inicialize o Venom e aguarde
    console.log('Whatsapp inicializado com sucesso!');
    console.log('Busca de CPFs INICIANDO.....');
    solicitarArquivo(caminhoOutput, venomClient); // Passe o cliente do Venom
  } catch (error) {
    console.error('Erro ao inicializar o Venom ou ao processar o arquivo:', error);
    process.exit(1);
  }
});