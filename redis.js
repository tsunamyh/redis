const client = require('redis').createClient();
const express = require('express');
const axios = require('axios');
const app = express();
const port = 4000;

let isArray = function(a) {
    return (!!a) && (a.constructor === Array);
};

app.get('/data/:searchtext', async (req, res) => {
    await client.connect()
    const searchtext = req.params.searchtext;
    client.on('error', (err) => console.log('Redis Client Error:::::'));
    console.log("searchtext: ", searchtext);
    const value = JSON.parse(await client.get(searchtext))
    console.log("value::", isArray(value),typeof(value));

    if (isArray(value)) {
        console.log('Redis Cache Hit');
        res.json({
            message: 'Redis Cache Hit',
            data: value
        });
    } else {
        console.log('Redis Cache Miss');
        const response = await axios.get(`https://api.gateio.ws/api/v4/futures/usdt/${searchtext}`);
        const data = response.data;
        client.set(searchtext, JSON.stringify(data));
        res.send({
            error: false,
            message: `Data for ${searchtext} from the server`,
            data: data
        });
    }
    await client.quit();
})
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});