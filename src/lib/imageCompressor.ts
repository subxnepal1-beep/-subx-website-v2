/**
 * Helper to compress and optimize images before uploading or storing
 * Reduces multi-megabyte images down to ultra-fast 30-80KB assets
 */
export async function compressImage(
  fileOrDataUrl: File | string,
  maxWidth = 600,
  maxHeight = 600,
  quality = 0.82
): Promise<{ file: File; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(width, 1);
      canvas.height = Math.max(height, 1);
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        if (typeof fileOrDataUrl === 'string') {
          const fallbackFile = dataUrlToFile(fileOrDataUrl, 'image.webp');
          resolve({ file: fallbackFile, dataUrl: fileOrDataUrl });
        } else {
          const reader = new FileReader();
          reader.onload = (e) => resolve({ file: fileOrDataUrl, dataUrl: e.target?.result as string });
          reader.onerror = reject;
          reader.readAsDataURL(fileOrDataUrl);
        }
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = 'image/webp';
      const compressedDataUrl = canvas.toDataURL(mimeType, quality);
      
      const fileName = typeof fileOrDataUrl === 'object' && fileOrDataUrl.name 
        ? fileOrDataUrl.name.replace(/\.[^/.]+$/, '') + '.webp'
        : 'optimized-image.webp';

      const compressedFile = dataUrlToFile(compressedDataUrl, fileName);
      resolve({ file: compressedFile, dataUrl: compressedDataUrl });
    };

    img.onerror = () => {
      // If image loading fails, fallback safely
      if (typeof fileOrDataUrl === 'string') {
        resolve({ file: dataUrlToFile(fileOrDataUrl, 'fallback.png'), dataUrl: fileOrDataUrl });
      } else {
        const reader = new FileReader();
        reader.onload = (e) => resolve({ file: fileOrDataUrl, dataUrl: e.target?.result as string });
        reader.onerror = reject;
        reader.readAsDataURL(fileOrDataUrl);
      }
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}

function dataUrlToFile(dataUrl: string, fileName: string): File {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/webp';
  const bstr = atob(arr[1] || '');
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], fileName, { type: mime });
}
