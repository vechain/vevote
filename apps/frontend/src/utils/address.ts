export const formatAddress = (address: string) => {
  return `${address.slice(0, 4)}...${address.slice(-6)}`;
};

export const leftPadWithZeros = (str: string, length: number): string => {
  // Remove '0x' prefix if it exists
  const cleanStr = str.startsWith("0x") ? str.slice(2) : str;
  if (cleanStr.length > length) {
    throw new Error("Input string is longer than the specified length");
  }
  // Pad the string to the specified length
  const paddedStr = cleanStr.padStart(length, "0");
  return `0x${paddedStr}`;
};
