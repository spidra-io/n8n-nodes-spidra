import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class SpidraApi implements ICredentialType {
  name = 'spidraApi';
  displayName = 'Spidra API';
  documentationUrl = 'https://docs.spidra.io';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'Your Spidra API key. Find it in your dashboard under Settings > API Keys.',
    },
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.spidra.io/api',
      description: 'Base URL for the Spidra API. Change only for self-hosted or local development.',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'x-api-key': '={{$credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.baseUrl}}',
      url: '/usage-stats?range=7d',
      method: 'GET',
    },
  };
}
