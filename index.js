const path = require('path');
const VeracodeClient = require('@jupiterone/veracode-client');

const actions = ['list', 'sandboxList', 'uploadFile', 'beginPrescan', 'zip'];

const appOutput = app => `${app._attributes.app_name}:
  id: ${app._attributes.app_id}
  updated: ${app._attributes.policy_updated_date}
`;

const sandboxOutput = app => `${app._attributes.sandbox_name}:
  id: ${app._attributes.sandbox_id}
  owner: ${app._attributes.owner}
  updated: ${app._attributes.last_modified}
`;

module.exports = async (action, apiId, apiKey, options) => {
  const veraClient = new VeracodeClient(apiId, apiKey);
  let data;
  switch (action) {
    case 'list':
      data = await veraClient.getAppList();
      return data.map(appOutput).join('');
    case 'sandboxList':
      if (!options.appId) {
        throw new Error(`appId is not defined.`);
      }
      data = await veraClient.getSandboxList(options);
      return data.map(sandboxOutput).join('');
    case 'uploadFile':
      if (!options.appId) {
        throw new Error(`appId is not defined.`);
      }
      data = await veraClient.uploadFile({
        ...options,
        file: path.resolve(process.cwd(), options.file)
      });
      if (data && data._attributes && data._attributes.file && data._attributes.file._attributes) {
        return `New file uploaded: ${data._attributes.file._attributes.file_id}`;
      }
      return 'New file uploaded';
    case 'beginPrescan':
      if (!options.appId) {
        throw new Error(`appId is not defined.`);
      }
      data = await veraClient.beginPrescan(options);
      if (
        data &&
        data._attributes &&
        data._attributes.build &&
        data._attributes.build._attributes &&
        data._attributes.build._attributes.analysis_unit &&
        data._attributes.build._attributes.analysis_unit._attributes
      ) {
        return `New file created: ${
          data._attributes.build._attributes.analysis_unit._attributes.build_id
        }`;
      }
      return 'New scan created';
    case 'zip':
      if (!options.source) {
        throw new Error(`source is not defined.`);
      }
      if (!options.destination) {
        throw new Error(`destination is not defined.`);
      }
      await veraClient.createZipArchive(
        options.source,
        options.destination,
        options.ignore instanceof String ? [options.ignore] : options.ignore
      );
      return `Zip generated: ${options.destination}`;
    default:
      throw new Error(`The action '${action || ''}' is not valid.`);
  }
};

module.exports.actions = actions;
