export function bytesToMB(byteSize: number) {
  return parseInt((byteSize / (1024 * 1024)).toFixed(2));
}
