const validator = require('html-validator');
(async () => {
    const options = [
        {
            url: 'http://localhost:3000',
            validator: 'WHATWG',
            format: 'text'
        }, {
            url: 'http://localhost:3000/can/include/?child=article&parent=article',
            validator: 'WHATWG',
            format: 'text'
        }]

    try {
        const results = await Promise.all(options.map(option => validator(option))); 
        results.forEach(result => {
            console.log(result);
        });
    } catch (error) {
        console.error(error)
    }
})()