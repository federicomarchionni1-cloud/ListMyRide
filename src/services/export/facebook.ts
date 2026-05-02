import { Listing, PlatformExport } from '@/types/listing';

export function formatFacebookListing(listing: Listing): PlatformExport {
  const price = listing.listing.userPriceGBP ?? listing.listing.suggestedPriceGBP;
  const title =
    `${listing.vehicle.yearOfManufacture} ${listing.vehicle.make} ${listing.listing.specs?.model ?? ''}`.substring(
      0,
      100
    );

  const description = [
    `£${price.toLocaleString('en-GB')} ONO`,
    `📍 [Add your location]`,
    '',
    listing.listing.description,
    '',
    '--- Key Details ---',
    `Year: ${listing.vehicle.yearOfManufacture}`,
    `Mileage: ${listing.listing.mileage ? `${listing.listing.mileage.toLocaleString('en-GB')} miles` : 'TBC'}`,
    `Fuel: ${listing.vehicle.fuelType}`,
    `Engine: ${listing.vehicle.engineCapacity}cc`,
    `Colour: ${listing.vehicle.colour}`,
    `MOT until: ${listing.vehicle.motExpiryDate}`,
    `Condition: ${listing.condition.conditionLabel}`,
    '',
    'DM for more info or to arrange a viewing. No time wasters please.',
  ]
    .join('\n')
    .substring(0, 2000);

  return { platform: 'facebook', title, description, price };
}
