const API = 'http://localhost:8000';

// Gọi hàm get_recommendations của api.py

// document.getElementById('searchBtn').addEventListener('click', async () => {
//   const title = document.getElementById('searchInput').value.trim();
//   if (!title) return;
//   window.location.href = `discovery.html?q=${encodeURIComponent(title)}`;
// });

function showDropdownSkeleton() {
  const list = document.getElementById('searchDropdown');
  list.innerHTML = `
    <div class="dropdown__title">Trending searches</div>
    ${Array(5).fill(`
      <div class="dropdown__item">
        <div class="skeleton skeleton-img-dropdown"></div>
        <div class="skeleton skeleton-text"></div>
      </div>
    `).join('')}
  `;
}

// Gọi hàm trending của api.py
async function loadTrending() {
  
  showDropdownSkeleton();

  const res = await fetch(`${API}/trending`);
  const data = await res.json();
  
  const list = document.getElementById('searchDropdown');
  list.innerHTML = `
    <div class="dropdown__title">Trending searches</div>
    ${data.games.map(game => `
      <div class="dropdown__item" onclick="selectGame('${game.name.replace(/'/g, "\\'")}')">
        <img src="${game.image}" class="dropdown__item-img">
        <span>${game.name}</span>
      </div>
    `).join('')}
    <div class="dropdown__advanced" onclick="goAdvanced()">
      Advanced Search
    </div>
  `;
}
async function loadSuggestions(q) {
  if (!q) {
    loadTrending();
    return;
  }

  showDropdownSkeleton();

  try {
    const res = await fetch(`${API}/search/suggest?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    const suggestions = data.suggestions || [];

    const list = document.getElementById('searchDropdown');

    if (suggestions.length === 0) {
      list.innerHTML = `<div class="dropdown__title">No results found</div>`;
      return;
    }

    list.innerHTML = `
      <div class="dropdown__title">Suggestions</div>
      ${suggestions.map(game => `
        <div class="dropdown__item" onclick="selectGame('${game.name.replace(/'/g, "\\'")}')">
          <img src="${game.image}" class="dropdown__item-img">
          <span>${game.name}</span>
        </div>
    `).join('')}
      <div class="dropdown__advanced" onclick="goAdvanced()">
        Advanced Search
      </div>
    `;
  } catch (err) {
    console.error(err);
  }
}



document.getElementById('searchInput').addEventListener('focus', () => {
  document.getElementById('searchDropdown').style.display = 'block';
  const q = document.getElementById('searchInput').value.trim();
  if (!q) loadTrending();
});


let debounceTimer;
document.getElementById('searchInput').addEventListener('input', () => {
  const q = document.getElementById('searchInput').value.trim();
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    loadSuggestions(q);
  }, 300);
});

document.getElementById('searchInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const q = document.getElementById('searchInput').value.trim();
    if (q) window.location.href = `discovery.html?q=${encodeURIComponent(q)}`;
  }
});


document.getElementById('searchBtn').addEventListener('click', () => {
  const q = document.getElementById('searchInput').value.trim();
  if (q) window.location.href = `discovery.html?q=${encodeURIComponent(q)}`;
});

// Khi click ra ngoài ẩn dropdown
document.addEventListener('mousedown', (e) => {
  const dropdown = document.getElementById('searchDropdown');
  const searchBox = document.querySelector('.home__search');
  
  if (!searchBox.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});




function selectGame(name) {
  window.location.href = `discovery.html?q=${encodeURIComponent(name)}`;
}


function goAdvanced() {
  window.location.href = 'discovery.html';
}

loadTrending();