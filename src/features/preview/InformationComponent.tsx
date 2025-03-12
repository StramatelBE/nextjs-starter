'use client';

import { Data } from '@prisma/client';

interface InformationComponentProps {
    data: Data[];
    time: Date;
}

export default function InformationComponent({ data, time }: InformationComponentProps) {
    // Find temperature data
    const tempData = data.find(d => d.name === 'temperature' || d.name === 'temp');

    return (
        <div>
            <div className="header" style={{backgroundColor: 'rgb(219, 218, 218)'}}>
                <img
                    className="logo"
                    src="/LOGO_PELLENC_2.png"
                    alt="logo"
                />
                <div className="header-text" style={{fontSize: '24px', marginLeft: "20px", marginTop: "6px"}}>
                    BIENVENUE
                </div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <div className="info-value-date">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="info-value-date">{time.toLocaleDateString()}</div>
                <div className="info-value-date">{tempData?.value || '--'}°C</div>
            </div>
        </div>
    );
}