const { twitter } = require('btch-downloader');

async function test() {
    const url = 'https://twitter.com/petersonpaulrxc/status/1994800153249943952?s=20';
    console.log('Testing URL:', url);
    try {
        const data = await twitter(url);
        console.log('Result:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
