/* ===================================================== */
/* script.js */
/* FULL ROPROXY VERSION */
/* ===================================================== */

const GROUP_ID = 223811537

const gamesGrid =
document.getElementById("gamesGrid")

const searchInput =
document.getElementById("searchInput")

/* ===================================================== */
/* CACHE */
/* ===================================================== */

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
/* FORMATTERS */
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
/* CACHE SAVE */
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

/* ===================================================== */
/* CACHE LOAD */
/* ===================================================== */

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
/* ERROR UI */
/* ===================================================== */

function showError(message = "FAILED TO LOAD GAMES"){

    gamesGrid.innerHTML = `
        <div class="errorCard fadeIn">

            <h2>
                ${message}
            </h2>

            <p>
                Roblox API may be unavailable.
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

    const description =
    game.description
    ? game.description.slice(0,120)
    : "No description available."

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
                ${description}
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
/* FETCH WITH TIMEOUT */
/* ===================================================== */

async function fetchWithTimeout(url, timeout = 10000){

    const controller =
    new AbortController()

    const timeoutId =
    setTimeout(() => {

        controller.abort()

    }, timeout)

    const response =
    await fetch(url, {

        signal:
        controller.signal

    })

    clearTimeout(timeoutId)

    return response
}

/* ===================================================== */
/* FETCH GAMES */
/* ===================================================== */

async function fetchGames(force = false){

    try{

        createSkeletons()

        /* ============================= */
        /* CACHE */
        /* ============================= */

        if(!force){

            const cache =
            loadCache()

            if(cache){

                renderGames(cache)
            }
        }

        /* ============================= */
        /* GROUP GAMES */
        /* ============================= */

        const groupResponse =
        await fetchWithTimeout(
        `https://games.roproxy.com/v2/groups/${GROUP_ID}/games?accessFilter=Public&limit=50&sortOrder=Asc`
        )

        const groupData =
        await groupResponse.json()

        if(
            !groupData.data ||
            groupData.data.length === 0
        ){
            showError("NO GAMES FOUND")
            return
        }

        const universeIds =
        groupData.data.map(
            game => game.id
        )

        /* ============================= */
        /* GAME INFO */
        /* ============================= */

        const gamesResponse =
        await fetchWithTimeout(
        `https://games.roproxy.com/v1/games?universeIds=${universeIds.join(",")}`
        )

        const gamesData =
        await gamesResponse.json()

        /* ============================= */
        /* THUMBNAILS */
        /* ============================= */

        const thumbResponse =
        await fetchWithTimeout(
        `https://thumbnails.roproxy.com/v1/games/icons?universeIds=${universeIds.join(",")}&returnPolicy=PlaceHolder&size=768x432&format=Png&isCircular=false`
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

        /* ============================= */
        /* PAYLOAD */
        /* ============================= */

        const payload = {

            games:
            gamesData.data,

            thumbnails
        }

        /* ============================= */
        /* CACHE SAVE */
        /* ============================= */

        saveCache(payload)

        /* ============================= */
        /* RENDER */
        /* ============================= */

        renderGames(payload)

    }catch(error){

        console.error(error)

        showError()
    }
}

/* ===================================================== */
/* SEARCH */
/* ===================================================== */

if(searchInput){

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

            const visible =
            name.textContent
            .toLowerCase()
            .includes(search)

            card.style.display =
            visible
            ? ""
            : "none"
        })
    })
}

/* ===================================================== */
/* SMOOTH SCROLL */
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

                behavior:
                "smooth"

            })
        }
    })
})

/* ===================================================== */
/* AUTO REFRESH */
/* ===================================================== */

setInterval(() => {

    fetchGames(true)

}, 1000 * 60 * 2)

/* ===================================================== */
/* START */
/* ===================================================== */

fetchGames()
