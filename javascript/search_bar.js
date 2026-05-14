
// Gọi hàm get_recommendations của api.py
document.getElementById('searchBtn').addEventListener('click', async () => {
  const title = document.getElementById('searchInput').value.trim();
  if (!title) return;
  window.location.href = `discovery.html?q=${encodeURIComponent(title)}`;
});



// Gọi hàm trending của api.py
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


// Khi click vào ô tìm kiếm thì dropdown hiện ra
document.getElementById('searchInput').addEventListener('focus', () => {
  document.getElementById('searchDropdown').style.display = 'block';
});

// Khi click ra ngoài ẩn dropdown
document.addEventListener('mousedown', (e) => {
  const dropdown = document.getElementById('searchDropdown');
  const searchBox = document.querySelector('.home__search');
  
  if (!searchBox.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});

loadTrending();



// Khi click vào game thì tự động điền vào SearchBar sau đó dropdown biến mất
function selectGame(name) {
  window.location.href = `discovery.html?q=${encodeURIComponent(name)}`;
}

// Chuyển sang discovery.html
function goAdvanced() {
  // sau này chuyển sang trang advanced
  window.location.href = 'discovery.html';
}