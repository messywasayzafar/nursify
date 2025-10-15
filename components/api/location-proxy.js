const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-1',
    credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-1:9769f353-0a46-4524-996e-9f666207aab7'
    })
});
const location = new AWS.Location({ region: 'us-east-1' });

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Content-Type': 'application/json'
    };

    try {
        const { action, ...params } = JSON.parse(event.body || '{}');
        
        let result;
        switch (action) {
            case 'getMapTile':
                result = await location.getMapTile({
                    MapName: 'nursify-map',
                    ...params
                }).promise();
                return {
                    statusCode: 200,
                    headers: { ...headers, 'Content-Type': 'image/png' },
                    body: result.Blob.toString('base64'),
                    isBase64Encoded: true
                };
                
            case 'searchPlaceIndex':
                result = await location.searchPlaceIndexForText({
                    IndexName: 'nursify-places',
                    ...params
                }).promise();
                break;
                
            case 'getPlace':
                result = await location.getPlace({
                    IndexName: 'nursify-places',
                    ...params
                }).promise();
                break;
                
            default:
                throw new Error('Invalid action');
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result)
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};