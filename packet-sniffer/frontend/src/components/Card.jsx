import React from 'react';

const Card = ({ children, className = "" }) => {
    return (
        <div
            className={`bg-black/40 backdrop-blur-md border border-green-500/30 rounded-lg p-4 shadow-[0_0_15px_rgba(0,255,0,0.1)] ${className}`}
        >
            {children}
        </div>
    );
};

export default Card;
