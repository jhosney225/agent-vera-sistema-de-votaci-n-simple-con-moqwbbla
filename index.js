const readline = require('readline');
const fs = require('fs');

// Simple voting system with results
class VotingSystem {
  constructor() {
    this.votes = {};
    this.voters = new Set();
    this.votingActive = true;
  }

  // Initialize voting options
  initializeOptions(options) {
    options.forEach(option => {
      this.votes[option] = 0;
    });
  }

  // Register a vote
  vote(voterName, option) {
    if (this.voters.has(voterName)) {
      return { success: false, message: `${voterName} ya ha votado` };
    }

    if (!this.votes.hasOwnProperty(option)) {
      return { success: false, message: `La opción "${option}" no existe` };
    }

    if (!this.votingActive) {
      return { success: false, message: 'La votación ha terminado' };
    }

    this.votes[option]++;
    this.voters.add(voterName);
    return { success: true, message: `${voterName} votó por: ${option}` };
  }

  // Get current results
  getResults() {
    const totalVotes = Object.values(this.votes).reduce((a, b) => a + b, 0);
    const results = {};

    for (const [option, count] of Object.entries(this.votes)) {
      const percentage = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(2) : 0;
      results[option] = {
        votes: count,
        percentage: `${percentage}%`
      };
    }

    return {
      totalVotes,
      results,
      voters: this.voters.size
    };
  }

  // End voting
  endVoting() {
    this.votingActive = false;
    return { message: 'La votación ha terminado' };
  }

  // Get winner
  getWinner() {
    if (Object.values(this.votes).reduce((a, b) => a + b, 0) === 0) {
      return { winner: null, message: 'No hay votos registrados' };
    }

    let maxVotes = 0;
    let winner = null;

    for (const [option, count] of Object.entries(this.votes)) {
      if (count > maxVotes) {
        maxVotes = count;
        winner = option;
      }
    }

    return { winner, votes: maxVotes };
  }

  // Display results in console
  displayResults() {
    const results = this.getResults();
    console.log('\n========== RESULTADOS DE LA VOTACIÓN ==========');
    console.log(`Total de votos: ${results.totalVotes}`);
    console.log(`Total de votantes: ${results.voters}`);
    console.log('----------------------------------------------');

    for (const [option, data] of Object.entries(results.results)) {
      const barLength = Math.round(data.votes / (results.totalVotes || 1) * 20);
      const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);
      console.log(`${option.padEnd(15)} ${bar} ${data.votes} votos (${data.percentage})`);
    }

    const winner = this.getWinner();
    if (winner.winner) {
      console.log('----------------------------------------------');
      console.log(`🏆 GANADOR: ${winner.winner} con ${winner.votes} votos`);
    }
    console.log('==============================================\n');
  }
}

// Main application
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  console.log('╔════════════════════════════════════════╗');
  console.log('║    SISTEMA DE VOTACIÓN SIMPLE          ║');
  console.log('╚════════════════════════════════════════╝\n');

  // Initialize system
  const votingSystem = new VotingSystem();
  const optionsInput = await question('Ingrese las opciones de voto separadas por comas:\n> ');
  const options = optionsInput.split(',').map(opt => opt.trim());

  votingSystem.initializeOptions(options);

  console.log(`\n✓ Opciones registradas: ${options.join(', ')}`);
  console.log('Comando "resultados" para ver resultados');
  console.log('Comando "finalizar" para terminar la votación\n');

  // Main voting loop
  let running = true;
  while (running) {
    const command = await question('Ingrese comando o nombre del votante:\n> ');

    if (command.toLowerCase() === 'resultados') {
      votingSystem.displayResults();
    } else if (command.toLowerCase() === 'finalizar') {
      votingSystem.endVoting();
      console.log('\n✓ Votación finalizada');
      running = false;
    } else if (command.trim() !== '') {
      const voterName = command.trim();
      const option = await question(`${voterName}, ¿por cuál opción vota? (${options.join('/')}):\n> `);

      const result = votingSystem.vote(voterName, option.trim());
      console.log(`→ ${result.message}\n`);
    }
  }

  // Final results
  console.log('\n╔════════════════════════════════════════╗');
  votingSystem.displayResults();
  console.log('╚════════════════════════════════════════╝');

  rl.close();
}

// Run application
main().catch(console.error);