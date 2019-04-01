import NTPClient from '../src';

const replyTimeout = 10 * 1000;

describe('NTP', () => {
  it(
    'displays the current time',
    async () => {
      const data = await new NTPClient({
        replyTimeout,
      }).getNetworkTime();
      expect(data).toEqual(jasmine.any(Date));
    },
    replyTimeout
  );

  it(
    'works with another NTP server',
    async () => {
      const data = await new NTPClient({
        replyTimeout,
        server: 'de.pool.ntp.org',
      }).getNetworkTime();
      expect(data).toEqual(jasmine.any(Date));
    },
    replyTimeout
  );

  it(`doesn't work with an invalid NTP server`, async () => {
    try {
      await new NTPClient({
        replyTimeout: 1000,
        server: 'google.com',
      }).getNetworkTime();
      fail();
    } catch (error) {
      expect(error.message).toContain('Timeout');
    }
  });
});
