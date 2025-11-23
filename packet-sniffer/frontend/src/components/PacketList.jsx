import React, { useRef, useEffect, useState } from 'react';
import { ArrowDown } from 'lucide-react';

const PacketList = ({ packets, onPacketClick }) => {
    const listRef = useRef(null);
    const bottomRef = useRef(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

    // Scroll to bottom when packets change, ONLY if auto-scroll is enabled
    useEffect(() => {
        if (shouldAutoScroll) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [packets, shouldAutoScroll]);

    const handleScroll = () => {
        if (!listRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        // If user is near bottom (within 50px), enable auto-scroll
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
        setShouldAutoScroll(isNearBottom);
    };

    const scrollToBottom = () => {
        setShouldAutoScroll(true);
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="flex-1 bg-black/40 backdrop-blur-md border border-green-500/30 rounded-lg overflow-hidden flex flex-col shadow-[0_0_15px_rgba(0,255,0,0.05)] relative">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-black/80 border-b border-green-500/30 text-xs font-bold text-green-500 tracking-wider">
                <div className="col-span-2">TIME</div>
                <div className="col-span-2">SOURCE</div>
                <div className="col-span-2">DESTINATION</div>
                <div className="col-span-2">LOCATION</div>
                <div className="col-span-1">PROTO</div>
                <div className="col-span-3">INFO</div>
            </div>

            {/* Standard List */}
            <div
                ref={listRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto custom-scrollbar"
            >
                {packets.map((packet, index) => {
                    const isEven = index % 2 === 0;
                    return (
                        <div
                            key={index}
                            onClick={() => onPacketClick && onPacketClick(packet)}
                            className={`grid grid-cols-12 gap-2 px-4 py-1 items-center text-xs font-mono border-b border-white/5 hover:bg-green-500/20 cursor-pointer transition-colors ${isEven ? 'bg-white/5' : ''}`}
                        >
                            <div className="col-span-2 truncate text-gray-500">{new Date(packet.timestamp * 1000).toLocaleTimeString()}</div>
                            <div className="col-span-2 truncate text-blue-300" title={packet.src}>{packet.src}</div>
                            <div className="col-span-2 truncate text-purple-300" title={packet.dst}>{packet.dst}</div>
                            <div className="col-span-2 truncate text-yellow-300" title={packet.geo}>{packet.geo || '-'}</div>
                            <div className="col-span-1">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${packet.proto === 'TCP' ? 'bg-blue-900/50 text-blue-200 border border-blue-500/30' :
                                        packet.proto === 'UDP' ? 'bg-green-900/50 text-green-200 border border-green-500/30' :
                                            'bg-gray-700/50 text-gray-300 border border-gray-500/30'
                                    }`}>
                                    {packet.proto}
                                </span>
                            </div>
                            <div className="col-span-3 truncate text-gray-400 opacity-80" title={packet.summary}>{packet.summary}</div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Resume Button */}
            {!shouldAutoScroll && (
                <button
                    onClick={scrollToBottom}
                    className="absolute bottom-4 right-4 bg-green-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 hover:bg-green-400 transition-colors animate-bounce"
                >
                    <ArrowDown size={12} /> RESUME SCROLL
                </button>
            )}
        </div>
    );
};

export default PacketList;
