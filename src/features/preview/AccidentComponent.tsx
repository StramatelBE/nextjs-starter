'use client';

import { useEffect } from 'react';
import useSocketDataStore from '@/stores/socketDataStore';
import {Accident} from "@prisma/client";
interface AccidentComponentProps {
    accidentData?: Accident | null;
}

export default function AccidentComponent({ accidentData }: AccidentComponentProps) {
    console.log('Accident Data:', accidentData); // Add debug log

    if (!accidentData) {
        return (
            <div className="accident-container">
                <div>Attempting to load accident data...</div>
            </div>
        );
    }

    return (
        <div className="accident-container">
            <div className="header">
                <img
                    className="logo"
                    src="/LOGO_PELLENC_2.png"
                    alt="logo"
                />
                <div className="header-text">
                    <strong>CULTIVONS LA PRÉVENTION</strong>
                </div>
            </div>
            <div className="info-section">
                <div className="info-text">
                    <div><strong>Nombre de jours</strong></div>
                    <div className="info-text-light"><strong>sans accident</strong></div>
                </div>
                <div className="info-value" style={{color: "orange"}}>
                    <div className="info-value-texte">{accidentData.days_without_accident}</div>
                </div>
            </div>
            <div className="info-section">
                <div className="info-text">
                    <div><strong>Record de jours</strong></div>
                    <div className="info-text-light"><strong>sans accident</strong></div>
                </div>
                <div className="info-value" style={{color: "#4CFF00"}}>
                    <div className="info-value-texte">{accidentData.record_days_without_accident}</div>
                </div>
            </div>
            <div className="info-section">
                <div className="info-text">
                    <div><strong>Nombre d'accident{accidentData.accidents_this_year > 1 ? "s" : " "}</strong></div>
                    <div className="info-text-light"><strong>depuis le 1er janvier</strong></div>
                </div>
                <div className="info-value" style={{color: "#FF0000", width: "52px"}}>
                    <div className="info-value-texte">{accidentData.accidents_this_year}</div>
                </div>
            </div>
        </div>
    );
}