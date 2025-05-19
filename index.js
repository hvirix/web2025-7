const express = require('express');
const { program } = require ('commander');

program
    .option('-h, --host <address>')
    .option('-p, --port <number>')

program.parse();
const options = program.opts();

if (!options.port) {
    console.log('Please, specify port');
    return;
}

if (!options.host) {
    console.log('Please, specify host');
    return;
}

const app = express();

app.listen(options.port, options.host, () => {
    console.log(`Server is running on port ${options.port}`)
});