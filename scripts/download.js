const { execSync } = require('child_process');
const urlParam = process.argv[2];
const urlParts = new URL(decodeURIComponent(urlParam)).pathname.split('/');
const [fileName] = urlParts.slice(-1);
execSync(`wget -O ${fileName} ${urlParam}`);