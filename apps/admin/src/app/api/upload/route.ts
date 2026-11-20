import { NextRequest, NextResponse } from 'next/server';
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generar nombre seguro único
    const hash = crypto.randomBytes(6).toString('hex');
    const timestamp = Date.now();
    const ext = file.name.endsWith('.webp') ? '.webp' : path.extname(file.name) || '.webp';
    const filename = `corte-${timestamp}-${hash}${ext}`;

    // Directorio de almacenamiento estático público
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, filename);
    await fs.writeFile(filePath, buffer);

    // Determinar URL pública absoluta
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
  } catch (error: any) {
    console.error('Error al guardar imagen en servidor:', error);
    return NextResponse.json(
      { error: 'No fue posible guardar la imagen en el servidor.', details: error.message },
      { status: 500 }
    );
  }
}
