/**
 * Utilidad de optimización y compresión inteligente de imágenes en el cliente.
 * 
 * Reduce fotos de smartphones (4MB - 15MB) a ~30KB - 50KB en formato WebP de alta fidelidad,
 * evitando saturar la base de datos o el ancho de banda, con calidad visual nítida para Retina displays.
 */

export interface OptimizedImageResult {
  file: File;
  dataUrl: string;
  originalSize: number;
  optimizedSize: number;
  width: number;
  height: number;
  savingsPercent: number;
  mimeType: string;
}

export async function optimizeImage(
  file: File,
  maxWidth = 900,
  maxHeight = 900,
  quality = 0.82
): Promise<OptimizedImageResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo seleccionado no es una imagen válida.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calcular dimensiones preservando relación de aspecto
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Crear canvas para procesamiento de alta fidelidad
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo inicializar el procesador de imágenes en el navegador.'));
          return;
        }

        // Algoritmo de suavizado bicúbico
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Detectar si el navegador soporta WebP
        const testWebp = canvas.toDataURL('image/webp');
        const isWebpSupported = testWebp.startsWith('data:image/webp');
        const targetMime = isWebpSupported ? 'image/webp' : 'image/jpeg';
        const extension = isWebpSupported ? '.webp' : '.jpg';

        const dataUrl = canvas.toDataURL(targetMime, quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Error al comprimir la imagen.'));
              return;
            }

            const cleanName = file.name
              .replace(/\.[^/.]+$/, '')
              .replace(/[^a-zA-Z0-9_-]/g, '_');

            const optimizedFile = new File([blob], `${cleanName}${extension}`, {
              type: targetMime,
              lastModified: Date.now(),
            });

            const savingsPercent = Math.max(
              0,
              Math.round(((file.size - blob.size) / file.size) * 100)
            );

            resolve({
              file: optimizedFile,
              dataUrl,
              originalSize: file.size,
              optimizedSize: blob.size,
              width,
              height,
              savingsPercent,
              mimeType: targetMime,
            });
          },
          targetMime,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('No se pudo decodificar la imagen seleccionada.'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo desde el dispositivo.'));
    };

    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
