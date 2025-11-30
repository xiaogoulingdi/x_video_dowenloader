const { threads } = require('btch-downloader');

async function test() {
    const url = 'https://www.threads.net/@_____viv703/post/DRpxXKdkml4?xmt=AQF010M65UgMVpfdcT6dsrpdjY6gXzXnLV7H-DUf-BS3HQ';
    console.log('Testing Threads URL:', url);
    try {
        const data = await threads(url);
        console.log('Result:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
