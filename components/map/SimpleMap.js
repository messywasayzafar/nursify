import { useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import maplibregl from 'maplibre-gl';

const SimpleMap = () => {
    const [error, setError] = useState(null);

    useEffect(() => {
        const initMap = async () => {
            try {
                // Force guest credentials
                const session = await fetchAuthSession({ forceRefresh: true });
                
                console.log('Session:', session);
                
                if (!session.credentials) {
                    throw new Error('Failed to get credentials');
                }

                const map = new maplibregl.Map({
                    container: 'map',
                    center: [-74.5, 40],
                    zoom: 9,
                    style: 'https://demotiles.maplibre.org/style.json'
                });

                map.addControl(new maplibregl.NavigationControl());
                
            } catch (err) {
                console.error('Map error:', err);
                setError(err.message);
            }
        };

        initMap();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return <div id="map" style={{ width: '100%', height: '400px' }} />;
};

export default SimpleMap;