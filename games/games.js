document.addEventListener('DOMContentLoaded', () => {
    const groupId = 223811537;
    const gamesApiUrl = `https://games.roproxy.com/v2/groups/${groupId}/games?sortOrder=Asc&limit=50`;
    const gamesGrid = document.getElementById('games-grid');

    async function fetchGames() {
        try {
            const gamesResponse = await fetch(gamesApiUrl);
            if (!gamesResponse.ok) throw new Error('Failed to fetch games list.');
            const gamesData = await gamesResponse.json();

            if (!gamesData.data || gamesData.data.length === 0) {
                gamesGrid.innerHTML = '<p>This group has no public games.</p>';
                return;
            }

            // Get all universe IDs to fetch thumbnails in one batch
            const universeIds = gamesData.data.map(game => game.id);
            const thumbnailsUrl = `https://thumbnails.roproxy.com/v1/games/icons?universeIds=${universeIds.join(',')}&size=256x256&format=Png&isCircular=false`;
            
            const thumbnailsResponse = await fetch(thumbnailsUrl);
            if (!thumbnailsResponse.ok) throw new Error('Failed to fetch game thumbnails.');
            const thumbnailsData = await thumbnailsResponse.json();

            // Create a map for easy lookup: universeId -> imageUrl
            const thumbnailMap = new Map(thumbnailsData.data.map(thumb => [thumb.targetId, thumb.imageUrl]));

            // Clear skeleton loader
            gamesGrid.innerHTML = '';

            gamesData.data.forEach(game => {
                const gameCard = document.createElement('div');
                gameCard.className = 'game-card fade-in';

                const thumbnailUrl = thumbnailMap.get(game.id) || 'https://via.placeholder.com/256';

                gameCard.innerHTML = `
                    <a href="https://www.roblox.com/games/${game.rootPlace.id}" target="_blank" rel="noopener noreferrer">
                        <img class="game-thumbnail" src="${thumbnailUrl}" alt="${game.name}" loading="lazy">
                        <div class="game-info">
                            <h3 class="game-name">${game.name}</h3>
                            <div class="game-stats">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                                <span>${game.placeVisits.toLocaleString()}</span>
                            </div>
                        </div>
                    </a>
                `;
                gamesGrid.appendChild(gameCard);
            });

        } catch (error) {
            console.error('Error fetching group games:', error);
            gamesGrid.innerHTML = '<div class="alert error">Could not load group games at this time.</div>';
        }
    }

    fetchGames();
});