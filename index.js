'use strict'

const port = process.env.PORT || 3000;

const https = require('https');
const fs = require('fs');

const OPTIONS_HTTPS = {
    key: fs.readFileSync('./cert/key.pem'),
    cert: fs.readFileSync('./cert/cert.pem')

};
const express = require('express');
const logger = require('morgan');
//Importo la base de datos
const mongojs = require('mongojs');

//Declaro helmet
var helmet = require('helmet');
const app = express();

var db = mongojs("SD");//Conectamos con la base de datos
var id = mongojs.ObjectId;//Funcion para convertir un id textual en un objeto


var allowCrossTokenHeader = (req, res, next) => {
    res.header("Access-Control-Allow-Headers", "GET, POST, PUT, DELETE, OPTIONS");
    return next();
}

var allowCrossTokenOrigin = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    return next();
};
//Para autorizar las req
var auth = (req, res, next) => {
    if(req.headers.token === "password1234"){
        return next();
    }else{
        return next(new Error("No autorizado"));
    }
};


//Middleware
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//cors middlewares
app.use(cors());
app.use(allowCrossTokenHeader);
app.use(allowCrossTokenOrigin);

//helmet middleware
app.use(helmet());

app.param("user", (req,res,next, user) => {
    console.log('param /api/:user');
    console.log('coleccion: ',user);

    req.collection = db.collection(user);
    return next();
});

/*-------------------------------RUTAS--------------------------*/

app.get('/api/:user', (req, res, next) => {
    req.collection.find((err,coleccion) => {
        if(err) return next(err);
        res.json(coleccion);
    });
});

app.get('/api/:user/:id', (req, res, next) => {
    req.collection.findOne({_id: id(req.params.id)}, (err,elemento) =>{
        if(err) return next(err);
    });
});

app.post('/api/:user', (req, res, next) => {
    const elemento = req.body;
    
    if(!elemento.nombre){
        res.status(400).json({
            error: 'Bad data',
            description: 'Se precisa al menos un campo <nombre>'
        });
    }else{
        req.collection.save(elemento, (err, userGuardados) => {
            if(err) return next(err);
            res.json(userGuardados);
        });
    }
});

app.put('/api/:user/:id', (req, res, next) => {
    let userId = req.params.id;
    let userNuevo = req.body;
    req.coleccion.update({_id: id(userId)},
    {$set: userNuevo},{safe:true, multi:false}, (err, userModif) => {
        if(err) return next(err);
        res.json(userModif);
    });
});

app.delete('/api/:user/:id', (req, res, next) => {
    let userId = req.params.id;

    req.collection.remove({_id: id(userId)}, (err, resultado) => {
        if(err) return next(err);
        res.json(resultado);
    });
});
https.createServer(OPTIONS_HTTPS, app).listen(port, () => {
    console.log(`API-AUTH-REG ejecutandose en https://localhost:${port}/api/:coleccion/:id`)
});
/*app.listen(port, () => {
    console.log('Servicio Web RESTFul de Registro y autenticación');
});*/