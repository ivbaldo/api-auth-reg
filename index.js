'use strict'

const port = process.env.PORT || 3000;

const https = require('https');
const fs = require('fs');

const moment = require('moment');

const OPTIONS_HTTPS = {
    key: fs.readFileSync('./cert/key.pem'),
    cert: fs.readFileSync('./cert/cert.pem')

};
const REG_EXP_PASS = /[a-zA-Z0-9!@#$%^&*]{6,16}$/; // 6 y 16 caracteres
const REG_EXP_EMAIL =  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
const PASS_SERVICE = require('/home/sd/api-auth-reg/auth-test/services/pass.service');
const TOKEN_SERVICE = require('/home/sd/api-auth-reg/auth-test/services/token_service');

const express = require('express');
const logger = require('morgan');
const cors = require('cors');
//Importo la base de datos
const mongojs = require('mongojs');

//Declaro helmet
var helmet = require('helmet');
const { url } = require('inspector');
const { token } = require('morgan');
const app = express();

var db = mongojs("SD");//Conectamos con la base de datos
var id = mongojs.ObjectId;//Funcion para convertir un id textual en un objeto

var allowCrossTokenHeader = (req, res, next) => {
    res.header("Access-Control-Allow-Headers", "*");
    return next();
}

var allowCrossTokenOrigin = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    return next();
};
//Para autorizar las req
var auth = (req, res, next) => {
    const jwt = req.headers.authorization.split(' ')[1];
    TOKEN_SERVICE.decodificaToken(jwt)
    .then(tokenUsuario => {
        db.user.findOne({_id: id(tokenUsuario)}, (err,elemento) =>{
            if(elemento){
                return next();
            }else{
                return next(new Error("No autorizado"));
            }
            
        });
    });
    
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


//añadimos un tigger previo a las rutas para dar soporte a multiples colecciones
app.param("coleccion", (req, res, next, coleccion) => {
    console.log('param /api/:colecction');
    console.log('coleccion: ',coleccion);
    
    req.collection = db.collection(coleccion);
    return next();
});

/*-------------------------------RUTAS--------------------------*/

app.get('/api/user', auth, (req, res, next) => {
    console.log("La coleccion solicitada: " + req.collection);
    
    db.user.find((err,coleccion) => {
        if(err) return next(err);        
        res.json(coleccion);
    });    
    
});

app.get('/api/user/:id', auth, (req, res, next) => {
    console.log('entro en coleccion/id '+req.params.id);
    
    db.user.findOne({_id: id(req.params.id)}, (err,elemento) =>{
        if(err) return next(err);
        res.json(elemento);
    });
    
});

app.get('/api/auth',auth, (req, res, next) => {
    console.log("La coleccion auth: " + req.collection);
    
    db.user.find({},{_id:1, name:1 , pass:1},(err,coleccion) => {
    if(err) return next(err);        
    res.json(coleccion);
    });

});

app.get('/api/auth/me', auth, (req, res, next) => {
    console.log('entro en auth/me ');
    const jwt = req.headers.authorization.split(' ')[1];
    TOKEN_SERVICE.decodificaToken(jwt)
    .then(tokenUsuario => {
        console.log("El id obtenido al descifrar: " + tokenUsuario);
        db.user.findOne({_id: id(tokenUsuario)}, (err,elemento) =>{
            if(err) return next(err);
            res.json(elemento);
        });
    });
});

app.post('/api/user', auth, (req, res, next) => {
    const elemento = req.body;

    if(!elemento.email){
        res.status(400).json({
            result: "KO",
            error: 'Bad data',
            description: 'Se precisa al menos un campo <email>'
        });
    }else {
        db.user.findOne({email: elemento.email}, (err, user) => {
            if(err) return next(err);
            if(user){
                res.status(400).json({
                    result: "KO",
                    error: 'Bad data',
                    description: 'El usuario ya existe'
                });
            }else{
                elemento.singUpDate = moment().unix();
                elemento.lastLogin = moment().unix();
                db.user.save(elemento, (err, userGuardados) => {
                    if(err) return next(err);
                    const tokenUsuario = TOKEN_SERVICE.creaToken(userGuardados);
                    res.json({
                        result: "OK",
                        token: tokenUsuario,
                        user: userGuardados
                    });
                });    
            } 
        });
    }
});
app.post('/api/reg',(req, res, next) => {
    const elemento = req.body;
    console.log("Lo que es el req.body" + elemento);
    console.log("El elemento.name: " + elemento.name);
    console.log("Longitud de la pass" + elemento.pass.length);
    
    if(!elemento.pass || !elemento.email){
        res.status(400).json({
            error: 'Bad data',
            description: 'Se precisa al menos un campo <pass> y <email>'
        });
    }else {
        if(!validarPassword(elemento.pass)){
            res.status(400).json({
                error: 'Bad data',
                description: 'Contraseña necesita un número y un caracter especial y 6-16 caracteres'
            }); 
        }else if(!validarEmail(elemento.email)){
            res.status(400).json({
                error: 'Bad data',
                description: 'Email minimo 6 letras y máximo 16'
            });
        }else{
            db.user.findOne({email: elemento.email}, (err, user) => {
                if(err) return next(err);
                if(user){
                    res.status(400).json({
                        result: "KO",
                        error: 'Bad data',
                        description: 'El usuario ya existe'
                    });
                }else{
    
                    PASS_SERVICE.encriptaPassword(elemento.pass)
                    .then(hash => {
                    elemento.pass = hash;
                    elemento.singUpDate = moment().unix();
                    elemento.lastLogin = moment().unix();
                    
                        db.user.save(elemento, (err, userGuardados) => {
                            if(err) return next(err);
                
                            const tokenUsuario = TOKEN_SERVICE.creaToken(userGuardados);
                            res.json({
                                result: "OK",
                                token: tokenUsuario,
                                user: userGuardados
                            });
                        });  
                    });
                }
            }); 
        }
              
    }
});

app.post('/api/auth', (req, res, next) => {
    const elemento = req.body;
    if(!elemento.pass || !elemento.email){
        res.status(400).json({
            error: 'Bad data',
            description: 'Se precisa al menos un campo <pass> y <email>'
        });
    }else {
        db.user.findOne({email: elemento.email}, (err, user) => {
        if(err) return next(err);
        if(user){
                PASS_SERVICE.comparaPassword(elemento.pass, user.pass).then(isOk =>{ //Comparamos las contraseñas
                    const tokenUsuario = TOKEN_SERVICE.creaToken(user);
                    if(isOk){
                        res.json({
                            result: "OK",
                            token: tokenUsuario,
                            user: user
                        });
                    }else{
                        res.status(400).json({
                            result: "KO",
                            error: 'Bad data',
                            description: 'Contraseña incorrecta'
                        });
                    }
                    
                });
        }else{
            res.status(400).json({
                result: "KO",
                error: 'Bad data',
                description: 'El usuario no existe en el servidor'
            });
            }
        });       
    }

});

app.put('/api/user/:id', auth, (req, res, next) => {
    let userId = req.params.id;
    let userNuevo = req.body;
    if(userNuevo.pass){
        if(validarPassword(userNuevo.pass)){
            PASS_SERVICE.encriptaPassword(userNuevo.pass)
            .then(hash => {
                userNuevo.pass = hash;
                db.user.update({_id: id(userId)},
                {$set: userNuevo},{safe:true, multi:false}, (err, userModif) => {
                if(err) return next(err);
                res.json(userModif);
                });
            });
        }else{
            res.status(400).json({
                result: "KO",
                error: 'Bad data',
                description: 'Contraseña con formato incorrecto'
            });
        }
    }else{
        db.user.update({_id: id(userId)},
        {$set: userNuevo},{safe:true, multi:false}, (err, userModif) => {
            if(err) return next(err);
            res.json(userModif);
        });
    }
    
});

app.delete('/api/user/:id', auth, (req, res, next) => {
    let userId = req.params.id;

    db.user.remove({_id: id(userId)}, (err, resultado) => {
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

function validarPassword(pass){
    if(!REG_EXP_PASS.test(pass)){
        
        return false;
    }
    return true;
}

function validarEmail(email){
    if(!email.match(REG_EXP_EMAIL)){
        return false;
    }
    return true;
}