import * as dgram from 'dgram';

export interface NTPConfig {
  /** Remote NTP Server port number */
  port?: number;
  /** Amount of acceptable time to await for a response from the remote server. */
  replyTimeout?: number;
  /** IP/Hostname of the remote NTP Server */
  server?: string;
}

const defaultConfig: Required<NTPConfig> = {
  port: 123,
  replyTimeout: 10 * 1000,
  server: 'pool.ntp.org'
};

export default class NTPClient {
  private readonly config: Required<NTPConfig>;

  constructor(server?: string, port?: number, timeout?: number);
  constructor(config?: NTPConfig);
  constructor(
    configOrServer?: string | NTPConfig,
    port?: number,
    replyTimeout?: number
  ) {
    this.config = defaultConfig;

    if (typeof configOrServer === 'string') {
      this.config.server = configOrServer;
    } else {
      this.config = {
        ...this.config,
        ...configOrServer
      };
    }
    if (port) {
      this.config.port = port;
    }
    if (replyTimeout) {
      this.config.replyTimeout = replyTimeout;
    }
  }

  /** Fetches the current NTP Time from the given server and port. */
  public getNetworkTime(ntpReplyTimeout?: number): Promise<Date> {
    if (ntpReplyTimeout) {
      this.config.replyTimeout = ntpReplyTimeout;
    }

    return new Promise((resolve, reject) => {
      const client = dgram.createSocket('udp4');
      const ntpData = Buffer.alloc(48);

      // RFC 2030 -> LI = 0 (no warning, 2 bits), VN = 3 (IPv4 only, 3 bits), Mode = 3 (Client Mode, 3 bits) -> 1 byte
      // -> rtol(LI, 6) ^ rotl(VN, 3) ^ rotl(Mode, 0)
      // -> = 0x00 ^ 0x18 ^ 0x03
      ntpData[0] = 0x1b;

      const timeout = setTimeout(() => {
        client.close();
        reject(new Error('Timeout waiting for NTP response.'));
        errorFired = true;
      }, this.config.replyTimeout);

      /*
       * Some errors can happen before/after send() or cause send() to break.
       * Some errors will also be given to send()
       * NOTE: the error rejection is not generalised, as the client has to
       * lose the connection also, apparently.
       */
      let errorFired = false;

      client.on('error', err => {
        if (errorFired) {
          return;
        }

        reject(err);
        errorFired = true;

        clearTimeout(timeout);
      });

      client.send(
        ntpData,
        0,
        ntpData.length,
        this.config.port,
        this.config.server,
        err => {
          if (err) {
            if (errorFired) {
              return;
            }
            clearTimeout(timeout);
            reject(err);
            errorFired = true;
            client.close();
            return;
          }

          client.once('message', msg => {
            clearTimeout(timeout);
            client.close();

            // Offset to get to the "Transmit Timestamp" field (time at which the reply
            // departed the server for the client, in 64-bit timestamp format.
            const offsetTransmitTime = 40;
            let intpart = 0;
            let fractpart = 0;

            // Get the seconds part
            for (let i = 0; i <= 3; i++) {
              intpart = 256 * intpart + msg[offsetTransmitTime + i];
            }

            // Get the seconds fraction
            for (let i = 4; i <= 7; i++) {
              fractpart = 256 * fractpart + msg[offsetTransmitTime + i];
            }

            const milliseconds =
              intpart * 1000 + (fractpart * 1000) / 0x100000000;

            // **UTC** time
            const date = new Date('Jan 01 1900 GMT');
            date.setUTCMilliseconds(date.getUTCMilliseconds() + milliseconds);

            resolve(date);
          });
        }
      );
    });
  }
}
