//@ts-check

const { NTPClient } = require('../');

describe('NTP', () => {
  it(
    'displays the current time',
    async () => {
      const data = await new NTPClient().getNetworkTime();
      expect(data).toEqual(jasmine.any(Date));
    },
    10000
  );

  it(
    'works with another NTP server',
    async () => {
      const data = await new NTPClient('de.pool.ntp.org').getNetworkTime();
      expect(data).toEqual(jasmine.any(Date));
    },
    10000
  );

  it(`won't work with an invalid NTP server`, async () => {
    try {
      await new NTPClient('google.com').getNetworkTime(2000);
      fail();
    } catch (error) {
      expect(error).toContain('Timeout');
    }
  });
});
