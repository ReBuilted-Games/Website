/* ===================================================== */
/* script.js */
/* ===================================================== */

const GROUP_ID = 223811537

const gamesGrid =
document.getElementById("gamesGrid")

const searchInput =
document.getElementById("searchInput")

const CACHE_KEY =
"rebuilted_games_cache"

const CACHE_TIME =
1000 * 60 * 5

/* ===================================================== */
/* LOW GPU MODE */
/* ===================================================== */

function enableLowGpuMode(){

    const reduceMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches

    if(reduceMotion){

        document.body.classList
        .add("lowGpu")
    }
}

enableLowGpuMode()

/* ===================================================== */
/* FORMAT */
/* ===================================================== */

function formatNumber(num){

    if(num >= 1000000){

        return (
            num / 1000000
        ).toFixed(1) + "M"
    }

    if(num >= 1000){

        return (
            num / 1000
        ).toFixed(1) + "K"
    }

    return num.toLocaleString()
}

function formatDate(date){

    return new Date(date)
    .toLocaleDateString()
}

/* ===================================================== */
/* SKELETONS */
/* ===================================================== */

function createSkeletons(){

    gamesGrid.innerHTML = ""

    for(let i = 0; i < 6; i++){

        const skeleton =
        document.createElement("div")

        skeleton.className =
        "gameCard skeletonCard"

        skeleton.innerHTML = `
            <div class="skeletonThumb"></div>

            <div class="gameContent">

                <div class="skeletonText"></div>

                <div class="stats">

                    <div class="skeletonStat"></div>
                    <div class="skeletonStat"></div>
                    <div class="skeletonStat"></div>
                    <div class="skeletonStat"></div>

                </div>

                <div class="skeletonButton"></div>

            </div>
        `

        gamesGrid.appendChild(skeleton)
    }
}

/* ===================================================== */
/* CACHE */
/* ===================================================== */

function saveCache(data){

    localStorage.setItem(

        CACHE_KEY,

        JSON.stringify({

            time:Date.now(),
            data

        })
    )
}

function loadCache(){

    const cache =
    localStorage.getItem(CACHE_KEY)

    if(!cache) return null

    const parsed =
    JSON.parse(cache)

    if(
        Date.now() - parsed.time
        > CACHE_TIME
    ){
        return null
    }

    return parsed.data
}

/* ===================================================== */
/* ERROR */
/* ===================================================== */

function showError(){

    gamesGrid.innerHTML = `
        <div class="errorCard fadeIn">

            <h2>
                FAILED TO LOAD GAMES
            </h2>

            <p>
                Roblox API unavailable.
            </p>

            <button onclick="fetchGames(true)">
                RETRY
            </button>

        </div>
    `
}

/* ===================================================== */
/* GAME CARD */
/* ===================================================== */

function createGameCard(game, thumbnail){

    const totalVotes =
    game.upVotes + game.downVotes

    const rating =
    totalVotes > 0
    ? Math.round(
        (game.upVotes / totalVotes)
        * 100
    )
    : 0

    const card =
    document.createElement("div")

    card.className =
    "gameCard fadeIn"

    card.innerHTML = `
        <img
        class="gameThumb"
        loading="lazy"
        src="${thumbnail || ""}"
        alt="${game.name}">

        <div class="gameContent">

            <div class="gameName">
                ${game.name}
            </div>

            <div class="gameDescription">
                ${
                    game.description
                    ? game.description.slice(0,120)
                    : "No description available."
                }
            </div>

            <div class="stats">

                <div class="stat">

                    <div class="statLabel">
                        PLAYING
                    </div>

                    <div class="statValue">
                        ${formatNumber(game.playing)}
                    </div>

                </div>

                <div class="stat">

                    <div class="statLabel">
                        VISITS
                    </div>

                    <div class="statValue">
                        ${formatNumber(game.visits)}
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
                        ${formatNumber(
                            game.favoritedCount
                        )}
                    </div>

                </div>

                <div class="stat">

                    <div class="statLabel">
                        CREATED
                    </div>

                    <div class="statValue">
                        ${formatDate(
                            game.created
                        )}
                    </div>

                </div>

                <div class="stat">

                    <div class="statLabel">
                        UPDATED
                    </div>

                    <div class="statValue">
                        ${formatDate(
                            game.updated
                        )}
                    </div>

                </div>

            </div>

            <a
            class="playButton"
            href="
            https://www.roblox.com/games/${game.rootPlaceId}
            "
            target="_blank">

                PLAY GAME

            </a>

        </div>
    `

    return card
}

/* ===================================================== */
/* RENDER */
/* ===================================================== */

function renderGames(payload){

    gamesGrid.innerHTML = ""

    payload.games.forEach(game => {

        const card =
        createGameCard(
            game,
            payload.thumbnails[game.id]
        )

        gamesGrid.appendChild(card)
    })
}

/* ===================================================== */
/* FETCH */
/* ===================================================== */

async function fetchGames(force = false){

    try{

        createSkeletons()

        if(!force){

            const cache =
            loadCache()

            if(cache){

                renderGames(cache)
                return
            }
        }

        const groupResponse =
        await fetch(
            `https://games.roblox.com/v2/groups/${GROUP_ID}/games?accessFilter=Public&limit=50&sortOrder=Asc`
        )

        const groupData =
        await groupResponse.json()

        const universeIds =
        groupData.data.map(
            game => game.id
        )

        const gamesResponse =
        await fetch(
            `https://games.roblox.com/v1/games?universeIds=${universeIds.join(",")}`
        )

        const gamesData =
        await gamesResponse.json()

        const thumbResponse =
        await fetch(
            `https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeIds.join(",")}&returnPolicy=PlaceHolder&size=768x432&format=Png&isCircular=false`
        )

        const thumbData =
        await thumbResponse.json()

        const thumbnails = {}

        thumbData.data.forEach(
            thumb => {

            thumbnails[
                thumb.targetId
            ] = thumb.imageUrl

        })

        const payload = {

            games:
            gamesData.data,

            thumbnails

        }

        saveCache(payload)

        renderGames(payload)

    }catch(error){

        console.error(error)

        showError()
    }
}

/* ===================================================== */
/* SEARCH */
/* ===================================================== */

searchInput.addEventListener(
    "input",

    () => {

    const search =
    searchInput.value
    .toLowerCase()

    const cards =
    document.querySelectorAll(
        ".gameCard"
    )

    cards.forEach(card => {

        const name =
        card.querySelector(
            ".gameName"
        )

        if(!name) return

        if(
            name.textContent
            .toLowerCase()
            .includes(search)
        ){

            card.style.display = ""

        }else{

            card.style.display = "none"
        }
    })
})

/* ===================================================== */
/* SCROLL */
/* ===================================================== */

document.querySelectorAll(
    "[data-scroll]"
)
.forEach(button => {

    button.addEventListener(
        "click",

        () => {

        const target =
        document.getElementById(
            button.dataset.scroll
        )

        if(target){

            target.scrollIntoView({
                behavior:"smooth"
            })
        }
    })
})

/* ===================================================== */
/* START */
/* ===================================================== */

fetchGames()
