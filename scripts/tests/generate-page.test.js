const generatePage = require('../generate-page');
const fs = require('fs');

jest.mock('fs') // this auto mocks all methods on fs

it('should call writeFile', () => {
  generatePage('/pages', ['npm', 'run-script', 'generate-page', 'index'])
  expect(fs.writeFile).toHaveBeenCalled();
});
