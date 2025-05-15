const { simulateFGTSLotus } = require('../services/cartosv2');
const { mostrarProgresso } = require('../utils/progressoConsole');
const { inicializarPlanilha, salvarPlanilha } = require('../utils/excelHandler');
const delay = require('../utils/delay');

async function processCpfs(cpfs, caminhoOutput) {
  const { workbook, dadosExcel } = inicializarPlanilha(caminhoOutput);

  for (let i = 0; i < cpfs.length; i++) {
    const cpf = cpfs[i];
    mostrarProgresso(i + 1, cpfs.length, cpf, 'Lotus');

    try {
      const resultLotus = await simulateFGTSLotus(cpf);
      const proposta = resultLotus?.proposta || {};

      dadosExcel.push({
        CPF: proposta.cpf || cpf,
        SALDO: proposta.saldo || 0,
        STATUS: proposta.status || 'Sem informações',
        MENSAGEM: proposta.message || 'Sem mensagem',
        NOME: proposta.name || 'Sem nome',
        EMAIL: proposta.email || 'Sem email',
        PHONE: proposta.phone || 'Sem telefone',
      });
    } catch (error) {
      dadosExcel.push({
        CPF: cpf,
        SALDO: 0,
        STATUS: `Erro: ${error.message}`,
        MENSAGEM: 'Erro na simulação',
        NOME: 'Erro',
        EMAIL: 'Erro',
        PHONE: 'Erro',
      });
    }

    salvarPlanilha(workbook, dadosExcel, caminhoOutput);
    await delay(500);
  }
  console.log(`\n✅ Processamento concluído! Planilha final: ${caminhoOutput}`);
}

module.exports = { processCpfs };