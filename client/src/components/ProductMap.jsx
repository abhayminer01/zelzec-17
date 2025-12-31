// src/components/ProductMap.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons wanting 404
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const ProductMap = ({ location }) => {
    // Default to Kerala coordinates if no specific location
    // Kochi: 9.9312, 76.2673
    const lat = location?.lat || 9.9312;
    const lng = location?.lng || 76.2673;
    const placeName = location?.place || "Kerala, India";

    return (
        <div className="h-full w-full rounded-lg overflow-hidden z-0 relative">
            <MapContainer
                center={[lat, lng]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]}>
                    <Popup>
                        {placeName}
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default ProductMap;
