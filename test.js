const { CurrencyExchangeNode } = require('./dist/nodes/CurrencyExchange/CurrencyExchange.node');
const axios = require('axios');

// Mock the IExecuteFunctions interface
class MockExecuteFunctions {
    getNodeParameter(param, index, defaultValue) {
        const params = {
            fromCurrency: 'USD',
            toCurrency: 'PKR',
            amount: 100
        };
        return params[param] || defaultValue;
    }

    getInputData() {
        return [{
            json: {}
        }];
    }

    continueOnFail() {
        return false;
    }

    getNode() {
        return {
            name: 'Currency Exchange'
        };
    }

    // Mock getCredentials to use env variable
    async getCredentials(name) {
        if (name === 'currencyExchangeApi') {
            const apiKey = process.env.EXCHANGERATE_API_KEY;
            if (!apiKey) throw new Error('Please set EXCHANGERATE_API_KEY in your environment.');
            return { apiKey };
        }
        throw new Error('Unknown credentials requested');
    }
}

async function testNode() {
    const node = new CurrencyExchangeNode();
    const mockFunctions = new MockExecuteFunctions();

    try {
        const fromCurrency = mockFunctions.getNodeParameter('fromCurrency', 0, '');
        const toCurrency = mockFunctions.getNodeParameter('toCurrency', 0, '');
        const amount = mockFunctions.getNodeParameter('amount', 0, 0);
        const apiKey = (await mockFunctions.getCredentials('currencyExchangeApi')).apiKey;

        console.log('API Key:', apiKey);
        console.log('From Currency:', fromCurrency);
        console.log('To Currency:', toCurrency);
        console.log('Amount:', amount);

        const result = await node.execute.call(mockFunctions);
        console.log('Node Test Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Node Test Error:', error.message);
        if (error.cause) {
            console.error('Error Cause:', error.cause);
        }
    }
}

async function runTests() {
    console.log('\nTesting node implementation...');
    await testNode();
}

runTests();
