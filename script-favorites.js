document.addEventListener('DOMContentLoaded', () => {
    const favoritesList = document.getElementById('favorites-list');
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p>Nenhum favorito salvo.</p>';
    } else {
        favoritesList.innerHTML = favorites.map(fav => `
            <li>
                <h3>${fav.name}, ${fav.sys.country}</h3>
                <p>Temperatura: ${fav.main.temp}°C</p>
                <p>Condição: ${fav.weather[0].description}</p>
                <img src="http://openweathermap.org/img/wn/${fav.weather[0].icon}.png" alt="Ícone do tempo">
            </li>
        `).join('');
    }
});
