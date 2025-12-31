import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useSell } from "../../contexts/SellContext";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Extracts clean English city/town/village name
function extractPlaceName(data) {
  if (!data) return "";
  let name =
    data.address?.city ||
    data.address?.town ||
    data.address?.village ||
    data.address?.suburb ||
    data.address?.state_district ||
    data.address?.state ||
    "";

  if (!name && data.display_name) name = data.display_name.split(",")[0].trim();
  name = name.replace(/[^\x00-\x7F]/g, "").trim(); // remove non-English chars
  return name;
}

function LocationMarker({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 16);
  }, [position, map]);
  return position ? <Marker position={position} /> : null;
}

function ClickableMap({ setMarkerPos, setAddress }) {
  const map = useMap();
  const { handleLocation } = useSell();

  useEffect(() => {
    const handleClick = async (e) => {
      const lat = Number(e.latlng.lat.toFixed(5));
      const lng = Number(e.latlng.lng.toFixed(5));
      setMarkerPos([lat, lng]);

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&accept-language=en&lat=${lat}&lon=${lng}`
        );
        const data = await res.json();
        const placeName = extractPlaceName(data) || `${lat}, ${lng}`;
        setAddress(placeName);

        console.log("📍 Selected Place:", placeName);
        handleLocation({ lat, lng, place: placeName });
      } catch (err) {
        console.error("Error fetching address:", err);
      }
    };

    // ✅ Add listener once
    map.on("click", handleClick);

    // 🧹 Cleanup on unmount
    return () => {
      map.off("click", handleClick);
    };
  }, [map, handleLocation, setMarkerPos, setAddress]);

  return null;
}



export default function SelectLocation() {
  const [address, setAddress] = useState("");
  const [markerPos, setMarkerPos] = useState(null);
  const { handleLocation, nextStep, prevStep, clearStep } = useSell();
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!address) return;
    setLoading(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&accept-language=en&q=${encodeURIComponent(
          address
        )}`
      );
      const data = await res.json();

      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const position = [parseFloat(lat), parseFloat(lon)];
        setMarkerPos(position);

        const placeName = display_name.split(",")[0].trim();
        setAddress(placeName);

        console.log("📍 Found:", placeName);
        handleLocation({ lat: parseFloat(lat), lng: parseFloat(lon), place: placeName });
      } else {
        toast.error("Location not found");
      }
      setLoading(false);
    } catch (err) {
      console.error("Error searching location:", err);
      toast.error("Error searching location");
    }
  };

  const handleNext = () => {
    if (!markerPos) {
      toast.warning("Please select a location before continuing.");
      return;
    }
    nextStep();
  };

  return (
    <div
      onClick={() => clearStep()}
      className="fixed inset-0 bg-black/50 md:bg-black/50 bg-white md:flex md:items-center md:justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-none md:rounded-2xl shadow-xl w-full h-full md:w-[450px] md:max-h-[90vh] p-0 md:p-8 flex flex-col relative overflow-y-auto"
      >
        <div className="flex items-center p-6 md:p-0 md:mb-4">
          <button onClick={prevStep} className="md:hidden mr-3" type="button">
            <ArrowLeft className="size-6 text-gray-700" />
          </button>
          <h2 className="text-xl md:text-lg font-semibold text-left md:text-center flex-1 md:flex-none">
            Add Location
          </h2>
        </div>

        <div className="w-full h-[400px] md:h-[400px] mb-4">
          <MapContainer
            center={[8.5241, 76.9366]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker position={markerPos} />
            <ClickableMap setMarkerPos={setMarkerPos} setAddress={setAddress} />
          </MapContainer>
        </div>

        <div className="px-6 md:px-0 flex flex-col gap-4">
          <input
            type="text"
            placeholder="Pathanamthitta, Kerala"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>

        <div className="px-6 md:px-0 pb-24 md:pb-0">
          <button
            onClick={handleNext}
            className={`w-full py-3 rounded-xl mt-6 md:mt-10 font-medium text-white ${markerPos
              ? "bg-primary hover:bg-primary/90"
              : "bg-gray-300 cursor-not-allowed"
              }`}
            disabled={!markerPos}
            type="button"
          >
            {loading ? "Fetching Location..." : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
