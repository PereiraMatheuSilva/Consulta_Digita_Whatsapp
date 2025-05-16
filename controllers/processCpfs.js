// processCpfs.js
const { simulateFGTSLotus } = require('../services/cartosv2');
const { mostrarProgresso } = require('../utils/progressoConsole');
const { inicializarPlanilha, salvarPlanilha } = require('../utils/excelHandler');
const delay = require('../utils/delay');
const { sendMessage } = require('../utils/messageUtils'); // Importe a função de envio de mensagem

async function processCpfs(cpfs, caminhoOutput, venomClient) { // Adicione venomClient como parâmetro
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
        NOME: proposta.name,
        EMAIL: proposta.email,
        PHONE: proposta.phone,
      });

      // Enviar mensagem ao cliente (se o telefone estiver disponível e a proposta for concluída)
      //console.log(proposta)

      if (proposta.phone && proposta.status === 'COMPLETED' && venomClient) {
        await sendMessage(venomClient, '55'+ '27992419296' + '@c.us', `${proposta.name}! seu saldo FGTS já está disponível vamos liberar 😊?`);
      }

      //if (proposta.phone && proposta.status === 'COMPLETED' && venomClient) {
      //  await sendMessage(venomClient, '55'+ `${proposta.phone}` + '@c.us', `${proposta.name}! seu //saldo FGTS já está disponível vamos liberar 😊?`);
      //}

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