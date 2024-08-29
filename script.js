const apiKey = 'cf937c808db51da10b24037b892f5b94'; // Substitua pela sua chave API do OpenWeatherMap

document.addEventListener('DOMContentLoaded', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            await getWeatherByCoordinates(lat, lon);
        }, () => {
            alert('Não foi possível obter a localização.');
        });
    } else {
        alert('Geolocalização não é suportada por este navegador.');
    }
});

document.getElementById('weather-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const city = document.getElementById('city').value;
    if (city) {
        getWeatherByCity(city);
    }
});

async function getWeatherByCity(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=pt_br`);
        const data = await response.json();

        if (data.cod === '404') {
            alert('Cidade não encontrada.');
            return;
        }

        displayWeather(data);
    } catch (error) {
        alert('Erro ao buscar dados. Tente novamente.');
    }
}

async function getWeatherByCoordinates(lat, lon) {
    try {
        // Usar a API de Geocodificação Reversa para obter a cidade a partir das coordenadas
        const reverseGeocodeResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`);
        const reverseGeocodeData = await reverseGeocodeResponse.json();

        if (reverseGeocodeData.cod === '404') {
            alert('Localização não encontrada.');
            return;
        }

        displayWeather(reverseGeocodeData);
    } catch (error) {
        alert('Erro ao buscar dados. Tente novamente.');
    }
}

function displayWeather(data) {
    const weatherInfo = document.getElementById('weather-info');
    const cityName = document.getElementById('city-name');
    const temperature = document.getElementById('temperature');
    const description = document.getElementById('description');
    const weatherIcon = document.getElementById('weather-icon');
    const viewDetails = document.getElementById('view-details');
    const addToFavorites = document.getElementById('add-to-favorites');
    const extendedForecast = document.getElementById('extended-forecast');
    const forecastDetails = document.getElementById('forecast-details');

    cityName.textContent = `${data.name}, ${data.sys.country}`;
    temperature.textContent = `Temperatura: ${data.main.temp}°C`;
    description.textContent = `Condição: ${data.weather[0].description}`;
    weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;

    weatherInfo.classList.remove('hidden');
    extendedForecast.classList.add('hidden');

    viewDetails.onclick = async () => {
        try {
            const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${data.name}&appid=${apiKey}&units=metric&lang=pt_br`);
            const forecastData = await forecastResponse.json();

            if (forecastData.cod !== '200') {
                alert('Erro ao buscar previsão estendida.');
                return;
            }

            forecastDetails.innerHTML = forecastData.list.map(day => `
                <div>
                    <p>Data: ${new Date(day.dt * 1000).toLocaleDateString()}</p>
                    <p>Temperatura: ${day.main.temp}°C</p>
                    <p>Condição: ${day.weather[0].description}</p>
                    <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Ícone do tempo">
                </div>
            `).join('');

            extendedForecast.classList.remove('hidden');
        } catch (error) {
            alert('Erro ao buscar dados. Tente novamente.');
            console.error(error);
        }
    };

    addToFavorites.onclick = () => {
        addCityToFavorites(data);
    };
}

function addCityToFavorites(data) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.find(fav => fav.id === data.id)) {
        favorites.push(data);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert('Cidade adicionada aos favoritos.');
    } else {
        alert('Cidade já está nos favoritos.');
    }
}
