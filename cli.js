#!/usr/bin/env node
'use strict';

const meow = require('meow');
const veracodeCLI = require('./index');

const cli = meow(
  `
    Usage
      $ veracode [action] [--options] [file]

    Actions
      list
      sandboxList
      uploadFile
      beginPrescan

    Authentication
      To use this tool API Credentials must provided by environment variables or options

      VERA_ID  or --apiId    for the Credentials ID
      VERA_KEY or --apiKey   for the Credentials Key

    list Options
      none

    sandboxList Options
      --apiId   ID of the application to list the sandboxes

    uploadFile Options
      --apiId       ID of the application where the file will get uploaded
      --sandboxId   ID of the sandbox where the file will get uploaded
      --file        Path to the file to upload

    beginPrescan Options
      --apiId       ID of the application that will be scanned
      --sandboxId   ID of the sandbox that will be scanned
      --autoScan    Enabled auto-scan on the pre-scan.


    Examples
      $ veracode list
`,
  {
    flags: {
      apiId: {
        type: 'string'
      },
      apiKey: {
        type: 'string'
      },
      appId: {
        type: 'string'
      },
      sandboxId: {
        type: 'string'
      },
      autoScan: {
        type: 'boolean',
        default: false
      },
      file: {
        type: 'string'
      }
    }
  }
);

(async () => {
  if (!cli.input[0]) {
    console.log(cli.showHelp());
  }
  cli.flags.apiId = process.env.VERA_ID || cli.flags.apiId;
  cli.flags.apiKey = process.env.VERA_KEY || cli.flags.apiKey;
  const result = await veracodeCLI(cli.input[0], cli.flags.apiId, cli.flags.apiKey, cli.flags);
  console.log(result);
})().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
