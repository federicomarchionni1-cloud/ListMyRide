import * as Clipboard from 'expo-clipboard';
import { Share } from 'react-native';
import { Listing, Platform } from '@/types/listing';
import { formatEbayListing } from '@/services/export/ebay';
import { formatFacebookListing } from '@/services/export/facebook';
import { formatAutotraderListing } from '@/services/export/autotrader';
import { formatGenericListing } from '@/services/export/generic';
import { markExported } from '@/services/firebase/firestore';

function getFormatter(platform: Platform) {
  switch (platform) {
    case 'ebay':
      return formatEbayListing;
    case 'facebook':
      return formatFacebookListing;
    case 'autotrader':
      return formatAutotraderListing;
    default:
      return formatGenericListing;
  }
}

export function useListingExport(listing: Listing) {
  async function copyToClipboard(platform: Platform): Promise<void> {
    const formatter = getFormatter(platform);
    const exported = formatter(listing);
    const text = `${exported.title}\n\n${exported.description}\n\nAsking price: £${exported.price.toLocaleString('en-GB')}`;
    await Clipboard.setStringAsync(text);
    await markExported(listing.id, platform);
  }

  async function shareText(platform: Platform): Promise<void> {
    const formatter = getFormatter(platform);
    const exported = formatter(listing);
    const text = `${exported.title}\n\n${exported.description}\n\nAsking price: £${exported.price.toLocaleString('en-GB')}`;
    await Share.share({ message: text, title: exported.title });
    await markExported(listing.id, platform);
  }

  return { copyToClipboard, shareText };
}
