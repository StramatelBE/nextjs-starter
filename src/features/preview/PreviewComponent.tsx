'use client';

import VideoLabelIcon from "@mui/icons-material/VideoLabel";
import Container from '@/components/Container';

export default function PreviewComponent() {
    const previewUrl = process.env.NEXT_PUBLIC_PREVIEW_URL || 'http://localhost:5173';
    const previewWidth = process.env.NEXT_PUBLIC_PREVIEW_WIDTH || '800';
    const previewHeight = process.env.NEXT_PUBLIC_PREVIEW_HEIGHT || '600';

    return (
        <Container
            icon={<VideoLabelIcon sx={{ color: "primary.light" }} />}
            title="Preview"
            content={
                <iframe
                    src={previewUrl}
                    title="Preview"
                    style={{
                        border: "none",
                        height: `${previewHeight}px`,
                        width: `${previewWidth}px`,
                    }}
                ></iframe>
            }
        />
    );
}