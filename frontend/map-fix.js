import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import maplibregl from 'maplibre-gl';

// Configure Amplify with your settings
Amplify.configure({
  Auth: {
    Cognito: {
      region: 'us-east-1',
      identityPoolId: 'us-east-1:9769f353-0a46-4524-996e-9f666207aab7'
    }
  }
});

class MapComponent {
    constructor(containerId) {
        this.containerId = containerId;
        this.region = "us-east-1";
    }

    async initialize() {
        try {
            const session = await fetchAuthSession();
            const credentials = session.credentials;
            
            this.map = new maplibregl.Map({
                container: this.containerId,
                center: [-123.115898, 49.295868],
                zoom: 10,
                style: `https://maps.geo.${this.region}.amazonaws.com/v2/styles/Standard/descriptor?color-scheme=Light`,
                transformRequest: (url, resourceType) => {
                    if (resourceType === 'Source' && url.includes('amazonaws.com')) {
                        return {
                            url: url,
                            headers: {
                                'Authorization': `AWS4-HMAC-SHA256 Credential=${credentials.accessKeyId}/${new Date().toISOString().slice(0,10)}/${this.region}/geo/aws4_request`
                            }
                        };
                    }
                    return { url };
                }
            });
            
            this.map.addControl(new maplibregl.NavigationControl(), "top-left");
            return this.map;
        } catch (error) {
            console.error('Map initialization failed:', error);
        }
    }
}

export default MapComponent;