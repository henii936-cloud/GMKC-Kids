/**
 * Compresses an image file and converts it to WebP format on the client side.
 * 
 * @param file The input File object (e.g. from file input)
 * @param maxWidth The maximum width of the output image (aspect ratio maintained)
 * @param maxHeight The maximum height of the output image (aspect ratio maintained)
 * @param quality The compression quality from 0.0 to 1.0
 * @returns A Promise resolving to the compressed WebP File object
 */
export const compressAndConvertToWebP = (
  file: File,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.8
): Promise<File> => {
  return new Promise((resolve) => {
    // If the file is not an image, resolve with the original file
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
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

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file); // fallback to original file
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            // Create a new File object with .webp extension
            const originalName = file.name;
            const baseName = originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
            const newFile = new File([blob], `${baseName}.webp`, {
              type: "image/webp",
              lastModified: Date.now(),
            });
            resolve(newFile);
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};
