import { useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import maplibregl from 'maplibre-gl';

const MapWithAuth = ({ containerId = 'map' }) => {
    const [map, setMap] = useState(null);

    useEffect(() => {
        const initializeMap = async () => {
            try {
                // Get credentials from Amplify
                const session = await fetchAuthSession();
                
                if (!session.credentials) {
                    console.error('No credentials available');
                    return;
                }

                const { accessKeyId, secretAccessKey, sessionToken } = session.credentials;

                const mapInstance = new maplibregl.Map({
                    container: containerId,
                    center: [-123.115898, 49.295868],
                    zoom: 10,
                    style: 'https://maps.geo.us-east-1.amazonaws.com/v2/styles/Standard/descriptor?color-scheme=Light',
                    transformRequest: (url, resourceType) => {
                        if (resourceType === 'Source' && url.includes('amazonaws.com')) {
                            return {
                                url: url,
                                headers: {
                                    'x-amz-security-token': sessionToken,
                                    'Authorization': `AWS4-HMAC-SHA256 Credential=${accessKeyId}`
                                }
                            };
                        }
                        return { url };
                    }
                });

                mapInstance.addControl(new maplibregl.NavigationControl(), 'top-left');
                setMap(mapInstance);

            } catch (error) {
                console.error('Map initialization failed:', error);
            }
        };

        initializeMap();

        return () => {
            if (map) {
                map.remove();
            }
        };
    }, [containerId]);

    return <div id={containerId} style={{ height: '100vh', width: '100%' }} />;
};

export default MapWithAuth;