var mysql = require('mysql');

var dbHost = '<host>',
    dbUser = '<username>';

var pool = mysql.createConnection({
    host     : dbHost,
    user     : dbUser,
    password : '<password>',
    database : '<database>'
});

module.exports.pool = pool;
