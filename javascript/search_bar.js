
// Gọi hàm get_recommendations
document.getElementById('searchBtn').addEventListener('click', async () => {
const title = document.getElementById('searchInput').value.trim();
if (!title) return;

try {
    const res = await fetch(`http://localhost:8000/recommend?title=${encodeURIComponent(title)}`);
    const data = await res.json();

    const container = document.getElementById('results');
    container.innerHTML = data.recommendations.map(game => `    
    <div>
        <img src="${game.image}" width="200">
        <p>${game.name}</p>
    </div>
    `).join('');

} catch (err) {
    console.error('Lỗi:', err);
}
});




// Load trending khi trang mở
async function loadTrending() {
  const res = await fetch('http://localhost:8000/trending');
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

function selectGame(name) {
  document.getElementById('searchInput').value = name;
  document.getElementById('searchDropdown').style.display = 'none';
}

function goAdvanced() {
  // sau này chuyển sang trang advanced
  alert('Advanced search coming soon!');
}

document.getElementById('searchInput').addEventListener('focus', () => {
  document.getElementById('searchDropdown').style.display = 'block';
});

// Ẩn khi click ra ngoài — dùng mousedown thay vì click
document.addEventListener('mousedown', (e) => {
  const dropdown = document.getElementById('searchDropdown');
  const searchBox = document.querySelector('.home__search');
  
  if (!searchBox.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});

loadTrending();



