const assert = require('assert');
const generatePage = require('./generate-page.js');

const output = generatePage('/tmp', ['npm', 'run-script', 'generate-page', 'katie']);
const expectedOutput = console.log('/tmp/katie.js was successfully created!');

assert(output === expectedOutput, 'Test case is true so this will not be printed');
