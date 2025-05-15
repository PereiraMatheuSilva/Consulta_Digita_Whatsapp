const fs = require('fs');
const XLSX = require('xlsx');

function carregarCpfsDaPlanilha(caminhoArquivo) {
  const caminhoLimpo = caminhoArquivo.replace(/['"]/g, '');
  if (!fs.existsSync(caminhoLimpo)) {
    throw new Error(`Arquivo ${caminhoLimpo} não encontrado`);
  }
  const workbook = XLSX.readFile(caminhoLimpo);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  const cpfColumn = Object.keys(jsonData[0] || {}).find(key => key.toLowerCase() === 'cpf');
  if (!cpfColumn) throw new Error('Coluna "CPF" não encontrada na planilha.');
  return jsonData.map(row => row[cpfColumn]);
}

module.exports = { carregarCpfsDaPlanilha };