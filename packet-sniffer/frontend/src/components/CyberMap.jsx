import React, { useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, Line } from "react-simple-maps";
import { scaleLinear } from "d3-scale";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const CyberMap = ({ packets }) => {
    // Aggregate packets by destination to avoid drawing too many identical lines
    const connections = useMemo(() => {
        const map = new Map();
        // Only visualize the last 50 packets to prevent lag
        const recentPackets = packets.slice(-50);
        recentPackets.forEach(p => {
            if (p.lat && p.lon) {
                const key = `${p.lat},${p.lon}`;
                if (!map.has(key)) {
                    map.set(key, {
                        lat: p.lat,
                        lon: p.lon,
                        count: 1,
                        location: p.geo,
                        lastSeen: p.timestamp
                    });
                } else {
                    const existing = map.get(key);
                    existing.count++;
                    existing.lastSeen = Math.max(existing.lastSeen, p.timestamp);
                }
            }
        });
        return Array.from(map.values());
    }, [packets]);

    // Scale marker size by packet count
    const sizeScale = scaleLinear()
        .domain([1, 50])
        .range([2, 8])
        .clamp(true);

    return (
        <div className="w-full h-full bg-[#050505] rounded-lg overflow-hidden relative">
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 100,
                    center: [0, 20]
                }}
                style={{ width: "100%", height: "100%" }}
            >
                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                        geographies.map((geo) => (
                            <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill="#1a1a1a"
                                stroke="#333"
                                strokeWidth={0.5}
                                style={{
                                    default: { outline: "none" },
                                    hover: { fill: "#2a2a2a", outline: "none" },
                                    pressed: { outline: "none" },
                                }}
                            />
                        ))
                    }
                </Geographies>

                {/* Draw Lines from Center (0,0 approx or user location) to Destinations */}
                {/* Assuming user is roughly in center or we just draw from bottom/center for effect */}
                {connections.map((conn, i) => (
                    <React.Fragment key={i}>
                        {/* Animated Line (Simulated) */}
                        <Line
                            from={[0, 0]} // Ideally this would be user's actual IP location
                            to={[conn.lon, conn.lat]}
                            stroke="#22c55e"
                            strokeWidth={1}
                            strokeOpacity={0.3}
                            strokeLinecap="round"
                        />

                        {/* Destination Marker */}
                        <Marker coordinates={[conn.lon, conn.lat]}>
                            <circle r={sizeScale(conn.count)} fill="#ef4444" stroke="#fff" strokeWidth={1} className="animate-pulse" />
                            <title>{conn.location} ({conn.count} packets)</title>
                        </Marker>
                    </React.Fragment>
                ))}
            </ComposableMap>

            {/* Overlay Stats */}
            <div className="absolute bottom-2 left-2 text-[10px] text-green-500 font-mono bg-black/80 p-2 rounded border border-green-500/20">
                ACTIVE_NODES: {connections.length}
            </div>
        </div>
    );
};

export default CyberMap;
