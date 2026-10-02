export type ContainerSize = '20ft' | '40ft' | '45ft';

export type ContainerType = 
  | 'Dry Standard (GP)' 
  | 'High Cube (HC)' 
  | 'Reefer Pendingin (RF)' 
  | 'Open Top (OT)' 
  | 'Tank Container (TK)' 
  | 'Flat Rack (FR)';

export type ContainerStatus = 
  | 'Di Lapangan (CY)' 
  | 'Gate-In Terdaftar' 
  | 'Loading ke Kapal' 
  | 'Discharge / Bongkar' 
  | 'Gate-Out Keluar';

export type ContainerCategory = 
  | 'Impor' 
  | 'Ekspor' 
  | 'Domestik' 
  | 'Transshipment' 
  | 'Empty (Kosong)';

export interface Container {
  id: string;
  containerNumber: string;
  isoCode: string;
  size: ContainerSize;
  type: string;
  status: ContainerStatus;
  category: ContainerCategory;
  grossWeightKg: number;
  tareWeightKg: number;
  sealNumber: string;
  shippingLine: string;
  consignee: string;
  yardBlock: string;
  yardSlot: string;
  vesselName: string;
  voyageNumber: string;
  reeferTemp: string;
  isHazardous: boolean;
  dgClass: string;
  handlingFee: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface YardBlock {
  id: string;
  code: string;
  name: string;
  zoneType: string;
  maxTeuCapacity: number;
  maxTiers: number;
  equipmentAssigned: string;
  status: 'Operasional Aktif' | 'Penuh / Full' | 'Maintenance / Perbaikan';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vessel {
  id: string;
  name: string;
  callsign: string;
  berthLocation: string;
  eta: string;
  etd: string;
  targetTeus: number;
  status: 'Sandar / Berthed' | 'Bongkar Muat (Working)' | 'Menunggu Pandu' | 'Berlayar (Departed)';
  shippingLine: string;
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
