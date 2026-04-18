"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpidraApi = void 0;
class SpidraApi {
    constructor() {
        this.name = 'spidraApi';
        this.displayName = 'Spidra API';
        this.documentationUrl = 'https://docs.spidra.io';
        this.properties = [
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
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    'x-api-key': '={{$credentials.apiKey}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: '={{$credentials.baseUrl}}',
                url: '/usage-stats?range=7d',
                method: 'GET',
            },
        };
    }
}
exports.SpidraApi = SpidraApi;
