class LocationClient {
    constructor(apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
    }

    async searchPlaces(text, biasPosition = null) {
        const params = {
            action: 'searchPlaceIndex',
            Text: text,
            MaxResults: 10
        };
        
        if (biasPosition) {
            params.BiasPosition = biasPosition;
        }

        return this.makeRequest(params);
    }

    async getMapTile(x, y, z) {
        return this.makeRequest({
            action: 'getMapTile',
            X: x,
            Y: y,
            Z: z
        });
    }

    async makeRequest(params) {
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        return response.json();
    }
}

export default LocationClient;