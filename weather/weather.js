window.addEventListener('load', onStart);
function onStart() {
	const cityInput = document.querySelector('.city-input');
	const locationBtn = document.querySelector('.location-btn');
	let userLocation;

	locationBtn.addEventListener('click', function() {
		navigator.geolocation.getCurrentPosition(success, error, options);
	});

	cityInput.addEventListener(
		'keyup',
		debounce((event) => {
			localStorage.setItem('city', event.target.value);
			fetchData(event.target.value);
			cityInput.value = '';
		}, 500)
	);

	//helpers
	let options = {
		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 0
	};

	function success(pos) {
		userLocation = pos.coords;
		console.log('Your current position is:');
		console.log(`Latitude : ${userLocation.latitude}`);
		console.log(`Longitude: ${userLocation.longitude}`);
		console.log(`More or less ${userLocation.accuracy} meters.`);
		fetchDataByLocation(userLocation);
	}

	function error(err) {
		console.warn(`ERROR(${err.code}): ${err.message}`);
	}

	function setData(data, error) {
		if (!error) {
			const tempHigh = document.querySelector('.fa-temperature-high');
			const tempLow = document.querySelector('.fa-temperature-low');
			const feelsLike = document.querySelector('.fa-thermometer-half');
			const wind = document.querySelector('.fa-wind');
			const city = document.querySelector('.fa-city');
			console.log(data);
			tempHigh.innerText = ' High ' + Math.round(data.main.temp_max) + '°';
			tempLow.innerText = ' Low ' + Math.round(data.main.temp_min) + '°';
			feelsLike.innerText = ' Feels like ' + Math.round(data.main.feels_like) + '°';
			wind.innerText = ' ' + data.wind.speed + ' m/s';
			city.innerText = ' ' + data.name + ', ' + data.sys.country + ', ' + data.weather[0].description;
		}
	}

	function fetchData(city) {
		let apiAddress =
			window.config.weatherApi +
			'weather?q=' +
			city +
			'&units=metric' +
			'&APPID=' +
			window.config.weatherApiToken;
		fetch(apiAddress)
			.then((r) => r.json())
			.then(function(data) {
				setData(data);
			})
			.catch(function() {
				setData((error = 'error'));
			});
	}
	function fetchDataByLocation(position) {
		navigator.geolocation.getCurrentPosition(success, error, options);
		let lat = userLocation.latitude;
		let lon = userLocation.longitude;
		let apiAddress =
			window.config.weatherApi +
			'weather?lat=' +
			lat +
			'&lon=' +
			lon +
			'&units=metric' +
			'&APPID=' +
			window.config.weatherApiToken;
		fetch(apiAddress)
			.then((r) => r.json())
			.then(function(data) {
				setData(data);
			})
			.catch(function() {
				setData((error = 'error'));
			});
	}
	if (localStorage.getItem('city')) fetchData(localStorage.getItem('city'));
}
