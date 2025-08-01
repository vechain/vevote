export function bytesToMB(byteSize: number) {
  return parseInt((byteSize / (1024 * 1024)).toFixed(2));
}

export function base64ToBlob(dataUrl?: string, type?: string): Blob {
  if (!dataUrl) throw new Error("Base64 url not found");
  let base64Content = dataUrl;
  if (type === "image/jpeg" || type === "image/jpg") {
    base64Content = dataUrl.substring("data:image/jpeg;base64,".length);
  } else if (type === "image/png") {
    base64Content = dataUrl.substring("data:image/png;base64,".length);
  } else if (type === "image/svg+xml") {
    base64Content = dataUrl.substring("data:image/svg+xml;base64,".length);
  } else {
    console.log("Invalid image type", type);
    return new Blob([], { type });
  }

  const binaryString = atob(base64Content);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([bytes], { type });
}
