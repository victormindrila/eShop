const adviceItem = document.querySelector('.advice-item');
let adviceApi = window.config.adviceApi;
console.log(adviceApi);
fetch(adviceApi)
	.then(function(response) {
		return response.json();
	})
	.then(function(myJson) {
		console.log(myJson.slip.advice);
		adviceItem.innerText = myJson.slip.advice;
	});
