const e = {
    btn_start: document.getElementById('btn_start'),
    div_ratings: document.getElementById('div_ratings'),
    div_search: document.getElementById('div_search'),
    divs_rating: [...document.getElementsByClassName('div_rating')],
    divs_search: [...document.getElementsByClassName('div_search')],
}

const startClicked = e.div_search.scrollIntoView.bind(e.div_search, { behavior: 'smooth' })
const showRatingCells = (n) => e.divs_rating.slice(0, n).forEach(e => e.style.display = 'table-cell')
const showSearchCells = (n) => e.divs_search.slice(0, n).forEach(e => e.style.display = 'table-cell')

function setup() {
    showRatingCells(e.div_ratings.length)
    showSearchCells(e.div_search.length)

    e.divs_rating.forEach(e => e.children[0].src = 'https://cdn.myanimelist.net/images/anime/1429/95946.jpg?s=54a1d4bcd881957ce164297f36df5a72')
}