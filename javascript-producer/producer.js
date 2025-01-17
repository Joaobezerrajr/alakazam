#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
const csv = require('csvtojson');

amqp.connect('amqp://localhost', function(error0, connection){
    if(error0) {
        throw error0;
    }

    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }

        var exchange = 'transactions';
        const csvFilePath = '../INPUT/input-data.csv';

        channel.assertExchange(exchange, 'fanout', {
            durable: false
        });

        csv({
            delimiter: ';',
            noheader: true,
            headers: ['Transaction_ID', 'Transaction_Date', 'Person_ID', 'Name', 'Age', 'Amount', 'Installment_Number']
        }).fromFile(csvFilePath).then((jsonObj) => {
            for(let line of jsonObj) {
                channel.publish(exchange, '', Buffer.from(JSON.stringify(line)));
            }

            setTimeout(function() {
                connection.close();
                process.exit(0);
            }, 500);
        
        });
    
    });
});