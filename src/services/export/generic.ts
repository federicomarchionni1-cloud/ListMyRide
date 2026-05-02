import { Listing, PlatformExport } from '@/types/listing';

export function formatGenericListing(listing: Listing): PlatformExport {
  const price = listing.listing.userPriceGBP ?? listing.listing.suggestedPriceGBP;

  const description = [
    listing.listing.description,
    '',
    '--- Specifications ---',
    `Make: ${listing.vehicle.make}`,
    `Model: ${listing.listing.specs?.model ?? 'See description'}`,
    `Year: ${listing.vehicle.yearOfManufacture}`,
    `Engine: ${listing.vehicle.engineCapacity}cc ${listing.vehicle.fuelType}`,
    `Colour: ${listing.vehicle.colour}`,
    listing.listing.mileage
      ? `Mileage: ${listing.listing.mileage.toLocaleString('en-GB')} miles`
      : '',
    `MOT Expiry: ${listing.vehicle.motExpiryDate}`,
    `Tax Status: ${listing.vehicle.taxStatus}`,
    `Registration: ${listing.plate}`,
    '',
    '--- Condition ---',
    `Overall: ${listing.condition.conditionLabel} (${listing.condition.conditionScore}/10)`,
    ...listing.condition.conditionNotes.map((n) => `• ${n}`),
    '',
    `Asking Price: £${price.toLocaleString('en-GB')}`,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    platform: 'generic',
    title: listing.listing.title,
    description,
    price,
  };
}
