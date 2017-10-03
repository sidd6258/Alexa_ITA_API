var config = {
    server: {
        ip: "34.229.78.187",
        host: "ec2-34-229-78-187.compute-1.amazonaws.com",
        port: "80"
    },
    mongoDB: {
        host: "ec2-34-229-78-187.compute-1.amazonaws.com",
        port: "27017",
        username: "iTravelDBUser",
        password: "root",
        database: "iTravelDB"
    },
    mysqlDB: {
        host: "34.229.78.187",
        port: "3306",
        username: "itraveldb-user",
        password: "itraveldb",
        database: "iTravelDB"
    }
}

module.exports = config;