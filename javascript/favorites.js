window.API = 'http://localhost:8000';


// ===== RENDER FAVORITES LIST =====
function renderFavorites() {
  const favs = getFavorites();
  const list = document.getElementById('favoritesList');
  const emptyState = document.getElementById('emptyState');
  const favCount = document.getElementById('favCount');
  const summaryList = document.getElementById('summaryList');
  const summaryCount = document.getElementById('summaryCount');

  favCount.textContent = `${favs.length} game${favs.length !== 1 ? 's' : ''}`;
  summaryCount.textContent = `${favs.length} game${favs.length !== 1 ? 's' : ''}`;

  if (favs.length === 0) {
    list.innerHTML = '';
    emptyState.classList.add('show');
    summaryList.innerHTML = '<div class="summary__item" style="color:#8f98a0;font-style:italic;">No games added yet</div>';
    return;
  }

  emptyState.classList.remove('show');

  list.innerHTML = favs.map(game => {

    const genreBadges = (game.genres || '').split(',').map(g => 
      `<span class="genre-badge">${g.trim()}</span>`
    ).join('');

    return `
      <div class="fav__item">
        <img class="fav__item-img" src="${game.image || ''}" alt="${game.name}"
             onerror="this.src='https://placehold.co/120x45/1b2838/8f98a0?text=No+Image'">
        <div class="fav__item-info">
          <div class="fav__item-name">${game.name}</div>
          <div class="fav__item-genres">${genreBadges}</div>
          <div class="fav__item-meta">
            <span class="fav__item-positive">
              <i class="fa-solid fa-thumbs-up"></i>
              ${(game.positive || 0).toLocaleString()} reviews
            </span>
          </div>
        </div>
        <button class="fav__item-remove" onclick="removeFromFavorites('${game.name.replace(/'/g, "\\'")}')">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;
  }).join('');
  
  summaryList.innerHTML = favs.map(game => `
    <div class="summary__item">${game.name}</div>
  `).join('');
}

// ===== RECOMMENDATIONS =====
async function loadRecommendations() {
  const favs = getFavorites();
  if (favs.length === 0) return;

  const btn = document.querySelector('.fav__recommend-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';

  const section = document.getElementById('recommendationsSection');
  const recList = document.getElementById('recommendationsList');

  section.style.display = 'block';
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });

  recList.innerHTML = `
    <div class="rec__grid">
      ${Array(6).fill(`
        <div class="skeleton-card-fav">
          <div class="skeleton skeleton-img-fav"></div>
          <div class="skeleton-body-fav">
            <div class="skeleton skeleton-line w70"></div>
            <div class="skeleton skeleton-line w50"></div>
          </div>
        </div>
      `).join('')}
    </div>`;

  try {
    const favNames = new Set(favs.map(f => f.name)); // để lọc game đã có trong favorites

    const results = await Promise.all(
      favs.map(async (game, favIndex) => {
        const res = await fetch(`${API}/recommend?title=${encodeURIComponent(game.name)}`);
        const data = await res.json();
        return { recs: data.recommendations || [], favIndex };
      })
    );

    const gameScores = new Map();

    results.forEach(({ recs, favIndex }) => {
      recs.forEach((rec, recIndex) => {
        if (favNames.has(rec.name)) return; // bỏ qua game đã có trong favorites

        const positionBonus = Math.max(0, 5 - recIndex);
        const similarityBonus = rec.score || 0;
        const totalScore = positionBonus + similarityBonus;

        const existing = gameScores.get(rec.name);
        if (existing) {
          existing.score += totalScore;
          existing.matchCount++;
          existing.similarity = Math.max(existing.similarity, similarityBonus);
          if (!existing.sources.includes(favs[favIndex].name)) {
            existing.sources.push(favs[favIndex].name);
          }
        } else {
          gameScores.set(rec.name, {
            name: rec.name,
            image: rec.image,
            score: totalScore,
            matchCount: 1,
            similarity: similarityBonus,
            sources: [favs[favIndex].name]
          });
        }
      });
    });

    const ranked = Array.from(gameScores.values())
      .map(game => ({
        ...game,
        finalScore: (game.score * 0.7) + (game.matchCount * 30)
      }))
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 24);

    if (ranked.length === 0) {
      recList.innerHTML = `
        <div class="rec__empty">
          <i class="fa-solid fa-lightbulb"></i>
          <p>No recommendations found.</p>
          <p class="rec__empty-hint">Try adding more games to your favorites</p>
        </div>`;
    } else {
      recList.innerHTML = `
        <div class="rec__grid">
          ${ranked.map(game => `
            <a class="rec__card" href="discovery.html?q=${encodeURIComponent(game.name)}">
              <img class="rec__card-img" src="${game.image}" alt="${game.name}"
                   onerror="this.src='https://placehold.co/460x215/1b2838/8f98a0?text=No+Image'">
              <div class="rec__card-info">
                <div class="rec__card-name">${game.name}</div>
                <div class="rec__card-source">
                  <i class="fa-solid fa-heart"></i>
                  Based on: ${game.sources.slice(0, 2).join(', ')}${game.sources.length > 2 ? '...' : ''}
                </div>
                <div class="rec__card-stats">
                  <span class="rec__card-match">
                    <i class="fa-solid fa-chart-simple"></i>
                    ${game.matchCount}/${favs.length} favorites
                  </span>
                  <span class="rec__card-score">${Math.round(game.finalScore)}% match</span>
                </div>
              </div>
            </a>
          `).join('')}
        </div>`;
    }

  } catch (err) {
    recList.innerHTML = `
      <div class="rec__error">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>Cannot connect to API.</p>
        <p class="rec__error-hint">Make sure server is running: uvicorn api:app --reload --port 8000</p>
      </div>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Get Recommendations';
  }
}


// ===== LOCAL STORAGE =====
function getFavorites() {
  return JSON.parse(localStorage.getItem('grs_favorites') || '[]');
}

function saveFavorites(favs) {
  localStorage.setItem('grs_favorites', JSON.stringify(favs));
}

function removeFromFavorites(name) {
  const favs = getFavorites().filter(f => f.name !== name);
  saveFavorites(favs);
  renderFavorites();
}

function clearAllFavorites() {
  if (!confirm('Clear all favorites?')) return;
  saveFavorites([]);
  renderFavorites();
  document.getElementById('recommendationsSection').style.display = 'none';
}



// ===== DEMO DATA (test) =====

function addDemoData() {
  if (getFavorites().length === 0) {
saveFavorites([
  { name: 'Left 4 Dead', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/500/header.jpg', genres: 'Action' },
  { name: 'Left 4 Dead 2', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/550/header.jpg', genres: 'Action' },
  { name: 'Portal', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/400/header.jpg', genres: 'Action,Adventure' },
  { name: 'Portal 2', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/620/header.jpg', genres: 'Action,Adventure' },
  { name: 'Half-Life 2', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/220/header.jpg', genres: 'Action' },
]);
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  addDemoData();
  renderFavorites();
});

