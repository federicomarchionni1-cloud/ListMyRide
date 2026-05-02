import { Listing, PlatformExport } from '@/types/listing';

export function formatAutotraderListing(listing: Listing): PlatformExport {
  const price = listing.listing.userPriceGBP ?? listing.listing.suggestedPriceGBP;
  const title =
    `${listing.vehicle.yearOfManufacture} ${listing.vehicle.make} ${listing.listing.specs?.model ?? ''}`.substring(
      0,
      50
    );

  const description = [
    listing.listing.description,
    '',
    `Registration: ${listing.plate}`,
    `Mileage: ${listing.listing.mileage ? `${listing.listing.mileage.toLocaleString('en-GB')} miles` : 'Not specified'}`,
    `MOT until: ${listing.vehicle.motExpiryDate}`,
    `Tax: ${listing.vehicle.taxStatus}`,
  ]
    .join('\n')
    .substring(0, 2000);

  return { platform: 'autotrader', title, description, price };
}
