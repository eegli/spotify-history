jest.spyOn(global.console, 'log').mockImplementation(() => jest.fn());
jest.spyOn(global.console, 'info').mockImplementation(() => jest.fn());

import Mitm from 'mitm';
const mitm = Mitm();

mitm.on('request', (req, res) => {
  throw new Error('Network requests forbidden in offline mode');
  res.end();
});
