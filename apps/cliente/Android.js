var http = require('http');

var buffer_corpo_response = [];

var opcoes = {
	host : 'localhost',
	port: 80,
	path: '/',
	method: 'post',
	headers: {
		'Accept' : 'application/json',
		'Content-type' : 'application/json'
	}
}

var json = {nome : 'Uver'};
var string_json = JSON.stringify(json);

var buffer_corpo_response = [];

var req = http.request(opcoes, function(res){

	res.on('data', function(pedaco){
		// armazenando no array os dados contidos no buffer
		buffer_corpo_response.push(pedaco);
	});

	res.on('end', function(){
		// juntando esses dados e convertendo para uma string
		var corpo_response = Buffer.concat(buffer_corpo_response).toString();
		console.log(corpo_response);
	})
})

req.write(string_json);
req.end();