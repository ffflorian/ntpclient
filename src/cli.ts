#!/usr/bin/env node

import { NTPClient } from './';
import * as program from 'commander';

const { description, version } = require('../package.json');

program
  .version(version)
  .description(description)
  .option('-s, --server <host>', 'Specify a custom NTP server')
  .option('-t, --timeout <number>', 'Specify the timeout in milliseconds')
  .option('-p, --port <number>', 'Specify a custom NTP port')
  .parse(process.argv);

new NTPClient({
  ...(program.server && { server: program.server }),
  ...(program.port && { port: program.port }),
  ...(program.timeout && { replyTimeout: program.timeout })
})
  .getNetworkTime()
  .then(date => console.log(date.toString()))
  .catch(err => console.error(err));
