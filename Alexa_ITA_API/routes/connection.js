var elasticsearch=require('elasticsearch');

var client = new elasticsearch.Client({hosts:['ainuco.ddns.net:4328']});

module.exports = client;  
