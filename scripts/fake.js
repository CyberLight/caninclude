const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
fs.mkdirSync('fakes', { recursive: true });
const output = fs.createWriteStream(path.join('fakes', 'www.zip'));
const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
});

output.on('close', () => {
    // eslint-disable-next-line no-console
    console.log(`${archive.pointer()} total bytes`);
    // eslint-disable-next-line no-console
    console.log('archiver has been finalized and the output file descriptor has closed.');
});

output.on('end', () => {
    // eslint-disable-next-line no-console
    console.log('Data has been drained');
});

archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
        // log warning
        // eslint-disable-next-line no-console
        console.warn(err);
    } else {
        // throw error
        throw err;
    }
});

archive.on('error', (err) => {
    throw err;
});

archive.pipe(output);


archive.append('Hello to Chinese pentesters! :)', { name: 'package.json' });
archive.append('SECRET="Hello to Chinese pentesters! :)"', { name: '.env' });
archive.append('Hello to Chinese pentesters! :)', { name: 'nodemon.json' });
archive.append('Hello to Chinese pentesters! :)', { name: 'package-lock.json' });
archive.append('Hello to Chinese pentesters! :)', { name: 'server.js' });
archive.append('Hello to Chinese pentesters! :)', { name: 'spec.json' });
archive.append('Hello to Chinese pentesters! :)', { name: 'utils.json' });
archive.append('Hello to Chinese pentesters! :)', { name: 'crawl.js' });

archive.finalize();