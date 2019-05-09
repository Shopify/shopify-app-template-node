const generatePage = require('../generate-page');
const fs = require('fs');

const content = `const Index = () => <div>Index</div>;
export default Index;`

it('should not call writeFile if file does exist', () => {
  jest.mock("fs", () => ({
    writeFileSync: jest.fn(),
    existsSync: () => true
  }));
  generatePage('pages', ['npm', 'run-script', 'generate-page', 'index'])
  const writeFileSyncSpy = jest.spyOn(fs, "writeFileSync");
  expect(writeFileSyncSpy).toHaveBeenCalledTimes(0);
});

it('should call writeFile if file does not exist', () => {
  jest.mock("fs", () => ({
    writeFileSync: jest.fn(),
    existsSync: () => false
  }));
  generatePage('pages', ['npm', 'run-script', 'generate-page', 'index'])
  expect(fs.writeFileSync).toHaveBeenCalledWith('pages/index.js', content, expect.any(Function));
});

