import React from 'react';
import './loader.css';

const Loader: React.FC = () => {
    return (
        <div className="pong-loader-container h-screen w-full fixed inset-0 z-50">

            <div className="pong-board">
                <div className="paddle left"></div>
                <div className="paddle right"></div>
                <div className="ball"></div>
            </div>

            <div className="loading-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
            </div>

            <div className="loading-text">Loading</div>
        </div>
    );
};

export default Loader;
