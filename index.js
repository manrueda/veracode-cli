const path = require('path');
const VeracodeClient = require('@jupiterone/veracode-client');

const actions = ['list', 'sandboxList', 'uploadFile', 'beginPrescan'];

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
      return `New file uploaded: ${data._attributes.file._attributes.file_id}`;
    case 'beginPrescan':
      if (!options.appId) {
        throw new Error(`appId is not defined.`);
      }
      data = await veraClient.beginPrescan(options);
      console.log(data);
      return `New scan: ${data._attributes.build._attributes.analysis_unit._attributes.build_id}`;
    default:
      throw new Error(`The action '${action || ''}' is not valid.`);
  }
};

module.exports.actions = actions;
