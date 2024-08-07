// import express from "express"
// const app = express(); 
// const port = 5000

// app.listen((port), () => {
//     console.log("Server running on Port 5000.");
// });

// app.get("/", (req,res) => {
//     res.send("Hello, creating JC website !!");
// });

// const price = 1; 

// server.js
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const https = require('https');

const app = express();
app.use(bodyParser.json());

const PAYTM_MERCHANT_KEY = 'YOUR_MERCHANT_KEY';
const PAYTM_MID = 'YOUR_MID';
const PAYTM_WEBSITE = 'WEBSTAGING';
const PAYTM_CHANNEL_ID = 'WEB';
const PAYTM_INDUSTRY_TYPE_ID = 'Retail';
const PAYTM_CALLBACK_URL = 'YOUR_CALLBACK_URL';

app.post('/generateTransactionToken', (req, res) => {
    const { amount, orderId, customerId } = req.body;

    const paytmParams = {
        MID: PAYTM_MID,
        WEBSITE: PAYTM_WEBSITE,
        INDUSTRY_TYPE_ID: PAYTM_INDUSTRY_TYPE_ID,
        CHANNEL_ID: PAYTM_CHANNEL_ID,
        ORDER_ID: orderId,
        CUST_ID: customerId,
        TXN_AMOUNT: amount,
        CALLBACK_URL: PAYTM_CALLBACK_URL,
    };

    // Generate checksum
    const checksum = generateChecksum(paytmParams, PAYTM_MERCHANT_KEY);

    paytmParams.CHECKSUMHASH = checksum;

    const post_data = JSON.stringify(paytmParams);

    const options = {
        hostname: 'securegw-stage.paytm.in',
        port: 443,
        path: '/theia/api/v1/initiateTransaction?mid=' + PAYTM_MID + '&orderId=' + orderId,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': post_data.length,
        },
    };

    let response = '';
    const post_req = https.request(options, post_res => {
        post_res.on('data', chunk => {
            response += chunk;
        });

        post_res.on('end', () => {
            res.json(JSON.parse(response));
        });
    });

    post_req.write(post_data);
    post_req.end();
});

const generateChecksum = (params, key) => {
    const data = Object.keys(params)
        .sort()
        .map(k => params[k])
        .join('|');

    return crypto
        .createHmac('sha256', key)
        .update(data)
        .digest('hex');
};

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
