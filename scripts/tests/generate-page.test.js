const generatePage = require('../generate-page');
const fs = require('fs');

const content = `const Index = () => <div>Index</div>;
export default Index;`

jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  existsSync: page => {
    if (page === 'pages/test.js') {
      return true;
    } else {
      return false;
    }
  }
}));

it('should call writeFile if file does not exist', () => {
  generatePage('pages', ['npm', 'run-script', 'generate-page', 'index'])
  expect(fs.writeFileSync).toHaveBeenCalledWith('pages/index.js', content, expect.any(Function));
});


it('should call not writeFile if file does exist', () => {
  generatePage('pages', ['npm', 'run-script', 'generate-page', 'test'])
  const writeFileSyncSpy = jest.spyOn(fs, "writeFileSync");
  expect(writeFileSyncSpy).toHaveBeenCalledTimes(0);
});
