self.addEventListener('message', async (e) => {
  const { file, maxWidth, maxHeight, id } = e.data;
  
  try {
    // Read file as data URL
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    
    // Create image bitmap for processing
    const blob = await fetch(dataUrl).then(r => r.blob());
    const imageBitmap = await createImageBitmap(blob);
    
    // Calculate new dimensions
    let width = imageBitmap.width;
    let height = imageBitmap.height;
    
    if (width > height) {
      if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      }
    } else {
      if (height > maxHeight) {
        width *= maxHeight / height;
        height = maxHeight;
      }
    }
    
    // Draw resized image on canvas
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(imageBitmap, 0, 0, width, height);
    
    // Convert to blob then to data URL
    const resizedBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.7 });
    const resizedReader = new FileReader();
    const resizedDataUrl = await new Promise<string>((resolve, reject) => {
      resizedReader.onload = (e) => resolve(e.target?.result as string);
      resizedReader.onerror = reject;
      resizedReader.readAsDataURL(resizedBlob);
    });
    
    self.postMessage({ id, dataUrl: resizedDataUrl, success: true });
  } catch (error) {
    self.postMessage({ id, error: error.message, success: false });
  }
});

export {};