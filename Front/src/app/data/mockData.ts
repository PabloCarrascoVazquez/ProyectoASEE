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

export const mockEvents: Event[] = [
  {
    id: '1',
    name: 'Subsonic Festival 2026 - Main Stage',
    date: '2026-07-15',
    image: 'https://images.unsplash.com/photo-1624929303661-22c5bce0169b?w=1080&q=80',
    description: 'La experiencia más electrizante del verano. 3 días de música electrónica sin parar con los mejores DJs del mundo.',
    artists: [
      { id: '1', name: 'Martin Garrix', genre: 'Progressive House', image: 'https://images.unsplash.com/photo-1624703307604-744ec383cbf4?w=400' },
      { id: '2', name: 'David Guetta', genre: 'EDM', image: 'https://images.unsplash.com/photo-1624703307604-744ec383cbf4?w=400' },
      { id: '3', name: 'Armin van Buuren', genre: 'Trance', image: 'https://images.unsplash.com/photo-1624703307604-744ec383cbf4?w=400' },
      { id: '4', name: 'Tiësto', genre: 'Big Room', image: 'https://images.unsplash.com/photo-1624703307604-744ec383cbf4?w=400' },
    ],
    services: ['Camping', 'Food & Drinks', 'VIP Lounge', 'Medical Services', 'Lockers', 'Shuttle Bus'],
    ticketPrices: [
      { id: 't1', type: 'General Admission', price: 199, description: 'Acceso completo a todas las áreas generales', features: ['Acceso 3 días', 'Todas las áreas generales', 'Pulsera conmemorativa'] },
      { id: 't2', type: 'VIP Pass', price: 399, description: 'Experiencia premium con áreas exclusivas', features: ['Acceso 3 días', 'Área VIP', 'Fast Track', 'Bebidas gratis', 'Meet & Greet'] },
      { id: 't3', type: 'Camping Package', price: 299, description: 'Entrada + zona de camping', features: ['Acceso 3 días', 'Camping spot', 'Duchas y baños', 'Zona de recarga'] },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1577045629710-8e0bd30c1a03?w=800',
      'https://images.unsplash.com/photo-1624929303661-22c5bce0169b?w=800',
      'https://images.unsplash.com/photo-1516037172336-512c4aa6b16a?w=800',
    ],
    mapImage: 'https://images.unsplash.com/photo-1516037172336-512c4aa6b16a?w=1200',
  },
  {
    id: '2',
    name: 'Subsonic Afterparty',
    date: '2026-07-18',
    image: 'https://images.unsplash.com/photo-1577045629710-8e0bd30c1a03?w=1080&q=80',
    description: 'La fiesta continúa con los mejores sets underground en un ambiente íntimo.',
    artists: [
      { id: '5', name: 'Charlotte de Witte', genre: 'Techno', image: 'https://images.unsplash.com/photo-1624703307604-744ec383cbf4?w=400' },
      { id: '6', name: 'Adam Beyer', genre: 'Techno', image: 'https://images.unsplash.com/photo-1624703307604-744ec383cbf4?w=400' },
    ],
    services: ['Food & Drinks', 'Cloakroom', 'Medical Services'],
    ticketPrices: [
      { id: 't4', type: 'Early Bird', price: 49, description: 'Precio especial para los primeros', features: ['Acceso completo', 'Drink voucher'] },
      { id: 't5', type: 'Regular', price: 69, description: 'Entrada estándar', features: ['Acceso completo'] },
    ],
    gallery: ['https://images.unsplash.com/photo-1577045629710-8e0bd30c1a03?w=800'],
    mapImage: 'https://images.unsplash.com/photo-1516037172336-512c4aa6b16a?w=1200',
  },
  {
    id: '3',
    name: 'Subsonic Sunrise Sessions',
    date: '2026-08-20',
    image: 'https://images.unsplash.com/photo-1516037172336-512c4aa6b16a?w=1080&q=80',
    description: 'Una conexión única con la música. Ritmos melódicos frente al mar para recibir al sol en una experiencia sensorial inolvidable.',
    artists: [
      { id: '7', name: 'Above & Beyond', genre: 'Trance', image: 'https://images.unsplash.com/photo-1624703307604-744ec383cbf4?w=400' },
    ],
    services: ['Beach Access', 'Food & Drinks', 'Sunset Lounge'],
    ticketPrices: [
      { id: 't6', type: 'Beach Pass', price: 89, description: 'Experiencia única al amanecer', features: ['Acceso playa', 'Sunset Lounge', 'Breakfast'] },
    ],
    gallery: [],
    mapImage: 'https://images.unsplash.com/photo-1516037172336-512c4aa6b16a?w=1200',
  },
];

export const mockMerchandise: MerchandiseItem[] = [
  { id: 'm1', name: 'Subsonic Festival T-Shirt', price: 35, image: 'https://images.unsplash.com/photo-1605329540493-6741250d2bee?w=400', category: 'clothing' },
  { id: 'm2', name: 'Neon Logo Hoodie', price: 65, image: 'https://images.unsplash.com/photo-1605329540493-6741250d2bee?w=400', category: 'clothing' },
  { id: 'm3', name: 'Festival Cap', price: 25, image: 'https://images.unsplash.com/photo-1605329540493-6741250d2bee?w=400', category: 'accessories' },
  { id: 'm4', name: 'LED Wristband', price: 15, image: 'https://images.unsplash.com/photo-1605329540493-6741250d2bee?w=400', category: 'accessories' },
  { id: 'm5', name: 'Poster Set 2026', price: 20, image: 'https://images.unsplash.com/photo-1605329540493-6741250d2bee?w=400', category: 'collectibles' },
  { id: 'm6', name: 'Festival Sunglasses', price: 30, image: 'https://images.unsplash.com/photo-1605329540493-6741250d2bee?w=400', category: 'accessories' },
];

export const mockVendorSpaces: VendorSpace[] = [
  {
    id: 's1',
    eventId: '1', // Vinculado a Subsonic Festival
    name: 'Main Food Court',
    type: 'food',
    size: 'Large',
    location: 'Main Area-Spot A',
    price: 5000,
    services: ['Electricity', 'Water', 'Waste Management', 'Storage'],
    image: 'https://images.unsplash.com/photo-1764449320916-ccfdb8aaef62?w=600',
    dimensions: '6m x 4m',
    available: true,
  },
  {
    id: 's2',
    eventId: '2', // Vinculado a Afterparty
    name: 'Premium Beverage Stand',
    type: 'beverage',
    size: 'Medium',
    location: 'VIP Zone-Stand B',
    price: 3500,
    services: ['Electricity', 'Water', 'Cooling System'],
    image: 'https://images.unsplash.com/photo-1764449320916-ccfdb8aaef62?w=600',
    dimensions: '4m x 3m',
    available: true,
  },
  {
    id: 's3',
    eventId: '2', // Vinculado a Afterparty
    name: 'Official Merchandise Booth',
    type: 'merchandise',
    size: 'Small',
    location: 'Entrance Plaza-Booth C',
    price: 2000,
    services: ['Electricity', 'Security'],
    image: 'https://images.unsplash.com/photo-1764449320916-ccfdb8aaef62?w=600',
    dimensions: '3m x 2m',
    available: true,
  },
  {
    id: 's4',
    eventId: '3', // Vinculado a Sunrise Sessions
    name: 'Gourmet Food Truck Spot',
    type: 'food',
    size: 'Extra Large',
    location: 'Camping Area',
    price: 6500,
    services: ['Electricity', 'Water', 'Waste Management', 'Storage', 'Wi-Fi'],
    image: 'https://images.unsplash.com/photo-1764449320916-ccfdb8aaef62?w=600',
    dimensions: '8m x 5m',
    available: false,
  },
];

export const mockFriends: Friend[] = [
  { id: 'f1', name: 'Ana García', position: { x: 45, y: 60 }, avatar: 'AG' },
  { id: 'f2', name: 'Carlos López', position: { x: 70, y: 40 }, avatar: 'CL' },
  { id: 'f3', name: 'María Rodríguez', position: { x: 30, y: 75 }, avatar: 'MR' },
  { id: 'f4', name: 'Juan Martínez', position: { x: 55, y: 30 }, avatar: 'JM' },
  { id: 'f5', name: 'Laura Sánchez', position: { x: 80, y: 65 }, avatar: 'LS' },
];