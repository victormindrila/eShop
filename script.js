window.addEventListener('load', onStart);
function onStart() {
	// Selectors
	const currencySelector = document.querySelector('.currency-selector select');
	const products = document.querySelector('.products-list');
	const loader = document.querySelector('.loader');
	const filters = document.querySelector('.filters');
	const search = document.querySelector('#search');
	const limitElement = document.querySelector('#limit');
	const sortAscSelector = document.querySelector('#sort-ascending');
	const sortDscSelector = document.querySelector('#sort-descending');

	//variables
	let limit = localStorage.getItem('limit') || '';
	let brand = localStorage.getItem('brand') || '';
	let productsList = [];

	// Listeners
	currencySelector.addEventListener('change', (event) => {
		products.dataset.currency = event.target.value;
	});

	sortAscSelector.addEventListener('change', (event) => {
		sortItemsAscending(productsList, products, event.target.value);
	});
	sortDscSelector.addEventListener('change', (event) => {
		sortItemsDescending(productsList, products, event.target.value);
	});

	filters.addEventListener('click', (event) => {
		switch (event.target.dataset.filter) {
			case 'all':
				products.classList.remove('show-with-nfc');
				products.classList.remove('hide-with-nfc');
				products.classList.remove('show-with-jack');
				products.classList.remove('hide-with-jack');
				products.classList.remove('show-with-infrared');
				products.classList.remove('hide-with-infrared');

				break;
			case 'nfc':
				products.classList.remove('hide-with-nfc');
				products.classList.add('show-with-nfc');
				break;
			case 'no-nfc':
				products.classList.remove('show-with-nfc');
				products.classList.add('hide-with-nfc');
				break;
			case 'jack':
				products.classList.remove('hide-with-jack');
				products.classList.add('show-with-jack');
				break;
			case 'no-jack':
				products.classList.remove('show-with-jack');
				products.classList.add('hide-with-jack');
				break;
			case 'infrared':
				products.classList.remove('hide-with-infrared');
				products.classList.add('show-with-infrared');
				break;
			case 'no-infrared':
				products.classList.remove('show-with-infrared');
				products.classList.add('hide-with-infrared');
				break;
		}
	});

	search.addEventListener(
		'keyup',
		debounce((event) => {
			let brand = event.target.value;
			let limit = localStorage.getItem('limit');
			localStorage.setItem('brand', brand);
			fetchDevices(brand, limit);
		}, 500)
	);
	limitElement.addEventListener(
		'keyup',
		debounce((event) => {
			let brand = localStorage.getItem('brand');
			let limit = event.target.value;
			localStorage.setItem('limit', limit);
			fetchDevices(brand, limit);
		}, 500)
	);

	// run at start
	fetchDevices(brand, limit);
	search.value = brand;
	limitElement.value = limit;

	// helpers
	function renderDevices(devices) {
		products.innerHTML = '';
		productsList = [];
		for (let i in devices) {
			let {
				DeviceName,
				technology,
				announced,
				status,
				dimensions,
				weight,
				type,
				size,
				resolution,
				battery_c,
				cpu,
				internal,
				nfc,
				_3_5mm_jack_,
				infrared_port,
				price
			} = devices[i];
			let product = document.createElement('article');
			product.dataset.title = DeviceName;
			product.dataset.displaySize = size.split(' ')[0];
			product.dataset.internalMemory = parseFloat(internal);
			product.dataset.weight = parseFloat(weight);
			// add classes
			product.classList.add('product');
			let classes = [
				`${nfc === 'Yes' ? 'with-nfc' : ''}`,
				`${_3_5mm_jack_ === 'Yes' ? 'with-jack' : ''}`,
				`${infrared_port === 'Yes' ? 'with-infrared' : ''}`
			];
			classes.forEach((element) => {
				if (element) product.classList.add(element);
			});
			product.innerHTML = `
		<div class="main-icon"></div><h3 class="title">${DeviceName || 'n/a'}</h3>
			  <div class="technology"><strong>Technology:</strong> ${technology || 'n/a'}</div>
			  <div class="announced"><strong>Announced:</strong> ${announced || 'n/a'}</div>
			  <div class="status"><strong>Status:</strong> ${status || 'n/a'}</div>
			  <div class="dimensions"><strong>Dimensions:</strong>${dimensions || 'n/a'}</div>
			  <div class="weight"><strong>Weight:</strong> ${weight || 'n/a'}</div>
			  <div class="display"><strong>Display: </strong> ${type || 'n/a'}</div>
			  <div class="size"><strong>Display size:</strong> ${size || 'n/a'}</div>
			  <div class="resolution"><strong>Resolution:</strong> ${resolution || 'n/a'}</div>
			  <div class="battery"><strong>Battery: </strong>${battery_c || 'n/a'}</div>
			  <div class="cpu"><strong>CPU:</strong> ${cpu || 'n/a'}</div>
			  <div class="memory"><strong>Internal memory: </strong>${internal || 'n/a'}</div>
		  <div class="price">${price || 'No Price'}</div>
		  <div class="icons">
		  	${nfc === 'Yes' ? '<div class="nfc"></div>' : ''}
			${_3_5mm_jack_ === 'Yes' ? '<div class="jack"></div>' : ''}
			${infrared_port === 'Yes' ? '<div class="infrared"></div>' : ''}
		  </div>`;
			products.appendChild(product); // add generated product to products div

			productsList.push(product); // create an array with dom nodes for sorting purposes
			//add event listener to each created object
			product.addEventListener('click', function(event) {
				console.dir(this.querySelector('.title').innerText);
				renderDevice(devices[i]);
			});
		}
	}

	function renderDevice(device) {
		document.querySelector('.products-title').innerText = device.DeviceName;
		products.innerHTML = '';
		//create product
		let product = document.createElement('article');
		product.innerHTML = '<div class="main-icon"></div>';
		let table = document.createElement('table');

		for (let prop of Object.keys(device)) {
			table.innerHTML += `<tr><td><strong>${prop.toUpperCase()}: </strong></td><td>${device[prop]}</td></tr>`;
		}
		//append product
		product.appendChild(table);
		product.classList.add('product');
		product.classList.add('detail');
		products.appendChild(product);
	}

	function fetchDevices(brand, limit) {
		// start loading
		loader.classList.add('loading');
		console.log(
			window.config.fonoapi + 'getlatest?brand=' + brand + '&token=' + window.config.token + '&limit=' + limit
		);
		fetch(window.config.fonoapi + 'getlatest?brand=' + brand + '&token=' + window.config.token + '&limit=' + limit)
			.then((r) => r.json())
			.then((devices) => {
				// stop loading
				loader.classList.remove('loading');
				renderDevices(devices);
			});
	}
	function sortItemsAscending(arr, domHTML, crit) {
		arr.splice();
		arr.sort((a, b) => {
			var itemA = parseFloat(a.dataset[crit]) || a.dataset[crit].trim().toUpperCase();
			var itemB = parseFloat(b.dataset[crit]) || b.dataset[crit].trim().toUpperCase();
			if (itemA < itemB) {
				return -1;
			}
			if (itemA > itemB) {
				return 1;
			}
			return 0;
		});
		domHTML.innerHTML = '';
		for (let i in arr) {
			domHTML.appendChild(arr[i]);
		}
	}

	function sortItemsDescending(arr, domHTML, crit) {
		arr.splice();
		arr.sort((a, b) => {
			var itemA = parseFloat(a.dataset[crit]) || a.dataset[crit].trim().toUpperCase();
			var itemB = parseFloat(b.dataset[crit]) || b.dataset[crit].trim().toUpperCase();
			if (itemA > itemB) {
				return -1;
			}
			if (itemA < itemB) {
				return 1;
			}
			return 0;
		});
		domHTML.innerHTML = '';
		for (let i in arr) {
			domHTML.appendChild(arr[i]);
		}
	}
}
