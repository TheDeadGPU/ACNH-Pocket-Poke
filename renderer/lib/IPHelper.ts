export class InvalidIPError extends Error {
  constructor(public readonly input: string, message = "Invalid IP address entered") {
    super(message);
    this.name = "InvalidIPError";
    // Keeps `instanceof` working if your tsconfig targets ES5
    Object.setPrototypeOf(this, InvalidIPError.prototype);
  }
}

export function isValidIPv4(input: string): boolean {
  const parts = input.split(".");
  if (parts.length !== 4) return false;
 
  return parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) return false;
    if (part.length > 1 && part.startsWith("0")) return false; // no leading zeros
    return Number(part) <= 255;
  });
}