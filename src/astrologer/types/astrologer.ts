export interface Astrologer {
  id: number;

  // backend / database fields (optional)
  _id?: number;
  specialty?: string;
  rate?: string;

  // UI fields
  name: string;
  skills: string;
  languages: string;
  experience: string;
  price: string;
  orders: number;
  image: string;
}
