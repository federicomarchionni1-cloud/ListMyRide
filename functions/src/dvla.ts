import axios from 'axios';

export interface DVLAVehicle {
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
  monthOfFirstRegistration?: string;
}

export async function lookupPlate(plate: string, apiKey: string): Promise<DVLAVehicle> {
  const normalised = plate.replace(/\s/g, '').toUpperCase();

  const response = await axios.post<DVLAVehicle>(
    'https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles',
    { registrationNumber: normalised },
    {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    }
  );

  return response.data;
}
