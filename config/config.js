////PORT///
process.env.PORT = process.env.PORT || 3000;

/////////////// SEED SECRETO //////////////////////
process.env.SEED = process.env.SEED || 'seed_desarrollo';

////////////// VENCIMIENTO DEL TOKEN //////////////
process.env.CADUCIDAD_TOKEN = '48h';

/////////////// ENVIROMENT /////////////
process.env.NODE_ENV = process.env.NODE_ENV || 'desarollo';

/////////////// BASE DE DATOS /////////////
let urlDataBase;

if (process.env.NODE_ENV === 'desarollo') { urlDataBase = 'mongodb://localhost:27017/escuelaAdminDb' } else {
    urlDataBase = 'mongodb://Pancho:Gondorgenwein123@ds141358.mlab.com:41358/cargodbtest'
};

process.env.URLDB = urlDataBase;