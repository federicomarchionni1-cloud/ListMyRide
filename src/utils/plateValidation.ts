// Covers UK plate formats: current (AB12 ABC), prefix, suffix, dateless
const UK_PLATE_REGEX =
  /^[A-Z]{2}[0-9]{2}[A-Z]{3}$|^[A-Z][0-9]{1,3}[A-Z]{3}$|^[A-Z]{3}[0-9]{1,3}[A-Z]$|^[A-Z]{2}[0-9]{2}[A-Z]{3}$/i;

export function isValidUKPlate(plate: string): boolean {
  const cleaned = plate.replace(/\s/g, '').toUpperCase();
  return UK_PLATE_REGEX.test(cleaned);
}

export function normalisePlate(plate: string): string {
  return plate.replace(/\s/g, '').toUpperCase();
}
