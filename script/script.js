// JavaScript to toggle visibility of the small search tab
const searchIcon = document.getElementById('searchIcon');
const smallSearchTab = document.getElementById('smallSearchTab');

searchIcon.addEventListener('click', function () {
    smallSearchTab.style.display = (smallSearchTab.style.display === 'none' ? 'block' : 'none');
});