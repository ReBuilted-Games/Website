const GROUP_ID = 223811537

const gamesGrid =
document.getElementById("gamesGrid")

async function fetchGames(){

    try{

        const groupResponse = await fetch(
            `https://games.roblox.com/v2/groups/${GROUP_ID}/games?accessFilter=Public&limit=50&sortOrder=Asc`
        )

        const groupData =
        await groupResponse.json()

        const universeIds =
        groupData.data.map(game => game.id)

        if(universeIds.length === 0){

            gamesGrid.innerHTML =
            "<h2>No Games Found</h2>"

            return
        }

        const gamesResponse = await fetch(
            `https://games.roblox.com/v1/games?universeIds=${universeIds.join(",")}`
        )

        const gamesData =
        await gamesResponse.json()

        const thumbResponse = await fetch(
            `https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeIds.join(",")}&returnPolicy=PlaceHolder&size=768x432&format=Png&isCircular=false`
        )

        const thumbData =
        await thumbResponse.json()

        const thumbnails = {}

        thumbData.data.forEach(t => {
            thumbnails[t.targetId] =
            t.imageUrl
        })

        gamesGrid.innerHTML = ""

        gamesData.data.forEach(game => {

            const totalVotes =
            game.upVotes + game.downVotes

            const rating =
            totalVotes > 0
            ? Math.round(
                (game.upVotes / totalVotes) * 100
            )
            : 0

            const card =
            document.createElement("div")

            card.className = "gameCard"

            card.innerHTML = `
                <img class="gameThumb"
                src="${thumbnails[game.id] || ""}">

                <div class="gameContent">

                    <div class="gameName">
                        ${game.name}
                    </div>

                    <div class="stats">

                        <div class="stat">
                            <div class="statLabel">
                                PLAYING
                            </div>

                            <div class="statValue">
                                ${game.playing.toLocaleString()}
                            </div>
                        </div>

                        <div class="stat">
                            <div class="statLabel">
                                VISITS
                            </div>

                            <div class="statValue">
                                ${game.visits.toLocaleString()}
                            </div>
                        </div>

                        <div class="stat">
                            <div class="statLabel">
                                RATING
                            </div>

                            <div class="statValue">
                                ${rating}%
                            </div>
                        </div>

                        <div class="stat">
                            <div class="statLabel">
                                FAVORITES
                            </div>

                            <div class="statValue">
                                ${game.favoritedCount.toLocaleString()}
                            </div>
                        </div>

                        <div class="stat">
                            <div class="statLabel">
                                CREATED
                            </div>

                            <div class="statValue">
                                ${new Date(game.created).toLocaleDateString()}
                            </div>
                        </div>

                        <div class="stat">
                            <div class="statLabel">
                                UPDATED
                            </div>

                            <div class="statValue">
                                ${new Date(game.updated).toLocaleDateString()}
                            </div>
                        </div>

                    </div>

                    <a class="playButton"
                    href="https://www.roblox.com/games/${game.rootPlaceId}"
                    target="_blank">

                        PLAY GAME

                    </a>

                </div>
            `

            gamesGrid.appendChild(card)

        })

    }catch(error){

        console.error(error)

        gamesGrid.innerHTML = `
            <div class="loading">
                FAILED TO LOAD GAMES
            </div>
        `
    }

}

fetchGames()
