import React, { useEffect, useState, useMemo } from 'react';
import { io } from 'socket.io-client';
import { Play, Square, Shield, Globe, Wifi, Search, Filter, Activity, AlertOctagon, Download, Upload } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatsPanel from './components/StatsPanel';
import PacketList from './components/PacketList';
import ThreatPanel from './components/ThreatPanel';
import PacketInspector from './components/PacketInspector';
import CyberMap from './components/CyberMap';
import Card from './components/Card';

const socket = io('http://localhost:5001', {
    transports: ['websocket'],
});

const App = () => {
    const [packets, setPackets] = useState([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [stats, setStats] = useState({ tcp: 0, udp: 0, other: 0, total: 0 });
    const [trafficData, setTrafficData] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [alerts, setAlerts] = useState([]);
    const [selectedPacket, setSelectedPacket] = useState(null);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to backend');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from backend');
            setIsConnected(false);
        });

        socket.on('packet', (packet) => {
            setPackets(prev => {
                const newPackets = [...prev, packet];
                if (newPackets.length > 1000) newPackets.shift();
                return newPackets;
            });

            setStats(prev => {
                const newStats = { ...prev, total: prev.total + 1 };
                if (packet.proto === 'TCP') newStats.tcp++;
                else if (packet.proto === 'UDP') newStats.udp++;
                else newStats.other++;
                return newStats;
            });

            setTrafficData(prev => {
                const now = new Date().toLocaleTimeString();
                const newData = [...prev, { time: now, len: packet.len }];
                if (newData.length > 30) newData.shift();
                return newData;
            });
        });

        socket.on('threat', (alert) => {
            setAlerts(prev => [alert, ...prev].slice(0, 50)); // Keep last 50 alerts
        });

        socket.on('geo_update', (data) => {
            setPackets(prev => prev.map(p => {
                if (p.dst === data.ip) {
                    // Handle updated geo_info object
                    const geoInfo = data.geo_info;
                    return {
                        ...p,
                        geo: geoInfo ? geoInfo.location : "Unknown",
                        lat: geoInfo ? geoInfo.lat : null,
                        lon: geoInfo ? geoInfo.lon : null
                    };
                }
                return p;
            }));
        });

        socket.on('status', (status) => {
            setIsCapturing(status.is_capturing);
        });

        return () => {
            socket.off('packet');
            socket.off('status');
            socket.off('threat');
            socket.off('geo_update');
        };
    }, []);

    const toggleCapture = () => {
        if (isCapturing) {
            socket.emit('stop_capture');
        } else {
            socket.emit('start_capture');
        }
    };

    const downloadPcap = () => {
        window.open('http://localhost:5001/api/download_pcap', '_blank');
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            await fetch('http://localhost:5001/api/upload_pcap', {
                method: 'POST',
                body: formData,
            });
            alert("Replay started! Watch the dashboard.");
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed");
        }
    };

    // Filter Logic
    const filteredPackets = useMemo(() => {
        if (!filterText) return packets;
        const lowerFilter = filterText.toLowerCase();
        return packets.filter(p =>
            p.src.toLowerCase().includes(lowerFilter) ||
            p.dst.toLowerCase().includes(lowerFilter) ||
            p.proto.toLowerCase().includes(lowerFilter) ||
            p.summary.toLowerCase().includes(lowerFilter)
        );
    }, [packets, filterText]);

    // Determine global threat level for border styling
    const globalThreatLevel = alerts.length > 0 ? alerts[0].level : 'SAFE';
    const appBorderClass =
        globalThreatLevel === 'CRITICAL' ? 'border-4 border-red-600' :
            globalThreatLevel === 'HIGH' ? 'border-4 border-orange-600' :
                '';

    return (
        <div className={`h-screen w-screen bg-[#050505] text-gray-200 p-6 font-mono bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-[#050505] to-[#050505] ${appBorderClass} transition-all duration-300 flex flex-col overflow-hidden`}>
            {/* Header */}
            <header className="flex justify-between items-center mb-6 pb-4 border-b border-green-500/20 flex-none">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                        <Shield className="w-8 h-8 text-green-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-widest text-white">L.I.E.S.<span className="text-green-500">_PRO</span></h1>
                        <div className="text-xs text-green-500/50 tracking-[0.3em]">LAYERED INTRUSION & EXTRACTION SYSTEM</div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Search Bar */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={14} className="text-gray-500 group-focus-within:text-green-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="FILTER PACKETS..."
                            className="bg-black/50 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all w-64 text-green-100 placeholder-gray-600"
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                    </div>

                    {/* Upload PCAP Button */}
                    <div className="relative">
                        <input
                            type="file"
                            id="pcap-upload"
                            className="hidden"
                            accept=".pcap,.pcapng"
                            onChange={handleFileUpload}
                        />
                        <label
                            htmlFor="pcap-upload"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 transition-all cursor-pointer"
                            title="Upload .pcap to Replay"
                        >
                            <Upload size={14} /> REPLAY .PCAP
                        </label>
                    </div>

                    <button
                        onClick={downloadPcap}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-all"
                        title="Download Capture as .pcap"
                    >
                        <Download size={14} /> EXPORT .PCAP
                    </button>

                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${isConnected ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                        {isConnected ? '● CONNECTED' : '○ DISCONNECTED'}
                    </div>

                    <button
                        onClick={toggleCapture}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all shadow-lg hover:shadow-green-500/20 ${isCapturing
                            ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20'
                            : 'bg-green-500/10 text-green-500 border border-green-500/50 hover:bg-green-500/20'
                            }`}
                    >
                        {isCapturing ? <><Square size={16} /> STOP_CAPTURE</> : <><Play size={16} /> START_CAPTURE</>}
                    </button>
                </div>
            </header>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-4 h-[450px] flex-none">
                {/* Stats & Threats Column */}
                <div className="lg:col-span-1 h-full flex flex-col gap-4">
                    <div className="h-64 flex-none min-h-0 overflow-hidden">
                        <StatsPanel stats={stats} />
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <ThreatPanel alerts={alerts} />
                    </div>
                </div>

                {/* Cyber Map (Center Stage) */}
                <Card className="lg:col-span-2 h-full flex flex-col relative group overflow-hidden border-green-500/30 bg-black/80">
                    <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-green-500/30 text-green-400 text-xs font-bold flex items-center gap-2 shadow-lg">
                        <Globe size={14} /> LIVE_THREAT_MAP
                    </div>
                    <CyberMap packets={packets} />
                </Card>

                {/* Traffic Rate Chart */}
                <Card className="lg:col-span-1 h-full flex flex-col border-green-500/30 bg-black/80">
                    <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-green-400 p-4 pb-0 tracking-wider">
                        <Wifi size={16} /> NETWORK_TRAFFIC
                    </h2>
                    <div className="flex-1 min-h-0 w-full p-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trafficData}>
                                <XAxis dataKey="time" hide />
                                <YAxis hide domain={['auto', 'auto']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #22c55e', borderRadius: '4px', color: '#fff' }}
                                    itemStyle={{ color: '#22c55e' }}
                                    labelStyle={{ display: 'none' }}
                                />
                                <Line
                                    type="step"
                                    dataKey="len"
                                    stroke="#22c55e"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4, fill: '#22c55e', stroke: '#fff' }}
                                    animationDuration={300}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Packet Table */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <PacketList
                    packets={filteredPackets}
                    onPacketClick={setSelectedPacket}
                />
                <div className="text-right text-[10px] text-gray-600 mt-2 font-mono">
                    BUFFER: {packets.length} / 1000 PACKETS
                </div>
            </div>

            {/* Packet Inspector Side Panel */}
            {selectedPacket && (
                <PacketInspector
                    packet={selectedPacket}
                    onClose={() => setSelectedPacket(null)}
                />
            )}
        </div>
    );
};

export default App;
