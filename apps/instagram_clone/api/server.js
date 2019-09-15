var express = require('express'),
	multiparty = require('connect-multiparty'),
	bodyParser = require('body-parser'),
	mongodb = require('mongodb'),
	objectId = require('mongodb').ObjectId,
	fs = require('fs');

var app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(multiparty());

app.use(function(req, res, next){

	res.setHeader('Access-Control-Allow-Origin','*');
	res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,DELETE');
	res.setHeader('Access-Control-Allow-Headers','content-type');
	res.setHeader('Access-Control-Allow-Credentials',true);

	next();
})

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
					res.status(200).json(records);
				}
				mongoclient.close();
			})
		})
	})
});

app.get('/imagens/:imagem', function(req, res){

	var img = req.params.imagem;

	fs.readFile('./uploads/'+img, function(err, content){
		if(err){
			res.status(400).json(err);
			return;
		}

		res.writeHead(200,{'content-type':'image/jpg'})
		res.end(content);
	})
})

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

	var date = new Date();
	times_stamp = date.getTime();

	var url_imagem = times_stamp + '_' + req.files.arquivo.originalFilename;

	var path_origem = req.files.arquivo.path;
	var path_destino = './uploads/' + url_imagem;

	fs.rename(path_origem, path_destino, function(err){
		if(err){
			res.status(500).json({error: err});
			return;
		}
	});

	var dados = {
		url_imagem: url_imagem,
		titulo : req.body.titulo
	}

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
				{ $push : {
							comentarios : {
									id_comentario : new objectId(),
									comentario : req.body.comentario
								}
							}
				},
				{},
				function(err, records){
				if(err){
					res.json(err);
				}else{
					res.json(records);
				}
			
			mongoclient.close();
			});
		});
	});
});

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