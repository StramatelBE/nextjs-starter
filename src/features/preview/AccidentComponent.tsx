'use client';

import { useEffect } from 'react';
import useSocketDataStore from '@/stores/socketDataStore';

export default function AccidentComponent() {
    const { socketData } = useSocketDataStore();

    if (!socketData?.accident) {
        return null;
    }

    return (
        <div className="accident-container">
            <div className="header">
                <img
                    className="logo"
                    src="/LOGO_PELLENC_2.png"
                    alt="logo"
                />
                <div className="header-text" style={{marginTop: "6px"}}>
                    <strong>CULTIVONS LA PRÉVENTION</strong>
                </div>
            </div>
            <div className="info-section">
                <div className="info-text">
                    <div><strong>Nombre de jours</strong></div>
                    <div className="info-text-light"><strong>sans accident</strong></div>
                </div>
                <div className="info-value" style={{ color: "orange"}}>
                    <div className="info-value-texte">{socketData.accident.days_without_accident}</div>
                </div>
            </div>
            <div className="info-section">
                <div className="info-text">
                    <div><strong>Record de jours</strong></div>
                    <div className="info-text-light"><strong>sans accident</strong></div>
                </div>
                <div className="info-value" style={{ color: "#4CFF00", }}>
                    <div className="info-value-texte">{socketData.accident.record_days_without_accident}</div>
                </div>
            </div>
            <div className="info-section">
                <div className="info-text">
                    <div><strong>Nombre d'accident{socketData.accident.accidents_this_year > 1 ? "s" : " "}</strong></div>
                    <div className="info-text-light"><strong>depuis le 1er janvier</strong></div>
                </div>
                <div className="info-value" style={{ color: "#FF0000" , width: "52px" }}>
                    <div className="info-value-texte">{socketData.accident.accidents_this_year}</div>
                </div>
            </div>
        </div>
    );
}