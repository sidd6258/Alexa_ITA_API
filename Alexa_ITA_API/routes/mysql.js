var mysql = require('mysql');
var config = require('./config');

function getConnection(){
	var connection = mysql.createConnection({
	    host     : config.mysqlDB.host,
	    user     : config.mysqlDB.username,
	    password : config.mysqlDB.password,
	    database : config.mysqlDB.database,
	    port	 : config.mysqlDB.port
	});
	return connection;
}


function fetchData(callback, sqlQuery){
	
	console.log("\nSQL Query::"+sqlQuery);
	var connection=getConnection();
	connection.query(sqlQuery, function(err, rows, fields) {
		if(err){
			console.log("ERROR  While Fetching: " + err.message);
		}
		else 
		{	// return err or result
			console.log("DB Results:"+rows);
			callback(err, rows);
		}
	});
	console.log("\nConnection closed..");
	connection.end();
}

function insertData(callback, sqlQuery)
{
    console.log("\nSQL Query::"+sqlQuery);
    var connection = getConnection();
    connection.query(sqlQuery, function(err, rows, fields){
        if(err)
        {
            console.log("Error While Inserting :"+err.message);
        }
        else
        {
            callback(err,rows);
        }
    });
}

exports.fetchData=fetchData;
exports.insertData=insertData;