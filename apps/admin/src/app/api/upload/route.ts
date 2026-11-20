import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No se recibió ningún archivo de imagen.' },
        { status: 400 }
      );
    }

    // Generar nombre seguro único
    const hash = crypto.randomBytes(6).toString('hex');
    const timestamp = Date.now();
    const ext = file.name.endsWith('.webp') ? '.webp' : path.extname(file.name) || '.webp';
    const filename = `corte-${timestamp}-${hash}${ext}`;

    // 1. Si está conectado Vercel Blob (Producción en Vercel)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`cortes/${filename}`, file, {
        access: 'public',
        contentType: file.type || 'image/webp',
        addRandomSuffix: false,
      });

      return NextResponse.json({
        success: true,
        url: blob.url,
        size: file.size,
        filename,
      });
    }

    // 2. Fallback para desarrollo local (localhost)
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });

      const filePath = path.join(uploadsDir, filename);
      await fs.writeFile(filePath, buffer);

      const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
      const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
      const publicUrl = `${protocol}://${host}/uploads/${filename}`;

      return NextResponse.json({
        success: true,
        url: publicUrl,
        relativePath: `/uploads/${filename}`,
        size: buffer.length,
        filename,
      });
    } catch (fsErr: any) {
      console.warn('Almacenamiento local no disponible:', fsErr.message);
      return NextResponse.json(
        {
          error:
            'No fue posible guardar la imagen. En producción (Vercel), asegúrate de tener conectado Vercel Blob (BLOB_READ_WRITE_TOKEN).',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error al procesar subida de imagen:', error);
    return NextResponse.json(
      { error: 'No fue posible guardar la imagen.', details: error.message },
      { status: 500 }
    );
  }
}
