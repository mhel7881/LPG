export interface GeocodingResult {
  street?: string;
  city?: string;
  province?: string;
  zipCode?: string;
  country?: string;
  formattedAddress?: string;
}

export interface OpenCageResponse {
  results: Array<{
    components: {
      house_number?: string;
      road?: string;
      neighbourhood?: string;
      suburb?: string;
      city?: string;
      town?: string;
      village?: string;
      state?: string;
      province?: string;
      postcode?: string;
      country?: string;
      country_code?: string;
    };
    formatted: string;
  }>;
}

export class GeocodingService {
  private static readonly API_KEY = '42be5bc02adf415dbda2c79a71ff57e5';
  private static readonly BASE_URL = 'https://api.opencagedata.com/geocode/v1/json';

  static async reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult> {
    try {
      const url = `${this.BASE_URL}?key=${this.API_KEY}&q=${latitude}%2C+${longitude}&pretty=1&no_annotations=1`;

      console.log('[Geocoding] Making API request to:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
      }

      const data: OpenCageResponse = await response.json();

      if (!data.results || data.results.length === 0) {
        throw new Error('No address found for these coordinates');
      }

      const result = data.results[0];
      const components = result.components;

      // Extract address components
      const street = this.buildStreetAddress(components);
      const city = components.city || components.town || components.village || '';
      const province = components.state || components.province || '';
      const zipCode = components.postcode || '';
      const country = components.country || '';

      const geocodingResult: GeocodingResult = {
        street,
        city,
        province,
        zipCode,
        country,
        formattedAddress: result.formatted
      };

      console.log('[Geocoding] Successfully parsed address:', geocodingResult);

      return geocodingResult;
    } catch (error) {
      console.error('[Geocoding] Error:', error);
      throw error;
    }
  }

  private static buildStreetAddress(components: OpenCageResponse['results'][0]['components']): string {
    const parts: string[] = [];

    // Add house number and road
    if (components.house_number) {
      parts.push(components.house_number);
    }
    if (components.road) {
      parts.push(components.road);
    }

    // Add neighbourhood/suburb if available and different from road
    if (components.neighbourhood && components.neighbourhood !== components.road) {
      parts.push(components.neighbourhood);
    }
    if (components.suburb && components.suburb !== components.neighbourhood && components.suburb !== components.road) {
      parts.push(components.suburb);
    }

    return parts.join(', ');
  }
}