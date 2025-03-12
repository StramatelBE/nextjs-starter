// src/app/api/medias/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { authMiddleware } from '@/lib/auth';
import prisma from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { mkdir } from 'fs/promises';
import { PathLike } from 'fs';

// Helper function to ensure directory exists
async function ensureDir(dirPath: PathLike) {
    try {
        await fs.access(dirPath);
    } catch (error) {
        await mkdir(dirPath, { recursive: true });
    }
}

// POST /api/medias - Upload media
export async function POST(request: NextRequest) {
    return authMiddleware(request, async (user) => {
        try {
            const formData = await request.formData();
            const file = formData.get('file') as File;
            const playlistId = parseInt(formData.get('playlistId') as string);

            if (!file) {
                return NextResponse.json(
                    { success: false, error: 'No file provided' },
                    { status: 400 }
                );
            }

            // Check if playlist exists and belongs to user
            const playlist = await prisma.playlist.findUnique({
                where: { id: playlistId },
            });

            if (!playlist || playlist.user_id !== user.id) {
                return NextResponse.json(
                    { success: false, error: 'Playlist not found or access denied' },
                    { status: 404 }
                );
            }

            // Determine upload directory
            const uploadDir = process.env.UPLOAD_DIR || './public/uploads/';
            await ensureDir(uploadDir);

            // Generate unique filename
            const originalFileName = file.name;
            const fileExtension = path.extname(originalFileName);
            const fileName = `${uuidv4()}${fileExtension}`;
            const filePath = path.join(uploadDir, fileName);
            const publicPath = `/uploads/${fileName}`;

            // Get file buffer
            const buffer = await file.arrayBuffer();

            // Save file
            await fs.writeFile(filePath, Buffer.from(buffer));

            // Determine file type
            const fileType = file.type.split('/')[0]; // 'image' or 'video'

            // Determine duration (for videos use a default, would need a library for accurate duration)
            const duration = fileType === 'video' ? 30 : 10; // Default: 30 seconds for videos, 10 for images

            // Get position (last in playlist)
            const lastMedia = await prisma.media.findFirst({
                where: { playlistId },
                orderBy: { position: 'desc' },
            });
            const position = lastMedia ? lastMedia.position + 1 : 0;

            // Create database record
            const media = await prisma.media.create({
                data: {
                    original_file_name: originalFileName,
                    file_name: fileName,
                    path: publicPath,
                    format: fileExtension.replace('.', ''),
                    type: fileType,
                    size: Math.round(buffer.byteLength / 1024), // Size in KB
                    user_id: user.id,
                    duration,
                    position,
                    playlistId,
                },
            });

            return NextResponse.json(
                { success: true, data: media },
                { status: 201 }
            );
        } catch (error) {
            console.error('Error uploading media:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to upload media' },
                { status: 500 }
            );
        }
    });
}