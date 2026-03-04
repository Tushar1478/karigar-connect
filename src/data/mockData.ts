export interface Karigar {
  id: string;
  name: string;
  email: string;
  phone: string;
  skill: string;
  experience: number;
  location: string;
  price: number;
  description: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  photo: string;
  distance?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  karigarId: string;
  karigarName: string;
  skill: string;
  date: string;
  time: string;
  status: 'pending' | 'accepted' | 'completed' | 'rejected';
  description?: string;
  rating?: number;
  review?: string;
}

export interface Review {
  id: string;
  customerId: string;
  customerName: string;
  karigarId: string;
  rating: number;
  text: string;
  date: string;
}

export type ServiceCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export const serviceCategories: ServiceCategory[] = [
  { id: 'electrician', name: 'Electrician', icon: 'Zap', color: 'hsl(45 93% 47%)' },
  { id: 'plumber', name: 'Plumber', icon: 'Droplets', color: 'hsl(217 91% 60%)' },
  { id: 'carpenter', name: 'Carpenter', icon: 'Hammer', color: 'hsl(25 75% 47%)' },
  { id: 'ac-repair', name: 'AC Repair', icon: 'Wind', color: 'hsl(195 80% 50%)' },
  { id: 'mason', name: 'Mason', icon: 'Brick', color: 'hsl(15 60% 50%)' },
  { id: 'painter', name: 'Painter', icon: 'Paintbrush', color: 'hsl(280 60% 55%)' },
  { id: 'cleaning', name: 'Cleaning', icon: 'SparklesIcon', color: 'hsl(142 71% 45%)' },
  { id: 'appliance-repair', name: 'Appliance Repair', icon: 'Wrench', color: 'hsl(0 70% 55%)' },
];

export const mockKarigars: Karigar[] = [
  {
    id: 'k1',
    name: 'Ramesh Kumar',
    email: 'ramesh@example.com',
    phone: '+91 98765 43210',
    skill: 'Electrician',
    experience: 5,
    location: 'Sector 18, Noida',
    price: 300,
    description: 'Expert electrician with 5 years of experience in residential and commercial wiring, switchboard installation, and fault diagnosis.',
    rating: 4.8,
    reviewCount: 127,
    completedJobs: 245,
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
    distance: '1.2 km',
  },
  {
    id: 'k2',
    name: 'Imran Khan',
    email: 'imran@example.com',
    phone: '+91 98765 43211',
    skill: 'AC Repair',
    experience: 6,
    location: 'Connaught Place, Delhi',
    price: 400,
    description: 'Certified AC technician specializing in split AC, window AC, and central air conditioning repair and servicing.',
    rating: 4.9,
    reviewCount: 198,
    completedJobs: 312,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    distance: '2.5 km',
  },
  {
    id: 'k3',
    name: 'Suresh Patel',
    email: 'suresh@example.com',
    phone: '+91 98765 43212',
    skill: 'Plumber',
    experience: 4,
    location: 'Laxmi Nagar, Delhi',
    price: 250,
    description: 'Reliable plumber handling all types of plumbing work including leak repair, pipe fitting, and bathroom installations.',
    rating: 4.7,
    reviewCount: 89,
    completedJobs: 178,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    distance: '3.1 km',
  },
  {
    id: 'k4',
    name: 'Ajay Sharma',
    email: 'ajay@example.com',
    phone: '+91 98765 43213',
    skill: 'Carpenter',
    experience: 7,
    location: 'Dwarka, Delhi',
    price: 350,
    description: 'Skilled carpenter specializing in furniture making, door/window fitting, and modular kitchen installation.',
    rating: 4.6,
    reviewCount: 156,
    completedJobs: 289,
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    distance: '4.0 km',
  },
  {
    id: 'k5',
    name: 'Vikram Singh',
    email: 'vikram@example.com',
    phone: '+91 98765 43214',
    skill: 'Painter',
    experience: 8,
    location: 'Rohini, Delhi',
    price: 500,
    description: 'Professional painter with expertise in interior and exterior painting, wall textures, and waterproofing.',
    rating: 4.5,
    reviewCount: 73,
    completedJobs: 134,
    photo: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&h=200&fit=crop&crop=face',
    distance: '5.2 km',
  },
  {
    id: 'k6',
    name: 'Manoj Verma',
    email: 'manoj@example.com',
    phone: '+91 98765 43215',
    skill: 'Mason',
    experience: 10,
    location: 'Gurgaon',
    price: 450,
    description: 'Experienced mason for all construction work including brick laying, plastering, and tiling.',
    rating: 4.8,
    reviewCount: 201,
    completedJobs: 350,
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face',
    distance: '6.0 km',
  },
];

export const mockReviews: Review[] = [
  { id: 'r1', customerId: 'c1', customerName: 'Priya Mehta', karigarId: 'k1', rating: 5, text: 'Excellent work! Fixed all electrical issues in one visit. Very professional.', date: '2026-02-15' },
  { id: 'r2', customerId: 'c2', customerName: 'Rahul Gupta', karigarId: 'k1', rating: 4, text: 'Good work, arrived on time. Slightly expensive but worth it.', date: '2026-02-20' },
  { id: 'r3', customerId: 'c3', customerName: 'Anita Joshi', karigarId: 'k2', rating: 5, text: 'AC is working perfectly now. Very knowledgeable technician!', date: '2026-02-18' },
  { id: 'r4', customerId: 'c1', customerName: 'Priya Mehta', karigarId: 'k3', rating: 5, text: 'Fixed the leaking pipe quickly. Very neat work.', date: '2026-01-25' },
  { id: 'r5', customerId: 'c4', customerName: 'Sanjay Rao', karigarId: 'k4', rating: 4, text: 'Beautiful carpentry work. Took a bit longer than expected.', date: '2026-02-10' },
];
