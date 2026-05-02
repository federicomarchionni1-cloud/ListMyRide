import { Platform } from '@/types/listing';

export interface PlatformConfig {
  id: Platform;
  label: string;
  titleMaxChars: number;
  descriptionMaxChars: number;
  requiresMileage: boolean;
  requiresPlate: boolean;
  color: string;
}

export const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    id: 'ebay',
    label: 'eBay Motors',
    titleMaxChars: 80,
    descriptionMaxChars: 4000,
    requiresMileage: false,
    requiresPlate: false,
    color: '#E53238',
  },
  {
    id: 'facebook',
    label: 'Facebook Marketplace',
    titleMaxChars: 100,
    descriptionMaxChars: 2000,
    requiresMileage: false,
    requiresPlate: false,
    color: '#1877F2',
  },
  {
    id: 'autotrader',
    label: 'Autotrader',
    titleMaxChars: 50,
    descriptionMaxChars: 2000,
    requiresMileage: true,
    requiresPlate: true,
    color: '#F07020',
  },
  {
    id: 'gumtree',
    label: 'Gumtree',
    titleMaxChars: 75,
    descriptionMaxChars: 3000,
    requiresMileage: false,
    requiresPlate: false,
    color: '#72BF44',
  },
  {
    id: 'generic',
    label: 'Generic (Copy All)',
    titleMaxChars: 9999,
    descriptionMaxChars: 9999,
    requiresMileage: false,
    requiresPlate: false,
    color: '#6B7280',
  },
];
