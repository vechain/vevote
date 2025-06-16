export function bytesToMB(byteSize: number) {
  return parseInt((byteSize / (1024 * 1024)).toFixed(2));
}

export function base64ToBlob(dataUrl?: string, type?: string): Blob {
  if (!dataUrl) throw new Error("Base64 url not found");
  const base64Content = dataUrl.substring("data:image/png;base64,".length);

  const binaryString = atob(base64Content);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([bytes], { type });
}
