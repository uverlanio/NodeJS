var express = require('express'),
	bodyParser = require('body-parser'),
	mongodb = require('mongodb');
	objectId = require('mongodb').ObjectId;

var app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

var port = 8080;

app.listen(port);

var db = new mongodb.Db(
	'instagram',
	new mongodb.Server('localhost', 27017,{}),
	{}
	);

console.log('Servidor HTTP está escutando na ' + port);

app.get('/', function(req, res){
	var resposta = {msg:"Olá"};
	res.send(resposta)
});


app.get('/api', function(req, res){
	db.open(function(err, mongoclient){
		mongoclient.collection('postagens', function(err, collection){
			collection.find().toArray(function(err, records){
				if(err){
					res.json(err);
				}else{
					res.json(records);
				}
				mongoclient.close();
			})
		})
	})
});

app.get('/api/:id', function(req, res){
	db.open(function(err, mongoclient){
		mongoclient.collection('postagens', function(err, collection){
			collection.find(objectId(req.params.id)).toArray(function(err, records){
				if(err){
					res.json(err);
				}else{
					res.json(records[0]);
				}
			})
		})
	})
});

app.post('/api', function(req, res){
	var dados = req.body;

	db.open(function(err, mongoclient){
		mongoclient.collection('postagens', function(err, collection){
			collection.insert(dados, function(err, records){
				if(err){
					res.json(err);
				}else{
					res.json(records)
				}
				mongoclient.close();
			})
		})
	})
});

app.put('/api/:id', function(req, res){
	db.open(function(err, mongoclient){
		mongoclient.collection('postagens', function(err, collection){
			collection.update(
				{ _id : objectId(req.params.id)},
				{ $set : {titulo : req.body.titulo}},
				{},
				function(err, records){
				if(err){
					res.json(err);
				}else{
					res.json(records);
				}
			
			mongoclient.close();
			})
		})
	})
})

app.delete('/api/:id', function(req, res){
	db.open(function(err, mongoclient){
		mongoclient.collection('postagens', function(err, collection){
			collection.remove({ _id : objectId(req.params.id)},	function(err, records){
				if(err){
					res.json(err);
				}else{
					res.json(records);
				}
			
			mongoclient.close();
			})
		})
	})
})