export interface Event {
  id: string;
  name: string;
  date: string;
  image: string;
  description: string;
  artists: Artist[];
  services: string[];
  ticketPrices: TicketPrice[];
  gallery: string[];
  mapImage: string;
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
  image: string;
  spotifyUrl?: string;
}

export interface TicketPrice {
  id: string;
  type: string;
  price: number;
  description: string;
  features: string[];
}

export interface MerchandiseItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

// Actualizamos la interfaz para incluir eventId
export interface VendorSpace {
  id: string;
  eventId: string; // Relación obligatoria con Event.id
  name: string;
  type: string;
  size: string;
  location: string;
  price: number;
  services: string[];
  image: string;
  dimensions: string;
  available: boolean;
}

export interface Friend {
  id: string;
  name: string;
  position: { x: number; y: number };
  avatar: string;
}
