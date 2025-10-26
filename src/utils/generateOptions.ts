// utils/generateOptions.ts
export const generateOptions = (
    count: number,
    offset: number = 0,
    pad: boolean = false
  ): string[] => {
    return Array.from({ length: count }, (_, i) => {
      const value = offset ? String(offset - i) : String(i + 1);
      return pad ? value.padStart(2, '0') : value;
    });
  };
  