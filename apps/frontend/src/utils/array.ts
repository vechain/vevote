export const isArraysEqual = (array1: unknown[], array2: unknown[]) => {
  return JSON.stringify(array1) === JSON.stringify(array2);
};
