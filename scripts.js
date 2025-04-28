document.getElementById('analyze-button').addEventListener('click', function() {
  const decklistText = document.getElementById('decklist').value;
  const deck = parseDeck(decklistText);
  renderCharts(deck);
  renderSummary(deck);
});

function parseDeck(text) {
  const lines = text.split('\\n');
  const manaCurve = Array(8).fill(0); // CMC 0 to 7+
  const colors = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
  const types = { Creature: 0, Land: 0, Instant: 0, Sorcery: 0, Enchantment: 0, Artifact: 0, Planeswalker: 0, Other: 0 };

  lines.forEach(line => {
    const parts = line.trim().split(' ');
    if (parts.length < 2) return;

    const name = parts.slice(1).join(' ');
    const lowerName = name.toLowerCase();

    // Fake parsing logic for now
    if (lowerName.includes('land')) types.Land++;
    else if (lowerName.includes('creature')) types.Creature++;
    else if (lowerName.includes('instant')) types.Instant++;
    else if (lowerName.includes('sorcery')) types.Sorcery++;
    else if (lowerName.includes('enchantment')) types.Enchantment++;
    else if (lowerName.includes('artifact')) types.Artifact++;
    else if (lowerName.includes('planeswalker')) types.Planeswalker++;
    else types.Other++;

    // Simulated random CMC 0–7+ (in real use, you'd query a database like Scryfall)
    const cmc = Math.floor(Math.random() * 8);
    manaCurve[cmc]++;

    // Random color logic for now
    const randomColor = Object.keys(colors)[Math.floor(Math.random() * Object.keys(colors).length)];
    colors[randomColor]++;
  });

  return { manaCurve, colors, types };
}

function renderCharts(deck) {
  const manaCtx = document.getElementById('manaCurveChart').getContext('2d');
  new Chart(manaCtx, {
    type: 'bar',
    data: {
      labels: ['0', '1', '2', '3', '4', '5', '6', '7+'],
      datasets: [{
        label: 'Cards',
        backgroundColor: '#66ffcc',
        data: deck.manaCurve
      }]
    }
  });

  const colorCtx = document.getElementById('colorPieChart').getContext('2d');
  new Chart(colorCtx, {
    type: 'pie',
    data: {
      labels: Object.keys(deck.colors),
      datasets: [{
        label: 'Colors',
        backgroundColor: ['#fff', '#00f', '#000', '#f00', '#0f0', '#aaa'],
        data: Object.values(deck.colors)
      }]
    }
  });

  const typeCtx = document.getElementById('typeBarChart').getContext('2d');
  new Chart(typeCtx, {
    type: 'bar',
    data: {
      labels: Object.keys(deck.types),
      datasets: [{
        label: 'Types',
        backgroundColor: '#ffcc66',
        data: Object.values(deck.types)
      }]
    }
  });
}

function renderSummary(deck) {
  const summaryDiv = document.getElementById('deck-summary');
  summaryDiv.innerHTML = `
    <p><strong>Creatures:</strong> ${deck.types.Creature}</p>
    <p><strong>Lands:</strong> ${deck.types.Land}</p>
    <p><strong>Instants:</strong> ${deck.types.Instant}</p>
    <p><strong>Sorceries:</strong> ${deck.types.Sorcery}</p>
    <p><strong>Enchantments:</strong> ${deck.types.Enchantment}</p>
    <p><strong>Artifacts:</strong> ${deck.types.Artifact}</p>
    <p><strong>Planeswalkers:</strong> ${deck.types.Planeswalker}</p>
    <p><strong>Other:</strong> ${deck.types.Other}</p>
  `;
}
