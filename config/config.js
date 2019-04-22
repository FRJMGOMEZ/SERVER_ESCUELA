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
    urlDataBase = `mongodb://${process.env.MONGO_URI}/cargodbtest`
};

process.env.URLDB = urlDataBase;

///// MAILJET CREDENTIALS ////
process.env.MAILJETUSER = process.env.MAILJETUSER || 'ae4f0c92e16903546d0e3e3af4441cf1';
process.env.MAILJETPASSWORD = process.env.MAILJETPASSWORD || '20e1aef08ea2f7e92b5b2a1e849085be';