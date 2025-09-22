export interface GeocodingResult {
  street?: string;
  city?: string;
  province?: string;
  zipCode?: string;
  country?: string;
  formattedAddress?: string;
}

export interface NominatimResponse {
  address?: {
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
  display_name?: string;
}

export class GeocodingService {
  private static readonly BASE_URL = 'https://nominatim.openstreetmap.org/reverse';

  static async reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult> {
    try {
      // Add a small delay to respect Nominatim's usage policy
      await new Promise(resolve => setTimeout(resolve, 1000));

      const url = `${this.BASE_URL}?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`;

      console.log('[Geocoding] Making API request to:', url);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'GasFlow-LPG-Delivery-App/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
      }

      const data: NominatimResponse = await response.json();

      if (!data || !data.address) {
        throw new Error('No address found for these coordinates');
      }

      const address = data.address;

      // Extract address components
      const street = this.buildStreetAddress(address);
      const city = address.city || address.town || address.village || '';
      const province = address.state || address.province || '';
      const zipCode = address.postcode || '';
      const country = address.country || '';

      const geocodingResult: GeocodingResult = {
        street,
        city,
        province,
        zipCode,
        country,
        formattedAddress: data.display_name
      };

      console.log('[Geocoding] Successfully parsed address:', geocodingResult);

      return geocodingResult;
    } catch (error) {
      console.error('[Geocoding] Error:', error);

      // For Philippines, provide fallback address components based on coordinates
      if (latitude >= 4.5 && latitude <= 21.5 && longitude >= 116 && longitude <= 127) {
        console.log('[Geocoding] Using fallback for Philippines coordinates');
        return {
          street: '',
          city: 'Manila', // Default fallback
          province: 'Metro Manila',
          zipCode: '',
          country: 'Philippines',
          formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)} (Philippines)`
        };
      }

      throw error;
    }
  }

  private static buildStreetAddress(address: NominatimResponse['address']): string {
    if (!address) return '';

    const parts: string[] = [];

    // Add house number and road
    if (address.house_number) {
      parts.push(address.house_number);
    }
    if (address.road) {
      parts.push(address.road);
    }

    // Add neighbourhood/suburb if available and different from road
    if (address.neighbourhood && address.neighbourhood !== address.road) {
      parts.push(address.neighbourhood);
    }
    if (address.suburb && address.suburb !== address.neighbourhood && address.suburb !== address.road) {
      parts.push(address.suburb);
    }

    return parts.join(', ');
  }
}