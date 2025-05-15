require('dotenv').config();
const express = require('express');
const path = require('path');
const { solicitarArquivo } = require('./cli/inputHandler');

const app = express();
const port = 3333;

const nomeArquivo = `LOTUS-${new Date().toISOString().split('T')[0]}.xlsx`;
const caminhoOutput = path.resolve(__dirname, nomeArquivo);

app.use(express.json());

app.listen(port, () => {
  console.log(`Busca de CPFs INICIANDO.....`);
  solicitarArquivo(caminhoOutput);
});