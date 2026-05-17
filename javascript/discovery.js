let currentPageDiscovery = 1;
const perPage = 25;
let allResults = [];
let selectedTags = [];
let selectedGenres = [];


const TAGS = ['1980s','1990\'s','2.5D','2D','2D Fighter','2D Platformer','360 Video','3D','3D Fighter','3D Platformer','3D Vision','4 Player Local','4X','6DOF','8-bit Music','ATV','Abstract','Action','Action RPG','Action RTS','Action Roguelike','Action-Adventure','Addictive','Adventure','Agriculture','Aliens','Alternate History','Ambient','America','Animation & Modeling','Anime','Arcade','Archery','Arena Shooter','Artificial Intelligence','Assassin','Asymmetric VR','Asynchronous Multiplayer','Atmospheric',
    'Audio Production','Auto Battler','Automation','Automobile Sim','BMX','Base-Building','Baseball','Based On A Novel','Basketball','Batman','Battle Royale','Beat \'em up','Beautiful','Benchmark','Bikes','Birds','Blood','Board Game','Boomer Shooter','Boss Rush','Bowling','Boxing','Building','Bullet Hell','Bullet Time','CRPG','Capitalism','Card Battler','Card Game','Cartoon','Cartoony','Casual','Cats','Character Action Game','Character Customization','Chess','Choices Matter','Choose Your Own Adventure','Cinematic',
    'City Builder','Class-Based','Classic','Clicker','Co-op','Co-op Campaign','Coding','Cold War','Collectathon','Colony Sim','Colorful','Combat','Combat Racing','Comedy','Comic Book','Competitive','Conspiracy','Controller','Conversation','Cooking','Cozy','Crafting','Creature Collector','Cricket','Crime','Crowdfunded','Cult Classic','Cute','Cyberpunk','Cycling','Dark','Dark Comedy','Dark Fantasy','Dark Humor','Dating Sim','Deckbuilding','Demons','Design & Illustration','Destruction','Detective','Dice','Difficult',
    'Dinosaurs','Diplomacy','Documentary','Dog','Dragons','Drama','Driving','Dungeon Crawler','Dungeons & Dragons','Dwarf','Dynamic Narration','Dystopian','Early Access','Economy','Education','Electronic','Electronic Music','Elf','Emotional','Epic','Episodic','Escape Room','Experience','Experimental','Exploration','Extraction Shooter','FMV','FPS','Faith','Family Friendly','Fantasy','Farming','Farming Sim','Fast-Paced','Feature Film','Female Protagonist','Fighting','First-Person','Fishing','Flight','Football',
    'Football (American)','Football (Soccer)','Foreign','Fox','Free to Play','Funny','Futuristic','Gambling','Game Development','GameMaker','Games Workshop','Gaming','God Game','Golf','Gore','Gothic','Grand Strategy','Great Soundtrack','Grid-Based Movement','Gun Customization','Hack and Slash','Hacking','Hand-drawn','Hardware','Heist','Hentai','Hero Shooter','Hex Grid','Hidden Object','Historical','Hobby Sim','Hockey','Horror','Horses','Hunting','Idler','Illuminati','Immersive','Immersive Sim','Indie','Instrumental Music',
    'Intentionally Awkward Controls','Interactive Fiction','Inventory Management','Investigation','Isometric','JRPG','Jet','Job Simulator','Jump Scare','Kickstarter','LEGO','LGBTQ+','Lara Croft','Lemmings','Level Editor','Life Sim','Linear','Local Co-Op','Local Multiplayer','Logic','Loot','Looter Shooter','Lore-Rich','Lovecraftian','MMORPG','MOBA','Magic','Mahjong','Management','Mars','Martial Arts','Massively Multiplayer','Masterpiece','Match 3','Mature','Mechs','Medical Sim','Medieval','Memes','Metroidvania','Military',
    'Mini Golf','Minigames','Minimalist','Mining','Mod','Moddable','Modern','Motocross','Motorbike','Mouse only','Movie','Multiplayer','Multiple Endings','Music','Music-Based Procedural Generation','Musou','Mystery','Mystery Dungeon','Mythology','NSFW','Narration','Narrative','Nature','Naval','Naval Combat','Ninja','Noir','Nonlinear','Nostalgia','Nudity','Offroad','Old School','On-Rails Shooter','Online Co-Op','Open World','Open World Survival Craft','Otome','Outbreak Sim','Parkour','Parody','Party','Party Game',
    'Party-Based RPG','Perma Death','Philosophical','Photo Editing','Physics','Pinball','Pirates','Pixel Graphics','Platformer','Point & Click','Political','Political Sim','Politics','Pool','Post-apocalyptic','Precision Platformer','Procedural Generation','Programming','Psychedelic','Psychological','Psychological Horror','Puzzle','Puzzle-Platformer','PvE','PvP','Quick-Time Events','RPG','RPGMaker','RTS','Racing','Real Time Tactics','Real-Time','Real-Time with Pause','Realistic','Reboot','Relaxing','Remake','Replay Value',
    'Resource Management','Retro','Rhythm','Robots','Rock Music','Rogue-like','Rogue-lite','Roguelike Deckbuilder','Roguevania','Romance','Rome','Rugby','Runner','Sailing','Sandbox','Satire','Sci-fi','Science','Score Attack','Sequel','Sexual Content','Shoot \'Em Up','Shooter','Shop Keeper','Short','Side Scroller','Silent Protagonist','Simulation','Singleplayer','Skateboarding','Skating','Skiing','Sniper','Snooker','Snow','Snowboarding','Social Deduction','Software','Software Training','Sokoban','Solitaire','Souls-like',
    'Soundtrack','Space','Space Sim','Spaceships','Spectacle fighter','Spelling','Split Screen','Sports','Stealth','Steam Machine','Steampunk','Story Rich','Strategy','Strategy RPG','Stylized','Submarine','Superhero','Supernatural','Surreal','Survival','Survival Horror','Swordplay','Tabletop','Tactical','Tactical RPG','Tanks','Team-Based','Tennis','Text-Based','Third Person','Third-Person Shooter','Thriller','Tile-Matching','Time Attack','Time Management','Time Manipulation','Time Travel','Top-Down','Top-Down Shooter',
    'Touch-Friendly','Tower Defense','TrackIR','Trading','Trading Card Game','Traditional Roguelike','Trains','Transhumanism','Transportation','Trivia','Turn-Based','Turn-Based Combat','Turn-Based Strategy','Turn-Based Tactics','Tutorial','Twin Stick Shooter','Typing','Underground','Underwater','Unforgiving','Utilities','VR','VR Only','Vampire','Vehicular Combat','Video Production','Vikings','Villain Protagonist','Violent','Visual Novel','Voice Control','Volleyball','Voxel','Walking Simulator','War','Wargame','Warhammer 40K',
    'Web Publishing','Well-Written','Werewolves','Western','Wholesome','Word Game','World War I','World War II','Wrestling','Zombies','e-sports'
];


const GENRES = [
    "360 Video", "Accounting", "Action", "Adventure", "Animation & Modeling", "Audio Production", "Casual", "Design & Illustration",
    "Documentary", "Early Access", "Education", "Episodic", "Free To Play", "Game Development", "Gore", "Indie",
    "Massively Multiplayer", "Movie", "Nudity", "Photo Editing", "RPG", "Racing", "Sexual Content", "Short", "Simulation",
    "Software Training", "Sports", "Strategy", "Tutorial","Utilities","Video Production","Violent", "Web Publishing"
]


function showSkeleton() {
  document.getElementById('resultsList').innerHTML = Array(6).fill(`
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-line w80"></div>
        <div class="skeleton skeleton-line w60"></div>
        <div class="skeleton skeleton-line w40"></div>
      </div>
    </div>
  `).join('');
}

async function doSearch() {
  currentPageDiscovery = 1;
  const q = document.getElementById('searchInputDiscovery').value.trim();
  const filters = getFilters();


  const badge = document.getElementById('queryBadge');
  if (q) {
    badge.innerHTML = `
      <div class="query-tag">
        "${q}"
        <button onclick="clearQuery()"><i class="fa-solid fa-xmark"></i></button>
      </div>`;
  } else {
    badge.innerHTML = '';
  }

  showSkeleton();

  try {
    let url = `${API}/search?limit=5000`;
    if (q) url += `&q=${encodeURIComponent(q)}`;
    if (filters.os) url += `&os=${filters.os}`;
    if (filters.price === 'free') url += `&free=true`;

    const res = await fetch(url);
    const data = await res.json();
    let results = data.results || [];


    if (filters.genres.length > 0) {
      results = results.filter(game =>
        filters.genres.some(genre => game.genres?.toLowerCase().includes(genre.toLowerCase()))
      );
    }

    if (filters.tags.length > 0) {
      results = results.filter(game =>
        filters.tags.some(tag => game.tags?.toLowerCase().includes(tag.toLowerCase()))
      );
    }

    if (filters.price === 'paid') {
      results = results.filter(game => game.price > 0);
    }

    allResults = results;
    renderResults(allResults, allResults.length);

  } catch (err) {
    document.getElementById('resultsList').innerHTML = `
      <div class="state-box">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>Cannot connect to API.</p>
      </div>
      `;
  }
}

// Render results
function renderResults(results, total) {
  document.getElementById('resultCount').textContent = `${total} results found`;

  if (results.length === 0) {
    document.getElementById('resultsList').innerHTML = `
      <div class="state-box">
        <i class="fa-regular fa-face-frown-open"></i>
        <p>No games found. Try different filters.</p>
      </div>`;
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  // Sort
  const sort = document.getElementById('sortSelect').value;
  let sorted = [...results];
  if (sort === 'positive') sorted.sort((a,b) => b.positive - a.positive);
  else if (sort === 'price_asc') sorted.sort((a,b) => a.price - b.price);
  else if (sort === 'price_desc') sorted.sort((a,b) => b.price - a.price);
  else if (sort === 'avg_time_asc') sorted.sort((a,b) => a.avg_playtime - b.avg_playtime);
  else if (sort === 'avg_time_desc') sorted.sort((a,b) => b.avg_playtime - a.avg_playtime);
  else if (sort === 'name_asc') sorted.sort((a,b) => a.name.localeCompare(b.name));
  else if (sort === 'name_desc') sorted.sort((a,b) => b.name.localeCompare(a.name));

  // Paginate
  const start = (currentPageDiscovery - 1) * perPage;
  const paginated = sorted.slice(start, start + perPage);

 document.getElementById('resultsList').innerHTML = paginated.map(game => {
    // Tạo badge genres từ chuỗi genres
    const genreBadges = (game.genres || '').split(',').map(g => 
      `<span class="genre-badge">${g.trim()}</span>`
    ).join('');

    return `
      <div class="game-card">
        <img class="game-card__img" src="${game.image}" alt="${game.name}"
              onerror="this.src='https://placehold.co/184x69/1b2838/8f98a0?text=No+Image'">
        <div class="game-card__info">
          <div class="game-card__name">${game.name}</div>
          <div class="game-card__genres">${genreBadges}</div>
          <div class="game-card__meta">
            <span class="game-card__positive">
              <i class="fa-solid fa-thumbs-up" style="font-size:10px;"></i>
              ${game.positive?.toLocaleString() || 0} reviews
            </span>
            <span class="game-card__price ${game.price === 0 ? 'free' : ''}">
              ${game.price === 0 ? 'Free' : '$' + game.price?.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Pagination
   const totalPages = Math.ceil(sorted.length / perPage);
  if (totalPages > 1) {
    let pages = '';
    const delta = 5;
    const left = currentPageDiscovery - delta;
    const right = currentPageDiscovery + delta;
    let lastPage = 0;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        if (lastPage && i - lastPage > 1) {
          pages += `<button disabled>...</button>`;
        }
        pages += `<button class="${i === currentPageDiscovery ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
        lastPage = i;
      }
    }
    document.getElementById('pagination').innerHTML = pages;
  } else {
    document.getElementById('pagination').innerHTML = '';
  }
}


function initSearch() {
  const searchInput = document.getElementById('searchInputDiscovery');
  const searchButton = document.getElementById('searchBtnDiscovery');

  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        doSearch();
      }
    });
  }

  if (searchButton) {
    searchButton.addEventListener('click', () => {
      doSearch();
    });
  }

}



function showTagSuggestions() {
  const q = document.getElementById('tagSearch').value.toLowerCase().trim();
  const suggestBox = document.getElementById('tagSuggestions');

  if (!q) { suggestBox.innerHTML = ''; return; }

  const matches = TAGS
    .filter(t => t.toLowerCase().startsWith(q) && !selectedTags.includes(t))
    .slice(0, 100);

  if (matches.length === 0) { suggestBox.innerHTML = ''; return; }

  suggestBox.innerHTML = matches.map(tag => `
    <div class="tag-suggestion" onclick="addTag('${tag}')">${tag}</div>
  `).join('');
}

function renderTagBadges() {
  document.getElementById('tagBadges').innerHTML = selectedTags.map(tag => `
    <span class="tag-badge">
      ${tag} <button onclick="removeTag('${tag}')"><i class="fa-solid fa-xmark"></i></button>
    </span>
  `).join('');
}

function addTag(tag) {
  if (selectedTags.includes(tag)) return;
  selectedTags.push(tag);
  document.getElementById('tagSearch').value = '';
  document.getElementById('tagSuggestions').innerHTML = '';
  renderTagBadges();
  doSearch();
}


function removeTag(tag) {
  selectedTags = selectedTags.filter(t => t !== tag);
  renderTagBadges();
  doSearch();
}



function showGenreSuggestions() {
  const q = document.getElementById('genreSearch').value.toLowerCase().trim();
  const suggestBox = document.getElementById('genreSuggestions');

  if (!q) { suggestBox.innerHTML = ''; return; }

  const matches = GENRES
    .filter(g => g.toLowerCase().startsWith(q) && !selectedGenres.includes(g))
    .slice(0, 100);

  if (matches.length === 0) { suggestBox.innerHTML = ''; return; }

  suggestBox.innerHTML = matches.map(genre => `
    <div class="tag-suggestion" onclick="addGenre('${genre}')">${genre}</div>
  `).join('');
}

function renderGenreBadges() {
  document.getElementById('genreBadges').innerHTML = selectedGenres.map(genre => `
    <span class="tag-badge">
      ${genre} <button onclick="removeGenre('${genre}')"><i class="fa-solid fa-xmark"></i></button>
    </span>
  `).join('');
}

function addGenre(genre) {
  if (selectedGenres.includes(genre)) return;
  selectedGenres.push(genre);
  document.getElementById('genreSearch').value = '';
  document.getElementById('genreSuggestions').innerHTML = '';
  renderGenreBadges();
  doSearch();
}


function removeGenre(genre) {
  selectedGenres = selectedGenres.filter(g => g !== genre);
  renderGenreBadges();
  doSearch();
}

function clearFilters() {
  const osRadios = document.querySelectorAll('input[name="os"]');
  if (osRadios.length > 0) osRadios[0].checked = true;

  const priceRadios = document.querySelectorAll('input[name="price"]');
  if (priceRadios.length > 0) priceRadios[0].checked = true;

  selectedTags = [];
  selectedGenres = [];

  document.getElementById('genreSearch').value = '';
  document.getElementById('tagSearch').value = '';


  document.getElementById('genreSuggestions').innerHTML = '';
  document.getElementById('tagSuggestions').innerHTML = '';


  renderGenreBadges();
  renderTagBadges();


  doSearch();
}


function getFilters() {
  const os = document.querySelector('input[name="os"]:checked')?.value || '';
  const price = document.querySelector('input[name="price"]:checked')?.value || '';
  return { os: os, price: price, genres: selectedGenres, tags: selectedTags };
}

function clearQuery() {
  document.getElementById('searchInputDiscovery').value = '';
  doSearch();
}

function toggleFilter(id) {
    document.getElementById(id).classList.toggle('collapsed');
}

function onSortChange() {
  if (allResults.length > 0) {
    renderResults(allResults, allResults.length);
  } else {
    doSearch();
  }
}

function goPage(page) {
  currentPageDiscovery = page;
  renderResults(allResults, allResults.length);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


// document.addEventListener('DOMContentLoaded', () => {
//   initSearch();
//   doSearch(); 
// });

document.addEventListener('DOMContentLoaded', () => {

  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q) {
    document.getElementById('searchInputDiscovery').value = q;
  }

  initSearch();
  doSearch();
});