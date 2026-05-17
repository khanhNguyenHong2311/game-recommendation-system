const API = 'http://localhost:8000';

// lấy tên game từ URL
const params = new URLSearchParams(window.location.search);
const gameName = params.get("game");

async function loadGameInfo() {

    if (!gameName) {
        document.getElementById("gameTitle").textContent =
            "Game not found";
        return;
    }

    try {

        // SEARCH GAME
        const res = await fetch(
            `${API}/search?q=${encodeURIComponent(gameName)}&limit=1`
        );

        const data = await res.json();

        if (!data.results || data.results.length === 0) {

            document.getElementById("gameTitle").textContent =
                "Game not found";

            return;
        }

        const game = data.results[0];
        console.log(game);

        // ================= TITLE =================
        document.getElementById("gameTitle").textContent =
            game.name;

        // ================= IMAGE =================
        document.getElementById("gameImage").src =
            game.image;

        // ================= DESCRIPTION =================
        document.getElementById("gameDescription").innerHTML =
            game.description || "No description available.";

        // ================= META INFO =================

        document.getElementById("metaTitle").textContent =
            game.name;

        document.getElementById("metaGenres").textContent =
            game.genres || "Unknown";

        document.getElementById("metaDeveloper").textContent =
            game.developer || "Unknown";

        document.getElementById("metaPublisher").textContent =
            game.publisher || "Unknown";

        document.getElementById("metaLanguages").textContent =
            game.languages || "Unknown";

        document.getElementById("metaRelease").textContent =
            game.release_date || "Unknown";

        // ================= PLATFORM =================

        let platforms = [];

        if (game.windows) {
            platforms.push("Windows");
        }

        if (game.mac) {
            platforms.push("macOS");
        }

        if (game.linux) {
            platforms.push("Linux");
        }

        document.getElementById("metaPlatforms").textContent =
            platforms.join(", ") || "Unknown";

        // ================= POSITIVE =================

        document.getElementById("metaPositive").textContent =
            game.positive?.toLocaleString() || "0";

        // ================= PRICE =================

        const priceText =
            game.price === 0
                ? "Free to Play"
                : "$" + game.price.toFixed(2);

        document.getElementById("metaPrice").textContent =
            priceText;

        document.getElementById("gamePrice").textContent =
            priceText;

        // ================= TAGS =================

        const tagContainer =
            document.getElementById("gameTags");

        if (game.tags) {

            const tags = game.tags.split(",");

            tagContainer.innerHTML = tags.map(tag => `
                <span class="game__tag">
                    ${tag.trim()}
                </span>
            `).join('');

        } else {

            tagContainer.innerHTML =
                `<span class="game__tag">No tags</span>`;
        }

        // ================= RELATED GAMES =================
        loadRelatedGames(game.name);

    } catch (err) {

        console.error(err);

        document.getElementById("gameTitle").textContent =
            "Cannot connect to API";
    }
}


// ================= FAVORITE =================

function toggleFavorite() {

    let favorites =
        JSON.parse(localStorage.getItem("favorites")) || [];

    const exists = favorites.includes(gameName);

    if (exists) {

        favorites =
            favorites.filter(g => g !== gameName);

        document.getElementById("favText").textContent =
            "Add to Favorite";

    } else {

        favorites.push(gameName);

        document.getElementById("favText").textContent =
            "Added to Favorite";
    }

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );
}


// ================= CHECK FAVORITE =================

function checkFavorite() {

    const favorites =
        JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.includes(gameName)) {

        document.getElementById("favText").textContent =
            "Added to Favorite";
    }
}


// ================= RELATED GAMES =================

function openRelatedGame(gameName) {

    window.location.href =
        `info.html?game=${encodeURIComponent(gameName)}`;
}


async function loadRelatedGames(title) {

    try {

        const res = await fetch(
            `${API}/recommend?title=${encodeURIComponent(title)}`
        );

        const data = await res.json();

        const container =
            document.getElementById("relatedGames");

        if (
            !data.recommendations ||
            data.recommendations.length === 0
        ) {

            container.innerHTML =
                `<p>No related games found.</p>`;

            return;
        }

        container.innerHTML =
            data.recommendations.map(game => `

            <div class="item-card"
                 onclick="openRelatedGame('${game.name}')">

                <img
                    src="${game.image}"
                    alt="${game.name}"
                />

                <div class="item-card__info">

                    <h3>${game.name}</h3>

                    <p class="game__subtitle">
                        Similarity Score:
                        ${(game.score * 100).toFixed(1)}%
                    </p>

                </div>

            </div>

        `).join('');

    } catch (err) {

        console.error(err);
    }
}


// ================= INIT =================

document.addEventListener("DOMContentLoaded", () => {

    loadGameInfo();

    checkFavorite();
});