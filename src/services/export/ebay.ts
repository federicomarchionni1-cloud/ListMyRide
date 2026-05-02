import { Listing, PlatformExport } from '@/types/listing';

export function formatEbayListing(listing: Listing): PlatformExport {
  const price = listing.listing.userPriceGBP ?? listing.listing.suggestedPriceGBP;
  const title = listing.listing.title.substring(0, 80);

  const specs = [
    `Make: ${listing.vehicle.make}`,
    `Model: ${listing.listing.specs?.model ?? 'See description'}`,
    `Year: ${listing.vehicle.yearOfManufacture}`,
    `Mileage: ${listing.listing.mileage ? `${listing.listing.mileage.toLocaleString('en-GB')} miles` : 'Not specified'}`,
    `Fuel Type: ${listing.vehicle.fuelType}`,
    `Engine Size: ${listing.vehicle.engineCapacity}cc`,
    `Colour: ${listing.vehicle.colour}`,
    `MOT Expiry: ${listing.vehicle.motExpiryDate}`,
    `Tax Status: ${listing.vehicle.taxStatus}`,
    `Condition: ${listing.condition.conditionLabel}`,
  ].join('\n');

  const description = [
    listing.listing.description,
    '',
    '--- VEHICLE SPECIFICATIONS ---',
    specs,
    '',
    '--- CONDITION NOTES ---',
    ...listing.condition.conditionNotes.map((n) => `• ${n}`),
  ]
    .join('\n')
    .substring(0, 4000);

  return {
    platform: 'ebay',
    title,
    description,
    price,
    metadata: { categoryId: listing.listing.ebayCategory ?? '9801' },
  };
}
