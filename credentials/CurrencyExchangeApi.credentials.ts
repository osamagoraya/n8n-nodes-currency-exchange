import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class CurrencyExchangeApi implements ICredentialType {
	name = 'currencyExchangeApi';
	displayName = 'Currency Exchange API';
	documentationUrl = 'https://exchangerate.host/#/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your exchangerate.host API key',
		},
	];
}
