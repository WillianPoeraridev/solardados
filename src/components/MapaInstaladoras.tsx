"use client";

import { useEffect, useRef, useState } from "react";

interface InstaladoraMapa {
  nome: string;
  lat: number;
  lng: number;
}

interface MapaInstaladorasProps {
  instaladoras: InstaladoraMapa[];
  cidadeLat: number;
  cidadeLng: number;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    initMap?: () => void;
    google?: any;
  }
}

export default function MapaInstaladoras(props: MapaInstaladorasProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (loaded || !mapRef.current) return;

    if (window.google?.maps) {
      initMap();
      return;
    }

    window.initMap = initMap;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      delete window.initMap;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function initMap() {
    if (!mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: props.cidadeLat, lng: props.cidadeLng },
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
    });

    for (const inst of props.instaladoras) {
      const marker = new window.google.maps.Marker({
        position: { lat: inst.lat, lng: inst.lng },
        map,
        title: inst.nome,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style="font-weight:600;font-size:14px">${inst.nome}</div>`,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });
    }

    setLoaded(true);
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-[400px] rounded-xl border border-gray-200"
    />
  );
}
