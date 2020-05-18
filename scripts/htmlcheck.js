(async () => {
    const validator = require('html-validator')
    const options = {
        url: 'http://localhost:3000',
        validator: 'WHATWG',
        format: 'text'
    }

    try {
        const result = await validator(options)
        console.log(result)
    } catch (error) {
        console.error(error)
    }
})()