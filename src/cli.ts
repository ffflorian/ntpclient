#!/usr/bin/env node

import * as commander from 'commander';
import * as fs from 'fs';
import * as path from 'path';

import {NTPClient} from './';

const defaultPackageJsonPath = path.join(__dirname, 'package.json');
const packageJsonPath = fs.existsSync(defaultPackageJsonPath)
  ? defaultPackageJsonPath
  : path.join(__dirname, '../package.json');

const packageJson = fs.readFileSync(packageJsonPath, 'utf-8');
const {bin, description, version} = JSON.parse(packageJson);

commander
  .name(Object.keys(bin)[0])
  .version(version)
  .description(description)
  .option('-s, --server <host>', 'Specify a custom NTP server')
  .option('-p, --port <number>', 'Specify a custom NTP port')
  .option('-t, --timeout <number>', 'Specify the timeout in milliseconds')
  .parse(process.argv);

void (async () => {
  try {
    const date = await new NTPClient({
      ...(commander.server && {server: commander.server}),
      ...(commander.port && {port: commander.port}),
      ...(commander.timeout && {replyTimeout: commander.timeout}),
    }).getNetworkTime();

    console.info(date.toString());
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
