// utils/messageUtils.js
async function sendMessage(client, phoneNumber, message) {
    try {
      // Formate o número de telefone para o formato do WhatsApp (sem sinais, com código do país)
      const formattedNumber = '55' + phoneNumber.replace(/\D/g, ''); // Assumindo que é Brasil (+55)
      await client.sendText(`${formattedNumber}@c.us`, message);
      console.log(`Mensagem enviada para: ${phoneNumber}`);
    } catch (error) {
      console.error(`Erro ao enviar mensagem para ${phoneNumber}:`, error);
    }
  }
  
  module.exports = { sendMessage };