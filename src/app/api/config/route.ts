import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { authMiddleware } from '@/lib/auth';

// Path to config file
const CONFIG_FILE_PATH = path.join(process.cwd(), 'config.json');

// Default configuration
const DEFAULT_CONFIG = {
    previewWidth: '800',
    previewHeight: '600',
    websocketUrl: 'ws://localhost:8080',
    apiUrl: 'http://localhost:3000/api',
    uploadDirectory: './public/uploads/',
};

// Helper function to read config file
async function readConfigFile() {
    try {
        const data = await fs.readFile(CONFIG_FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist or has invalid JSON, return default config
        return DEFAULT_CONFIG;
    }
}

// Helper function to write config file
async function writeConfigFile(config: any) {
    try {
        await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing config file:', error);
        return false;
    }
}

// GET /api/config - Get current configuration
export async function GET(request: NextRequest) {
    return authMiddleware(request, async (user) => {
        try {
            const config = await readConfigFile();
            return NextResponse.json(config, { status: 200 });
        } catch (error) {
            console.error('Error reading config:', error);
            return NextResponse.json(
                { error: 'Failed to read configuration' },
                { status: 500 }
            );
        }
    });
}

// PUT /api/config - Update configuration
export async function PUT(request: NextRequest) {
    return authMiddleware(request, async (user) => {
        try {
            const updates = await request.json();

            // Validate required fields
            const requiredFields = ['previewWidth', 'previewHeight', 'websocketUrl', 'apiUrl', 'uploadDirectory'];
            for (const field of requiredFields) {
                if (!updates[field]) {
                    return NextResponse.json(
                        { error: `Missing required field: ${field}` },
                        { status: 400 }
                    );
                }
            }

            // Read current config and merge with updates
            const currentConfig = await readConfigFile();
            const newConfig = { ...currentConfig, ...updates };

            // Write updated config
            const success = await writeConfigFile(newConfig);

            if (success) {
                // Update .env.local file with new config
                try {
                    const envContent = [
                        `NEXT_PUBLIC_PREVIEW_WIDTH=${newConfig.previewWidth}`,
                        `NEXT_PUBLIC_PREVIEW_HEIGHT=${newConfig.previewHeight}`,
                        `NEXT_PUBLIC_WEBSOCKET_URL=${newConfig.websocketUrl}`,
                        `UPLOAD_DIR=${newConfig.uploadDirectory}`,
                    ].join('\n');

                    await fs.writeFile(path.join(process.cwd(), '.env.local'), envContent, 'utf8');
                } catch (envError) {
                    console.error('Error updating .env.local file:', envError);
                    // Continue even if .env update fails
                }

                return NextResponse.json({ success: true, config: newConfig }, { status: 200 });
            } else {
                return NextResponse.json(
                    { error: 'Failed to save configuration' },
                    { status: 500 }
                );
            }
        } catch (error) {
            console.error('Error updating config:', error);
            return NextResponse.json(
                { error: 'Failed to update configuration' },
                { status: 500 }
            );
        }
    });
}