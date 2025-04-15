let lifeTotals = [40, 40, 40, 40, 40];
let currentPhaseIndex = 0;
const phases = ["Inicio", "Mantenimiento", "Principal", "Combate", "Final"];

function changeLife(player, amount) {
  lifeTotals[player - 1] += amount;
  document.getElementById(`life${player}`).innerText = lifeTotals[player - 1];
}

function nextPhase() {
  currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
  document.getElementById("phaseDisplay").innerText = "Fase actual: " + phases[currentPhaseIndex];
}

function searchCard() {
    const name = document.getElementById("cardInput").value;
    const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(name)}`;
  
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.data && data.data.length > 0) {
          const cards = data.data.slice(0, 10); // Solo mostramos las primeras 10
          const html = cards.map(card => {
            if (card.image_uris) {
              return `<div><img src="${card.image_uris.normal}" alt="${card.name}" title="${card.name}"/></div>`;
            }
            return "";
          }).join("");
          document.getElementById("cardResult").innerHTML = html;
        } else {
          document.getElementById("cardResult").innerHTML = "<p>No se encontraron cartas.</p>";
        }
      })
      .catch(() => {
        document.getElementById("cardResult").innerHTML = "<p>Error al buscar cartas.</p>";
      });
  }
  
