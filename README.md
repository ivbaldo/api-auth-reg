# Backend CRUD API REST

_Ejemplo de WS REST con NodeJS que proporciona un API CRUD para gestionar una DB MongoDB._

## Comenzando 🚀


Ver **Deployment** para conocer cómo desplegar el proyecto.


### Pre-requisitos 📋

Para la ejecución de la aplicación necesitamos instalar NodeJs y una base de datos no estructurada, MongoDB.

+ #### Instalación de NodeJS

Primero instalamos el gestor de paquetes de Node (npm):
```bush
$ sudo apt update
$ sudo apt install npm
```
Para instalar Node y mantener las versiones instalamos n haciendo uso de npm:
```bush
$ sudo npm clean -f
$ sudo npm i -g n
```
Y ahora sí, instalamos la última versión estable de NodeJS y comprobamos las versiones:
```bush
$ sudo n stable
$ node --version
V16.13.2
$ npm -v
8.1.2
```
+ #### Instalacion de MongoDB

Instalamos la base de datos no estructurada.

Instalamos Mongo:
```bush    
$ sudo apt update
$ sudo apt install -y mongodb
```

Para la gestión del servicio de Mondo (start, status, stop, restart, disable, enable) lo haremos con el comando systemctl:
```bush
$ sudo systemctl start mongodb
```
Para verificar el funcionamiento de Mongo:
```bush
$ mongo --eval 'db.runCommand({ connectionStatus: 1 })'
MongoDB shell version v3.6.8
connecting to: mongodb://127.0.0.1:27017
Implicit session: session { "id" : UUID("9e0ea58e-46b5-44be-b40f-181b44c28105") }
MongoDB server version: 3.6.8
{
    "authInfo" : {
        "authenticatedUsers" : [ ],
        "authenticatedUserRoles" : [ ]
    },
    "ok" : 1
}
```
Para abrir el gestor de datos ( cliente mongo) desde otra terminal y probar los comandos para gestionarla:
```bush
<Ctrl+Alt+T>
$ mongo --host 127.0.0.1:27017
> show dbs
admin   0.000GB
config  0.000GB
local   0.000GB
```
Para trabajar con la base de datos tenemos que instalar la biblioteca mongodb, en este caso, la biblioteca mongojs:
```bush    
<Ctrl+Alt+T>
$ cd
$ cd node/sd/api-rest
$ npm i -S mongodb
$ npm i -S mongojs
```

### Instalación 🔧

+ #### Conectarse al repositorio

Creamos una carpeta donde clonar el proyecto:
```bush
$ cd
$ mkdir node
$ cd node
```
Clonamos el proyecto:
```bush
$ git clone https://github.com/ivbaldo/sd.git api-rest
cd api-rest
```
+ #### Instalación de los módulos

Necesitamos entrar en la carpeta del proyecto:
```bush
$ cd node/
$ cd sd/api-rest
```
E instalamos todos los módulos:
```bush
$ npm i
```

## Ejecutando las pruebas ⚙️

Activamos la base de datos en una terminal:
```bush
$ sudo systemctl start mongodb
```
Abrimos otra terminal y ejecutamos el programa:
```bush
<Ctrl+Alt+T>
$ cd node/
$ cd sd/api-rest
$ npm start
```

También podemos abrir el cliente de mongo para la gestión de la base de datos en otra terminal:
```bush
<Ctrl+Alt+T>
$ mongo --host localhost:27017
```
Para ejecutar las pruebas es necesario importar el archivo crud.postman_collection.json en Postman y ejecutar los ejemplos que encontramos en la colección.

### Analice las pruebas end-to-end 🔩



### Y las pruebas de estilo de codificación ⌨️



## Despliegue 📦



## Construido con 🛠️

+ NodeJs
+ MongoDB
+ VSCode

## Contribuyendo 🖇️


## Wiki 📖


## Versionado 📌


## Autores ✒️


* **Paco Maciá** - *Trabajo Inicial* - [pmacia](https://github.com/pmacia)
* **Iván Baldó** - *Documentación* - [ivbaldo](https://github.com/ivbaldo)

También puedes mirar la lista de todos los [contribuyentes](https://github.com/your/project/contributors) quiénes han participado en este proyecto. 

## Licencia 📄

## Expresiones de Gratitud 🎁