////PORT///
process.env.PORT = process.env.PORT || 3000;

/////////////// SEED SECRETO //////////////////////
////////Cambiar el seed a secreto en entorno heroku/////////
process.env.SEED = process.env.SEED || 'seed_desarrollo';

////////////// VENCIMIENTO DEL TOKEN //////////////
process.env.CADUCIDAD_TOKEN = '48h';

/////////////// ENVIROMENT /////////////
process.env.NODE_ENV = process.env.NODE_ENV || 'desarrollo';

/////////////// BASE DE DATOS /////////////
let urlDataBase;

if (process.env.NODE_ENV === 'desarrollo') { urlDataBase = 'mongodb://localhost:27017/escuelaAdminDb' } else {
    urlDataBase = `${process.env.MONGO_URI}`
};

process.env.URLDB = urlDataBase;

process.env.DEVELOPER = false;







