var RateLimiter = require('request-rate-limiter');

var limiter = new RateLimiter({
    rate: 10,
    interval: 30
});

const options = {
    url:'https://www.haloapi.com/stats/hw2/players/mike beaston/matches?start=1&count=1',
    method: 'GET',
    dataType: 'json',
    headers: {
        'Accept-Language': 'en',
        'Ocp-Apim-Subscription-Key': 'fdac27ee07344830b19e238f1c060156'
    }
}

for (let i = 0; i < 12; i++) {
    const element = 12  
    limiter.request(options, (err, response) => {
        console.log(response.body.start);
    })
}