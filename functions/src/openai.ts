import OpenAI from 'openai';
import { DVLAVehicle } from './dvla';

export interface ConditionResult {
  conditionScore: number;
  conditionLabel: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  conditionNotes: string[];
  damageSummary: string;
  bodyColourConsistency: string;
  interiorCondition: string;
  tyreCondition: string;
  estimatedAge: string;
}

export interface ListingResult {
  title: string;
  description: string;
  suggestedPriceGBP: number;
  priceRationale: string;
  keySellingPoints: string[];
  specs: {
    make: string;
    model: string;
    year: number;
    engineCC: number;
    fuelType: string;
    colour: string;
    mileage: number | null;
    motExpiry: string;
    taxStatus: string;
  };
  tags: string[];
  ebayCategory: string;
}

const CONDITION_SYSTEM_PROMPT = `You are an expert UK used vehicle appraiser with 20 years of experience at auctions and dealerships. \
You assess vehicle condition strictly and honestly. You will be shown photos of a vehicle and must return a JSON object describing its condition. \
Your assessment will be used to generate a private sale listing, so accuracy matters. \
Do not be overly generous — UK buyers expect honest descriptions.`;

const CONDITION_USER_PROMPT = `Please examine these vehicle photos carefully and return a JSON object with this exact schema:

{
  "conditionScore": <integer 1-10, where 10 is showroom perfect and 1 is unroadworthy>,
  "conditionLabel": <"Excellent" | "Good" | "Fair" | "Poor">,
  "conditionNotes": [<array of specific observations, max 8 items, e.g. "Light kerbing on front-left alloy">],
  "damageSummary": <one sentence plain English summary for a listing description>,
  "bodyColourConsistency": <"consistent" | "minor variation" | "mismatched panels">,
  "interiorCondition": <"Excellent" | "Good" | "Fair" | "Poor" | "not visible">,
  "tyreCondition": <"Good" | "Worn" | "Requires replacement" | "not visible">,
  "estimatedAge": <"matches stated year" | "appears older" | "appears newer" | "cannot tell">
}

Be specific in conditionNotes. Note panel dents, scratches, rust, cracked glass, worn upholstery, warning lights visible on dashboard, etc.
If photos are insufficient to assess something, say "not visible" for that field.`;

const LISTING_SYSTEM_PROMPT = `You are an expert UK vehicle listing copywriter who creates compelling, honest private sale adverts for eBay Motors, Facebook Marketplace, and Autotrader. \
You write in clear British English. You know UK market prices from AutoTrader, What Car, and Glass's Guide. \
You never exaggerate condition. You highlight genuine selling points.`;

function buildListingPrompt(
  vehicle: DVLAVehicle,
  condition: ConditionResult,
  mileage?: number
): string {
  return `Create a vehicle listing for the following. Return a JSON object with the exact schema below.

VEHICLE DATA (from DVLA):
- Make: ${vehicle.make}
- Year of manufacture: ${vehicle.yearOfManufacture}
- Engine capacity: ${vehicle.engineCapacity}cc
- Fuel type: ${vehicle.fuelType}
- Body colour: ${vehicle.colour}
- Tax status: ${vehicle.taxStatus}
- MOT status: ${vehicle.motStatus}${vehicle.motExpiryDate ? `, expires: ${vehicle.motExpiryDate}` : ''}

CONDITION ASSESSMENT:
- Overall score: ${condition.conditionScore}/10 (${condition.conditionLabel})
- Notes: ${condition.conditionNotes.join('; ')}
- Damage summary: ${condition.damageSummary}
- Interior: ${condition.interiorCondition}
- Tyres: ${condition.tyreCondition}

USER-PROVIDED INFO:
- Mileage: ${mileage ? `${mileage.toLocaleString('en-GB')} miles` : 'not provided'}

Return this exact JSON schema:
{
  "title": <max 80 chars, format: "YEAR MAKE MODEL ENGINE FUEL - CONDITION HIGHLIGHTS">,
  "description": <400-600 words, British English, honest and compelling, include key features, MOT status, condition details, viewing welcome>,
  "suggestedPriceGBP": <integer, realistic UK private sale price based on current market, accounting for age/condition/mileage/fuel type. Private sale price, not trade.>,
  "priceRationale": <1-2 sentences explaining how you arrived at this price>,
  "keySellingPoints": [<array of 3-5 bullet points, max 10 words each>],
  "specs": {
    "make": "string",
    "model": <infer from make, year, engine, fuel>,
    "year": <number>,
    "engineCC": <number>,
    "fuelType": "string",
    "colour": "string",
    "mileage": <number or null>,
    "motExpiry": "string",
    "taxStatus": "string"
  },
  "tags": [<array of 5-8 search tags relevant to this vehicle>],
  "ebayCategory": <eBay Motors UK category number as string, e.g. "9801" for cars>
}`;
}

export async function analyseCondition(
  photoUrls: string[],
  openaiApiKey: string
): Promise<ConditionResult> {
  const client = new OpenAI({ apiKey: openaiApiKey });

  const imageContent = photoUrls.map((url) => ({
    type: 'image_url' as const,
    image_url: { url, detail: 'high' as const },
  }));

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    max_tokens: 1000,
    messages: [
      { role: 'system', content: CONDITION_SYSTEM_PROMPT },
      {
        role: 'user',
        content: [{ type: 'text', text: CONDITION_USER_PROMPT }, ...imageContent],
      },
    ],
  });

  const raw = response.choices[0].message.content;
  if (!raw) throw new Error('Empty response from condition analysis');
  return JSON.parse(raw) as ConditionResult;
}

export async function generateListing(
  vehicle: DVLAVehicle,
  condition: ConditionResult,
  openaiApiKey: string,
  mileage?: number
): Promise<ListingResult> {
  const client = new OpenAI({ apiKey: openaiApiKey });

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    max_tokens: 2000,
    messages: [
      { role: 'system', content: LISTING_SYSTEM_PROMPT },
      { role: 'user', content: buildListingPrompt(vehicle, condition, mileage) },
    ],
  });

  const raw = response.choices[0].message.content;
  if (!raw) throw new Error('Empty response from listing generation');
  return JSON.parse(raw) as ListingResult;
}
