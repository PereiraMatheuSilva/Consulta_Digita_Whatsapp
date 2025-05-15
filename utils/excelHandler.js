const XLSX = require('xlsx');
const fs = require('fs');

function inicializarPlanilha(caminho) {
  let workbook, worksheet, dadosExcel;

  if (fs.existsSync(caminho)) {
    workbook = XLSX.readFile(caminho);
    worksheet = workbook.Sheets['LOTUS'] || XLSX.utils.aoa_to_sheet([]);
    dadosExcel = XLSX.utils.sheet_to_json(worksheet);
  } else {
    workbook = XLSX.utils.book_new();
    worksheet = XLSX.utils.aoa_to_sheet([[
      'CPF', 'SALDO', 'STATUS', 'MENSAGEM', 'NOME', 'EMAIL', 'PHONE'
    ]]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'LOTUS');
    dadosExcel = [];
  }
  return { workbook, worksheet, dadosExcel };
}

function salvarPlanilha(workbook, dados, caminho) {
  const novaPlanilha = XLSX.utils.json_to_sheet(dados, {
    header: ['CPF', 'SALDO', 'STATUS', 'MENSAGEM', 'NOME', 'EMAIL', 'PHONE']
  });
  workbook.Sheets['LOTUS'] = novaPlanilha;
  XLSX.writeFile(workbook, caminho);
}

module.exports = { inicializarPlanilha, salvarPlanilha };