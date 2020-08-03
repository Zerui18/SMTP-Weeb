const e = {
    btn_start: document.getElementById('btn_start'),
    div_ratings: document.getElementById('div_ratings'),
    div_search: document.getElementById('search_bar_container'),
    search_bar: document.getElementById('search_bar'),
    divs_rating: [...document.getElementsByClassName('div_rating')],
    divs_search: [...document.getElementsByClassName('div_search_item')],
    btn_submit: document.getElementById('btn_submit'),
}

const startClicked = e.div_search.scrollIntoView.bind(e.div_search, { behavior: 'smooth' })
const showHideCells = (shown, hidden) => {
    shown.forEach(e => e.style.display = 'table-cell')
    hidden.forEach(e => e.style.display = 'none')
}
const showRatingCells = (n) => showHideCells(e.divs_rating.slice(0, n), e.divs_rating.slice(n))
const showSearchCells = (n) => showHideCells(e.divs_search.slice(0, n), e.divs_search.slice(n))
const getSearchBarText = () => e.search_bar.value.trim()

const malIds = []
const idToImageURL = {}
const idToRating = {}

const scoreInit = "5"
const recommenderApi = ""

// Debounce
let lastSearch = new Date().getTime()
const updateLastSearch = () => {
    const timeNow = new Date().getTime()
    const intervalPassed = timeNow - lastSearch > 1e3
    if (intervalPassed)
        lastSearch = timeNow
    return intervalPassed
}

async function performSearch(text) {
    const encoded = encodeURIComponent(text)
    const requestURL = `https://api.jikan.moe/v3/search/manga?q=${encoded}&limit=12&sort=score`
    // Fetch.
    const response = await fetch(requestURL)
    let results = await response.json()
    if (results) {
        results = results.results
        for (let id in results) {
            // Populate search cell.
            const result = results[id]
            const cell = e.divs_search[id]
            cell.children[0].src = result.image_url
            cell.children[2].innerText = result.title
            // Save the mal_id.
            cell.malId = result.mal_id.toString()
        }
        showSearchCells(results.length)
    }
}

function addToRatings(malId, image_url) {
    // No duplicates.
    if (malIds.length >= 10 || malIds.includes(malId)) {
        return
    }
    const cell = e.divs_rating[malIds.length]
    cell.children[0].src = image_url
    cell.style.display = 'table-cell'
    cell.malId = malId
    // Reset score.
    const rating = cell.children[1]
    const [score, slider] = rating.children
    slider.value = score.innerText = scoreInit
    // Track.
    malIds.push(malId)
    idToImageURL[malId] = image_url
}

function removeFromRatings(malId) {
    const idx = malIds.indexOf(malId)
    if (idx < 0) return
    delete idToRating[malId]
    delete idToImageURL[malId]
    malIds.splice(idx, 1)
    // Repopulate cells.
    for (let i in malIds) {
        const cell = e.divs_rating[i]
        const malId = malIds[i]
        cell.children[0].src = idToImageURL[malId]
        cell.style.display = 'table-cell'
        cell.malId = malId
        // Reset score.
        const rating = cell.children[1]
        const [score, slider] = rating.children
        slider.value = score.innerText = scoreInit
    }
    showRatingCells(malIds.length)
    console.log(malId, malIds)
}

function setup() {
    // Search.
    e.search_bar.addEventListener("keyup", (event) => {
        // Only perform action if search bar has meaningful term.
        if (getSearchBarText().length >= 3) {
            if (updateLastSearch()) {
                performSearch(getSearchBarText())
            }
        }
        else {
            showSearchCells(0)
        }
        // Hard trigger on return.
        if (event.keyCode === 13) {
          lastSearch = new Date().getTime()
          performSearch(getSearchBarText())
        }
    })
    // Click to add cell to ratings.
    e.divs_search.forEach(e => e.onclick = () => {
        addToRatings(e.malId, e.children[0].src)
    })
    // Click close to remove cell from ratings.
    e.divs_rating.forEach(e => e.children[2].onclick = () => removeFromRatings(e.malId))
    // Update score with sliders.
    e.divs_rating.forEach(div => {
        const rating = div.children[1]
        const [score, slider] = rating.children
        slider.value = score.innerText = scoreInit
        slider.oninput = () => {
            score.innerText = idToRating[div.malId] = slider.value
        }
    })
    // Submit button.
    e.btn_submit.onclick = () => {
        // Check.
        if (malIds.length < 3) {
            alert(`You need to rate ${10 - malIds.length} series.`)
            return
        }
        // Send request to server.
        let ratingsData = {}
        for(const id of malIds) {
            ratingsData[id] = parseInt(idToRating[id] || scoreInit)
        }
        ratingsData = encodeURIComponent(btoa(JSON.stringify(ratingsData))) // b64 json, query escaped
        const requestURL = `${recommenderApi}/recommend?ratings=${ratingsData}`
        console.log(requestURL)
    }
}