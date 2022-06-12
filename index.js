import fs from 'node:fs';
import fsp from 'node:fs/promises';
import rl from 'readline';
import process from 'node:process';
import os from 'node:os';
import path from 'node:path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import zlib from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

const readLine = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log(process.cwd());
// Get a name of user -- --username=your_username
const getNameFromArgs = () => {
  const args = process.argv.slice(2);
  const name = args.find((arg) => arg.includes('username'));
  if (name) {
    console.log(`Welcome to the File Manager, ${name.split('=')[1]}`);
    return name.split('=')[1];
  } else {
    console.log(`Welcome to the File Manager, ${os.userInfo().username}`);
  }
  return 'Username';
};
getNameFromArgs();

//Change the current directory WORK
readLine.on('line', (data) => {
  if (data === 'up') {
    try {
      process.chdir('..');
      console.log(`New directory: ${process.cwd()}`);
    } catch (err) {
      console.error(`chdir: ${err}`);
    }
    //Print the current files in that directory
  } else if (data === 'ls') {
    try {
      fsp.readdir('./').then((files) => {
        !files.length ? console.log('Folder is empty') : console.log(files);
      });
    } catch (err) {
      console.error(`readdir: ${err}`);
    }
  }
});

//Read the file specified by the user
readLine.on('line', (data) => {
  const [command, fileName] = data.split(' ');

  if (command === 'cat') {
    fsp.readFile(fileName).then((data) => {
      console.log(data.toString());
    });
    //Add a file
  } else if (command === 'add') {
    fsp.writeFile(fileName, data, (err) => {
      if (err) {
        console.log(err);
      }
    });
    //Go to the directory specified by the user
  } else if (command === 'cd') {
    try {
      process.chdir(fileName);
      console.log(`New directory: ${process.cwd()}`);
    } catch (err) {
      console.error(`chdir: ${err}`);
    }
    //Hash the file specified by the user
  } else if (command === 'hash') {
    fsp.readFile(fileName).then((data) => {
      console.log(crypto.createHash('sha256').update(data).digest('hex'));
    });
  }
});

//Operating system info
readLine.on('line', (data) => {
  switch (data) {
    case '--EOL':
      console.log(JSON.stringify(os.EOL));
      break;
    case '--cpus':
      console.table(os.cpus());
      break;
    case '--homedir':
      console.log(os.homedir());
      break;
    case '--username':
      console.log(os.userInfo().username);
      break;
    case '--architecture':
      console.log(os.arch());
      break;
  }
});

readLine.on('line', (data) => {
  if (data === '.exit') {
    dataEntryCompletion();
  }
});

readLine.on('SIGINT', () => {
  dataEntryCompletion();
});

const dataEntryCompletion = () => {
  readLine.close();
  process.exit(0);
};