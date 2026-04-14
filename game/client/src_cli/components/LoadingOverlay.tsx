import React from 'react';
import { LoadingState } from '../types/LoadingTypes';

interface LoadingOverlayProps {
    state: LoadingState;
    visible: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ state, visible }) => {
    if (!visible && !state.isFadingOut) return null;

    const displayMessage = state.error?.details || state.message;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            background: '#fff',
            opacity: state.isFadingOut ? 0 : 1,
            pointerEvents: 'all',
            transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    fontSize: 36,
                    fontWeight: 700,
                    letterSpacing: 3,
                    color: '#9333ea',
                    fontFamily: "'Space Grotesk', sans-serif",
                    marginBottom: 24,
                    textTransform: 'uppercase' as const,
                }}>
                    SkyPong
                </div>
                <div style={{
                    fontSize: 18,
                    color: '#9333ea',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 400,
                }}>
                    {displayMessage}
                </div>
            </div>
        </div>
    );
};

export default LoadingOverlay;
