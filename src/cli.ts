#!/usr/bin/env node

import * as program from 'commander';
import * as fs from 'fs';
import * as path from 'path';

import {NTPClient} from './';

const defaultPackageJsonPath = path.join(__dirname, 'package.json');
const packageJsonPath = fs.existsSync(defaultPackageJsonPath)
  ? defaultPackageJsonPath
  : path.join(__dirname, '../package.json');

const packageJson = fs.readFileSync(packageJsonPath, 'utf-8');
const {bin, description, version} = JSON.parse(packageJson);

program
  .name(Object.keys(bin)[0])
  .version(version)
  .description(description)
  .option('-s, --server <host>', 'Specify a custom NTP server')
  .option('-p, --port <number>', 'Specify a custom NTP port')
  .option('-t, --timeout <number>', 'Specify the timeout in milliseconds')
  .parse(process.argv);

new NTPClient({
  ...(program.server && {server: program.server}),
  ...(program.port && {port: program.port}),
  ...(program.timeout && {replyTimeout: program.timeout}),
})
  .getNetworkTime()
  .then(date => console.info(date.toString()))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
