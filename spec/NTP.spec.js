//@ts-check
const {NTPClient} = require('../');

describe('NTP', () => {
  it('displays the current time', done => {
    new NTPClient()
      .getNetworkTime()
      .then(data => {
        expect(data).toEqual(jasmine.any(Date));
        done();
      })
      .catch(err => done.fail(err));
  });

  it('works with another NTP server', done => {
    new NTPClient('de.pool.ntp.org')
      .getNetworkTime()
      .then(data => {
        expect(data).toEqual(jasmine.any(Date));
        done();
      })
      .catch(err => done.fail(err));
  });

  it("won't work with an invalid NTP server", done => {
    new NTPClient('google.com')
      .getNetworkTime(2000)
      .then(data => done.fail(data.toString()))
      .catch(() => done());
  });
});
