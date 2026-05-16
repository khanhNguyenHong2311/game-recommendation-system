function renderCard(game) {
  const genreBadges = (game.genres || '').split(',').map(g => 
    `<span class="genre-badge">${g.trim()}</span>`
  ).join('');

  return `
    <article class="projects__card swiper-slide">
      <div class="blob"></div>
      <div class="projects__image">
        <img src="${game.image}" alt="${game.name}" class="projects__img">
        <a href="discovery.html?q=${encodeURIComponent(game.name)}" class="projects__button">
          <i class="ri-arrow-right-up-line"></i>
        </a>
      </div>
      <div class="projects__data">
        <h2 class="projects__title">${game.name}</h2>
        <div class="projects__genres">${genreBadges}</div>
        <p class="projects__reviews">
          <i class="fa-solid fa-thumbs-up"></i>
          ${game.positive.toLocaleString()} reviews
        </p>
      </div>
    </article>
  `;
}

async function loadCarousel(category, containerId) {
  try {
    const res = await fetch(`${API}/featured?category=${category}&limit=10`);
    const data = await res.json();
    document.getElementById(containerId).innerHTML = data.games.map(renderCard).join('');
  } catch (err) {
    console.error('Carousel load error:', err);
  }
}

// Load cả 3 carousel rồi init swiper
async function initCarousels() {
  await Promise.all([
    loadCarousel('popular', 'carousel-popular'),
    loadCarousel('free', 'carousel-free'),
    loadCarousel('multiplayer', 'carousel-multiplayer'),
  ]);

  const swiperPopular = new Swiper('.swiper-popular', {
    loop: true,
    spaceBetween: 24,
    slidesPerView: 'auto',
    grabCursor: true,
    speed: 600,
    pagination: { el: '.swiper-popular .swiper-pagination', clickable: true },
    autoplay: { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }
  });

  const swiperFree = new Swiper('.swiper-free', {
    loop: true,
    spaceBetween: 24,
    slidesPerView: 'auto',
    grabCursor: true,
    speed: 600,
    pagination: { el: '.swiper-free .swiper-pagination', clickable: true },
    autoplay: { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }
  });

  const swiperMultiplayer = new Swiper('.swiper-multiplayer', {
    loop: true,
    spaceBetween: 24,
    slidesPerView: 'auto',
    grabCursor: true,
    speed: 600,
    pagination: { el: '.swiper-multiplayer .swiper-pagination', clickable: true },
    autoplay: { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }
  });
}

initCarousels();