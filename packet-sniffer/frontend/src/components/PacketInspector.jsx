import React from 'react';
import { X, FileCode, FileText } from 'lucide-react';
import Card from './Card';

const PacketInspector = ({ packet, onClose }) => {
    if (!packet) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-[500px] bg-black/90 backdrop-blur-xl border-l border-green-500/30 shadow-2xl transform transition-transform duration-300 z-50 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-green-500/20 flex justify-between items-center bg-green-500/5">
                <h2 className="text-lg font-bold text-green-400 flex items-center gap-2">
                    <FileCode size={20} /> PACKET_INSPECTOR
                </h2>
                <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                {/* Metadata */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">METADATA</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                        <div className="bg-white/5 p-2 rounded border border-white/5">
                            <div className="text-gray-500 text-[10px]">SOURCE</div>
                            <div className="text-blue-300">{packet.src}</div>
                        </div>
                        <div className="bg-white/5 p-2 rounded border border-white/5">
                            <div className="text-gray-500 text-[10px]">DESTINATION</div>
                            <div className="text-purple-300">{packet.dst}</div>
                        </div>
                        <div className="bg-white/5 p-2 rounded border border-white/5">
                            <div className="text-gray-500 text-[10px]">PROTOCOL</div>
                            <div className="text-green-300">{packet.proto}</div>
                        </div>
                        <div className="bg-white/5 p-2 rounded border border-white/5">
                            <div className="text-gray-500 text-[10px]">SIZE</div>
                            <div className="text-yellow-300">{packet.len} BYTES</div>
                        </div>
                    </div>
                </div>

                {/* Payload Inspector */}
                <div className="flex-1 flex flex-col">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <FileText size={14} /> PAYLOAD_DUMP
                    </h3>

                    {packet.payload_hex ? (
                        <div className="grid grid-cols-2 gap-4 font-mono text-xs h-96">
                            {/* Hex View */}
                            <div className="bg-black/50 border border-green-500/20 rounded p-2 overflow-y-auto custom-scrollbar">
                                <div className="text-center text-gray-600 mb-2 border-b border-white/5 pb-1">HEX</div>
                                <div className="text-green-500/80 break-all whitespace-pre-wrap">
                                    {packet.payload_hex.match(/.{1,2}/g)?.join(' ') || ''}
                                </div>
                            </div>

                            {/* ASCII View */}
                            <div className="bg-black/50 border border-green-500/20 rounded p-2 overflow-y-auto custom-scrollbar">
                                <div className="text-center text-gray-600 mb-2 border-b border-white/5 pb-1">ASCII</div>
                                <div className="text-white/70 break-all whitespace-pre-wrap leading-relaxed">
                                    {packet.payload_ascii}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-32 flex items-center justify-center border border-dashed border-gray-700 rounded text-gray-600 font-mono text-sm">
                            NO_PAYLOAD_DATA
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PacketInspector;
