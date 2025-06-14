import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import axios from 'axios';

export class CurrencyExchangeNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Currency Exchange',
		name: 'currencyExchange',
		group: ['transform'],
		version: 1,
		description: 'Convert currencies using exchange rates from exchangerate.host',
		defaults: {
			name: 'Currency Exchange',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'currencyExchangeApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'From Currency',
				name: 'fromCurrency',
				type: 'string',
				default: 'USD',
				description: 'The currency to convert from (e.g., USD, EUR, GBP)',
				required: true,
			},
			{
				displayName: 'To Currency',
				name: 'toCurrency',
				type: 'string',
				default: 'EUR',
				description: 'The currency to convert to (e.g., USD, EUR, GBP)',
				required: true,
			},
			{
				displayName: 'Amount',
				name: 'amount',
				type: 'number',
				default: 1,
				description: 'The amount to convert',
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const fromCurrency = this.getNodeParameter('fromCurrency', itemIndex, '') as string;
				const toCurrency = this.getNodeParameter('toCurrency', itemIndex, '') as string;
				const amount = this.getNodeParameter('amount', itemIndex, 0) as number;

				// Get API key from credentials
				const credentials = await this.getCredentials('currencyExchangeApi');
				const apiKey = credentials.apiKey as string;

				console.log('API Key:', apiKey);
				console.log('From Currency:', fromCurrency);
				console.log('To Currency:', toCurrency);
				console.log('Amount:', amount);

				// Make API request to get exchange rates
				const response = await axios.get('https://api.exchangerate.host/convert', {
					params: {
						from: fromCurrency,
						to: toCurrency,
						amount: amount,
						access_key: apiKey,
					},
				});

				console.log('API Response:', JSON.stringify(response.data, null, 2));

				if (!response.data || !response.data.success) {
					throw new NodeOperationError(this.getNode(), 'Failed to get exchange rate');
				}

				returnData.push({
					json: {
						fromCurrency,
						toCurrency,
						originalAmount: amount,
						convertedAmount: response.data.result,
						rate: response.data.info?.rate || (response.data.result / amount),
						timestamp: response.data.date || new Date().toISOString(),
					},
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: this.getInputData(itemIndex)[0].json,
						error,
						pairedItem: itemIndex,
					});
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [returnData];
	}
}