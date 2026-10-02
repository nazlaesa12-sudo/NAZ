export interface Ship {
  id: string;
  name: string;
  code: string;
  type: string;
  captain: string;
  maxPassengers: number;
  maxCargoWeightKg: number;
  maxVolumeM3: number;
  originPort: string;
  destPort: string;
  status: 'Siap Muat / Sandar' | 'Sedang Berlayar' | 'Selesai Bongkar' | 'Docking / Perawatan';
  departureTime: string;
  arrivalTime: string;
  deckLayout: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type CargoCategory = 
  | 'Bagasi Penumpang' 
  | 'Kargo Umum / Paket' 
  | 'Kendaraan Roda 2' 
  | 'Kendaraan Roda 4 / Mobil' 
  | 'Bahan Makanan / Palka Dingin' 
  | 'Barang Khusus / DG Class';

export type CargoStatus = 
  | 'Terdaftar' 
  | 'Proses Muat / Stowing' 
  | 'Di Atas Kapal' 
  | 'Tiba & Siap Ambil' 
  | 'Telah Diserahkan';

export type PaymentStatus = 
  | 'Lunas' 
  | 'Belum Lunas' 
  | 'Ditagihkan di Tujuan';

export interface CargoManifest {
  id: string;
  manifestNumber: string;
  shipId: string;
  shipName: string;
  senderOrPassenger: string;
  identityNumber: string;
  contactPhone: string;
  category: CargoCategory;
  description: string;
  itemCount: number;
  weightKg: number;
  volumeM3: number;
  deckPosition: string;
  handlingNotes: string;
  shippingFee: number;
  paymentStatus: PaymentStatus;
  status: CargoStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'superadmin' | 'operator';
  company: string;
  createdAt: string;
}
