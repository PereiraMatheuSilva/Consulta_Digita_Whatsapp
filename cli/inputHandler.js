// inputHandler.js
const readline = require('readline');
const { carregarCpfsDaPlanilha } = require('../utils/fileUtils');
const { processCpfs } = require('../controllers/processCpfs');

function solicitarArquivo(caminhoOutput, venomClient) { // Adicione venomClient como parâmetro
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  console.log('Por favor, arraste a planilha para o terminal e pressione Enter:');
  rl.question('Caminho do arquivo: ', async (arquivoCPF) => {
    rl.close();
    try {
      const cpfs = carregarCpfsDaPlanilha(arquivoCPF.trim());
      await processCpfs(cpfs, caminhoOutput, venomClient); // Passe o cliente do Venom
    } catch (error) {
      console.error('Erro:', error.message);
      process.exit(1);
    }
  });
}

module.exports = { solicitarArquivo };