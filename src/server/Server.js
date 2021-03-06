const EventEmitter = require('events'),
    util = require('../Utilities.js');

class Server extends EventEmitter {
    constructor({socket, port}){
        super();

        this.port = port;
        
        this.dataSendingRunning = false;
        this.allDataHasBeenProcessed = false;

        socket.on('connection', client => {
            this.emit('connection', client);
            this.emit('client-available', client);
        });
        this.dataSendingRunning = true;
    }

    sendData(client, datas){
        client.load.lastSendTime = Date.now();

        const strippedData = datas.map(data => data.data);
        client.emit("data-distributedstream", strippedData, this.handleResult.bind(this, client, datas));
    }

    handleResult(client, data, results){
        // update the load balancer info
        client.load.lastResponseTime = Date.now();
        client.load.lastDataCount = client.data.size;

        client.data.clear();
        this.emit('client-available', client);
        data.forEach((data, i) => this.emit("result", data, results[i]));
    }
}

module.exports = Server;