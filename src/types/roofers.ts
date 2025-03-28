export interface Roofer {
  businessName: string;
  logo: string;
  location: string;
  services: string[];
  coverage: string[];
  website: string;
  postcode: string;
}

export interface ComingSoonLocation {
  postcode: string;
  city: string;
}

export interface RooferData {
  roofers: Roofer[];
  comingSoonLocations: ComingSoonLocation[];
} 