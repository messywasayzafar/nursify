import maplibregl from 'maplibre-gl';
import { amazonLocationAuthHelper } from '@aws/amazon-location-utilities-auth-helper';

class MapComponent {
    constructor(containerId) {
        this.containerId = containerId;
        this.identityPoolId = "us-east-1:9769f353-0a46-4524-996e-9f666207aab7";
        this.region = "us-east-1";
        this.style = "Standard";
        this.colorScheme = "Light";
    }

    async initialize() {
        const authHelper = await amazonLocationAuthHelper.withIdentityPoolId(this.identityPoolId);
        
        this.map = new maplibregl.Map({
            container: this.containerId,
            center: [-123.115898, 49.295868],
            zoom: 10,
            style: `https://maps.geo.${this.region}.amazonaws.com/v2/styles/${this.style}/descriptor?color-scheme=${this.colorScheme}`,
            ...authHelper.getMapAuthenticationOptions(),
        });
        
        this.map.addControl(new maplibregl.NavigationControl(), "top-left");
        return this.map;
    }
}

export default MapComponent;