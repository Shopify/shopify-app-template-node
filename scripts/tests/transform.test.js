const transform = require('../transform');
const fs = require('fs');

jest.mock("fs", () => ({
  readFileSync: () => 'sum(1 *2)',
  writeFileSync: jest.fn(),
  existsSync: () => true
}));

jest.mock('prettier', () => ({
  format: code => code
}));

const mockTransformer = file => file

it("reads, transforms and write a file", () => {
  transform("/any/path.js", mockTransformer);
  expect(fs.writeFileSync).toHaveBeenCalledWith("/any/path.js", "sum(1 * 2);", expect.any(Function))
});
