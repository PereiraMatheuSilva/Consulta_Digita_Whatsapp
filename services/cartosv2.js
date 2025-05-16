// ==== Importações ====
require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const https = require('https');
const fs = require('fs'); // (não utilizado no código atual)
const path = require('path'); // (não utilizado no código atual)

// ==== Variáveis de Ambiente ====
const token = process.env.TOKEN_LOTUS;
if (!token) {
  console.error("Token não foi carregado. Verifique o arquivo .env e a variável TOKEN_LOTUS");
  process.exit(1);
}

const tableId = process.env.TABLE_ID;
if (!tableId) {
  console.error("TABLE_ID não foi carregado. Verifique o arquivo .env.");
  process.exit(1);
}

// ==== Configuração HTTPS ====
const agent = new https.Agent({
  secureProtocol: 'TLSv1_2_method',
});

// ==== Headers Comuns ====
const commonHeaders = {
  'accept': 'application/json',
  'accept-encoding': 'gzip, deflate, br, zstd',
  'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
  'access-control-allow-origin': '*',
  'authorization': `Bearer ${token}`,
  'content-type': 'application/json',
  'origin': 'https://app.lotusmais.com.br',
  'referer': 'https://app.lotusmais.com.br/',
  'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'cross-site',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'x-request-id': '8972eb1d-b6e9-4223-899b-03ab082ce1ea'
};

// ==== Utilitários ====
function limparCPF(cpf) {
  return cpf.replace(/\D/g, '');
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==== Requisições Auxiliares ====
async function createCustomer(customerData) {
  try {
    const response = await axios.post(
      'https://backoffice-prod-dycyrhjbkq-rj.a.run.app/v1/customers',
      customerData,
      { headers: commonHeaders, httpsAgent: agent }
    );
    //console.log('Resposta da Criação do Cliente:', response.data);
    return response.data.customer.id;
  } catch (error) {
    console.error('Erro ao criar cliente:', error.response?.data || error.message);
    return null;
  }
}

async function createProposal(customerId, simulationId) {
  try {
    const response = await axios.post(
      'https://backoffice-prod-dycyrhjbkq-rj.a.run.app/v1/fgts/create-proposal',
      {
        customerId,
        simulationId,
        interestRate: 0.01799,
        numberOfPeriods: 10,
        reservationAmount: 50
      },
      { headers: commonHeaders, httpsAgent: agent }
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao criar proposta:', error.response?.data || error.message);
    return null;
  }
}

// ==== Função Principal ====
async function simulateFGTSLotus(cpf) {
  const cpfLimpo = limparCPF(cpf);

  const payload = {
    cpf: cpfLimpo,
    interestRate: 0.01799,
    numberOfPeriods: 10,
    reservationAmount: 50,
    tableId,
    hasInsurance: false,
    useProvider: "CARTOS"
  };

  try {
    const createRes = await axios.post(
      'https://backoffice-prod-dycyrhjbkq-rj.a.run.app/v1/fgts/create-simulation',
      payload,
      { headers: commonHeaders, httpsAgent: agent }
    );

    const { id } = createRes.data;
    if (!id) {
      return {
        proposta: {
          cpf,
          status: "ERROR",
          name: 'nulo',
          email: 'nulo',
          phone: 'nulo',
        }
      };
    }

    let attempts = 0;
    let simulationData;

    while (attempts < 11) {
      await delay(5000);
      attempts++;

      const simRes = await axios.get(
        `https://backoffice-prod-dycyrhjbkq-rj.a.run.app/v1/fgts/simulation/${id}`,
        { headers: commonHeaders, httpsAgent: agent }
      );

      simulationData = simRes.data;

      if (simulationData.status === 'ERROR') {
        return {
          proposta: {
            cpf,
            status: "ERROR",
            message: simulationData.message || 'nulo',
            name: 'sem nome',
            email: 'sem email',
            phone: 'sem telefone',
          }
        };
      }
  
      if (simulationData.status === 'COMPLETED') {
        const saldo = simulationData.simulation?.totalTransfer || 0;
        const customer = simulationData.customer;

        if (customer) {
          const customerId = await createCustomer({
            cpf: customer.cpf,
            registerNumber: customer.registerNumber,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            motherName: customer.motherName,
            birthDate: customer.birthDate,
            gender: customer.gender,
            maritalStatus: customer.maritalStatus,
            zipCode: customer.zipCode,
            street: customer.street,
            number: customer.number,
            complement: customer.complement,
            neighborhood: customer.neighborhood,
            city: customer.city,
            state: customer.state,
            bankCode: customer.bankCode,
            account: customer.account,
            accountDigit: customer.accountDigit,
            agency: customer.agency,
            paymentType: customer.paymentType,
            paymentPixKeyType: customer.paymentPixKeyType,
            paymentPixKey: customer.paymentPixKey,
            nationality: customer.nationality,
            personType: customer.personType,
            isPep: customer.isPep,
            isBlocked: customer.isBlocked,
            residencyType: customer.residencyType,
            status: customer.status
          });

          if (customerId) {
            await createProposal(customerId, id);
          }
        }

        return {
          proposta: {
            cpf,
            status: "COMPLETED",
            saldo,
            message: simulationData.message || 'nulo',
            name: customer.name || 'sem nome',
            email: customer.email || 'sem email',
            phone: customer.phone || 'sem telefone',
            createProposal: simulationData.createProposal || 'sem proposta',
          }
        };
      }
    }

    // Após 14 tentativas sem sucesso
    return {
      proposta: {
        cpf,
        status: "ERROR",
        message: 'Simulação não completada após 20 tentativas',
        name: 'sem nome',
        email: 'sem email',
        phone: 'sem telefone',
      }
    };

  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error("Erro na simulação:", errorMessage);
    return {
      proposta: {
        cpf,
        status: "ERROR",
        message: errorMessage,
        name: 'sem nome',
        email: 'sem email',
        phone: 'sem telefone',
      }
    };
  }
}

// ==== Exportação ====
module.exports = { simulateFGTSLotus };

// ==== Teste Manual (descomente para testar) ====
// simulateFGTSLotus('15263974809').then(console.log);
