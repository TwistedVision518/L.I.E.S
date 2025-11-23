import React from 'react';
import { AlertTriangle, ShieldCheck, AlertOctagon, Brain } from 'lucide-react';
import Card from './Card';

const ThreatPanel = ({ alerts }) => {
    const getAlertStyle = (level, type) => {
        if (type === 'ML_ANOMALY') return 'border-purple-500/50 bg-purple-500/10 text-purple-400';
        switch (level) {
            case 'CRITICAL': return 'border-red-500/50 bg-red-500/10 text-red-400';
            case 'HIGH': return 'border-orange-500/50 bg-orange-500/10 text-orange-400';
            case 'MEDIUM': return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400';
            default: return 'border-green-500/50 bg-green-500/10 text-green-400';
        }
    };

    const getIcon = (level, type) => {
        if (type === 'ML_ANOMALY') return <Brain size={16} className="text-purple-400" />;
        if (level === 'CRITICAL') return <AlertOctagon size={16} className="text-red-500" />;
        if (level === 'SAFE') return <ShieldCheck size={16} className="text-green-500" />;
        return <AlertTriangle size={16} className={level === 'HIGH' ? 'text-orange-500' : 'text-yellow-500'} />;
    };

    return (
        <Card className="h-full flex flex-col relative overflow-hidden border-green-500/30 bg-black/80">
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-green-400 p-4 pb-0 tracking-wider">
                <AlertTriangle size={16} /> AI_SENTINEL_LOGS
            </h2>

            <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-2 font-mono text-xs scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-black">
                {alerts.length === 0 ? (
                    <div className="text-center text-gray-600 mt-10 animate-pulse">
                        NO THREATS DETECTED...
                    </div>
                ) : (
                    alerts.map((alert, idx) => (
                        <div key={idx} className={`p-3 border rounded flex items-start gap-3 transition-all hover:bg-white/5 ${getAlertStyle(alert.level, alert.type)}`}>
                            <div className="mt-0.5 flex-none">
                                {getIcon(alert.level, alert.type)}
                            </div>
                            <div>
                                <div className="font-bold flex items-center gap-2">
                                    {alert.type}
                                    <span className="text-[10px] opacity-70">
                                        {new Date().toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="opacity-90 break-all">
                                    {alert.message}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};

export default ThreatPanel;
