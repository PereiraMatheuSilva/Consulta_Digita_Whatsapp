const readline = require('readline');
const chalk = require('chalk');

function mostrarProgresso(currentIndex, total, cpf, etapa) {
  const percentage = ((currentIndex / total) * 100).toFixed(2);
  readline.cursorTo(process.stdout, 0);
  const mensagem = etapa === 'Lotus'
    ? chalk.blue(`Progresso: ${percentage}% | Lotus | Processando CPF: ${cpf} (${currentIndex} de ${total})`)
    : '';
  process.stdout.write(mensagem);
}

module.exports = { mostrarProgresso };