export interface DVLAResponse {
  registrationNumber: string;
  taxStatus: string;
  taxDueDate?: string;
  motStatus: string;
  motExpiryDate?: string;
  make: string;
  yearOfManufacture: number;
  engineCapacity: number;
  co2Emissions?: number;
  fuelType: string;
  markedForExport?: boolean;
  colour: string;
  typeApproval?: string;
  wheelplan?: string;
  monthOfFirstRegistration?: string;
}

export interface VehicleData {
  make: string;
  colour: string;
  fuelType: string;
  yearOfManufacture: number;
  engineCapacity: number;
  taxStatus: string;
  motStatus: string;
  motExpiryDate: string;
  registrationNumber: string;
  monthOfFirstRegistration?: string;
}

export interface ConditionResult {
  conditionScore: number;
  conditionLabel: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  conditionNotes: string[];
  damageSummary: string;
  bodyColourConsistency: string;
  interiorCondition: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'not visible';
  tyreCondition: 'Good' | 'Worn' | 'Requires replacement' | 'not visible';
  estimatedAge: string;
}
