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
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`);
        const data = await response.json();

        if (data.cod === '404') {
            alert('Localização não encontrada.');
            return;
        }

        displayWeather(data);
    } catch (error) {
        alert('Erro ao buscar dados. Tente novamente.');
    }
}

function displayWeather(data) {
    const weatherInfo = document.getElementById('weather-info');
    const cityNameText = document.getElementById('city-name-text');
    const countryFlag = document.getElementById('country-flag');
    const temperature = document.getElementById('temperature');
    const description = document.getElementById('description');
    const weatherIcon = document.getElementById('weather-icon');
    const dateElement = document.getElementById('date');
    const weekdayElement = document.getElementById('weekday');
    const viewDetails = document.getElementById('view-details');
    const addToFavorites = document.getElementById('add-to-favorites');
    const extendedForecast = document.getElementById('extended-forecast');
    const forecastDetails = document.getElementById('forecast-details');

    // Atualiza o nome da cidade e o código do país
    cityNameText.textContent = `${data.name}`;

    // Adiciona a bandeira do país
    const countryCode = data.sys.country.toLowerCase(); // Código do país em minúsculas
    countryFlag.innerHTML = `<img src="https://flagcdn.com/w20/${countryCode}.png" alt="Bandeira do país">`;

    // Atualiza as informações do clima
    temperature.textContent = `Temperatura: ${data.main.temp}°C`;
    description.textContent = `Condição: ${data.weather[0].description}`;
    weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;

    // Obtém a data atual e o dia da semana
    const now = new Date();
    const optionsDate = { year: 'numeric', month: 'numeric', day: 'numeric' };
    const optionsWeekday = { weekday: 'long' };
    const formattedDate = now.toLocaleDateString('pt-BR', optionsDate);
    const formattedWeekday = now.toLocaleDateString('pt-BR', optionsWeekday);

    // Atualiza a data e o dia da semana
    dateElement.textContent = `${formattedDate}`;
    weekdayElement.textContent = `${formattedWeekday}`;

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

            // Obtendo a data atual e filtrando previsões duplicadas por dia
            const today = new Date().toLocaleDateString();
            const dailyForecasts = {};
            forecastData.list.forEach(item => {
                const forecastDate = new Date(item.dt * 1000).toLocaleDateString();
                if (forecastDate !== today && !dailyForecasts[forecastDate]) {
                    dailyForecasts[forecastDate] = item;
                }
            });

            // Obtendo as previsões para os próximos 5 dias
            const next5DaysForecasts = Object.values(dailyForecasts).slice(0, 5);

            // Exibindo as previsões na interface
            forecastDetails.innerHTML = next5DaysForecasts.map(day => {
                //Obtendo a data e dia da semana, e separando.
                const date = new Date(day.dt * 1000);
                const optionsDate = { year: 'numeric', month: 'numeric', day: 'numeric' };
                const optionsWeekday = { weekday: 'long' };
                const formattedDate = date.toLocaleDateString('pt-BR', optionsDate);
                const formattedWeekday = date.toLocaleDateString('pt-BR', optionsWeekday);

                return `
                    <div class="forecast-day">
                        <p>${formattedDate}</p>
                        <p>${formattedWeekday}</p> 
                        <p>Temperatura: ${day.main.temp}°C</p>
                        <p>Condição: ${day.weather[0].description}</p>
                        <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Ícone do tempo">
                    </div>
                `;
            }).join('');

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
