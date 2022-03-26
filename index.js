'use strict'

const port = process.env.PORT || 3000;

const https = require('https');
const fs = require('fs');

const express = require('express');
const logger = require('morgan');
//Importo la base de datos
const mongojs = require('mongojs');

//Declaro helmet
var helmet = require('helmet');
const app = express();

var db = mongojs("SD");//Conectamos con la base de datos
var id = mongojs.ObjectId;//Funcion para convertir un id textual en un objeto

//Middleware
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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
    console.log(`sEC WS API REST ejecutandose en https://localhost:${port}/api/:coleccion/:id`)
});
/*app.listen(port, () => {
    console.log('Servicio Web RESTFul de Registro y autenticación');
})*/