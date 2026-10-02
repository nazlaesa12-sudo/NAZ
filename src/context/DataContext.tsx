import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from './AuthContext';
import { Ship, CargoManifest, CargoStatus, PaymentStatus } from '../types';

interface ShipStats {
  totalWeightKg: number;
  totalVolumeM3: number;
  totalItems: number;
  totalFee: number;
  manifestCount: number;
  weightPercentage: number;
  volumePercentage: number;
  isOverloadedWeight: boolean;
  isOverloadedVolume: boolean;
}

interface DataContextType {
  ships: Ship[];
  manifests: CargoManifest[];
  loadingData: boolean;
  activeShipId: string | null;
  setActiveShipId: (id: string | null) => void;
  addShip: (ship: Omit<Ship, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<string>;
  updateShip: (id: string, ship: Partial<Ship>) => Promise<void>;
  deleteShip: (id: string) => Promise<void>;
  addManifest: (manifest: Omit<CargoManifest, 'id' | 'manifestNumber' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<string>;
  updateManifest: (id: string, manifest: Partial<CargoManifest>) => Promise<void>;
  deleteManifest: (id: string) => Promise<void>;
  updateManifestStatus: (id: string, status: CargoStatus) => Promise<void>;
  getShipStats: (shipId: string) => ShipStats;
  seedSampleData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [ships, setShips] = useState<Ship[]>([]);
  const [manifests, setManifests] = useState<CargoManifest[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeShipId, setActiveShipId] = useState<string | null>(null);

  // Firestore Realtime listeners
  useEffect(() => {
    if (!currentUser) {
      setShips([]);
      setManifests([]);
      setLoadingData(false);
      return;
    }

    setLoadingData(true);

    // Ships onSnapshot
    const shipsPath = 'ships';
    const unsubscribeShips = onSnapshot(
      collection(db, shipsPath),
      (snapshot) => {
        const shipsList: Ship[] = [];
        snapshot.forEach((docSnap) => {
          shipsList.push({ id: docSnap.id, ...docSnap.data() } as Ship);
        });
        setShips(shipsList);
        setLoadingData(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, shipsPath);
      }
    );

    // Manifests onSnapshot
    const manifestsPath = 'cargo_manifests';
    const unsubscribeManifests = onSnapshot(
      collection(db, manifestsPath),
      (snapshot) => {
        const manifestList: CargoManifest[] = [];
        snapshot.forEach((docSnap) => {
          manifestList.push({ id: docSnap.id, ...docSnap.data() } as CargoManifest);
        });
        // Sort by createdAt desc
        manifestList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setManifests(manifestList);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, manifestsPath);
      }
    );

    return () => {
      unsubscribeShips();
      unsubscribeManifests();
    };
  }, [currentUser]);

  // Add Ship
  const addShip = async (shipData: Omit<Ship, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<string> => {
    if (!currentUser) throw new Error('Pengguna belum terotentikasi');
    const id = `ship-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const newShip: Ship = {
      ...shipData,
      id,
      createdBy: currentUser.uid,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'ships', id), newShip);
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `ships/${id}`);
    }
  };

  // Update Ship
  const updateShip = async (id: string, shipData: Partial<Ship>): Promise<void> => {
    if (!currentUser) throw new Error('Pengguna belum terotentikasi');
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'ships', id), {
        ...shipData,
        updatedAt: now,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `ships/${id}`);
    }
  };

  // Delete Ship
  const deleteShip = async (id: string): Promise<void> => {
    if (!currentUser) throw new Error('Pengguna belum terotentikasi');
    try {
      await deleteDoc(doc(db, 'ships', id));
      if (activeShipId === id) setActiveShipId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `ships/${id}`);
    }
  };

  // Add Cargo Manifest
  const addManifest = async (manifestData: Omit<CargoManifest, 'id' | 'manifestNumber' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<string> => {
    if (!currentUser) throw new Error('Pengguna belum terotentikasi');
    const id = `mft-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const manifestNumber = `NZL-${new Date().getFullYear()}-${randomSuffix}`;
    const now = new Date().toISOString();

    const newManifest: CargoManifest = {
      ...manifestData,
      id,
      manifestNumber,
      createdBy: currentUser.uid,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'cargo_manifests', id), newManifest);
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `cargo_manifests/${id}`);
    }
  };

  // Update Cargo Manifest
  const updateManifest = async (id: string, manifestData: Partial<CargoManifest>): Promise<void> => {
    if (!currentUser) throw new Error('Pengguna belum terotentikasi');
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'cargo_manifests', id), {
        ...manifestData,
        updatedAt: now,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `cargo_manifests/${id}`);
    }
  };

  // Delete Cargo Manifest
  const deleteManifest = async (id: string): Promise<void> => {
    if (!currentUser) throw new Error('Pengguna belum terotentikasi');
    try {
      await deleteDoc(doc(db, 'cargo_manifests', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `cargo_manifests/${id}`);
    }
  };

  // Quick Status Update
  const updateManifestStatus = async (id: string, status: CargoStatus): Promise<void> => {
    await updateManifest(id, { status });
  };

  // Calculate stats for a ship
  const getShipStats = (shipId: string): ShipStats => {
    const ship = ships.find(s => s.id === shipId);
    const shipManifests = manifests.filter(m => m.shipId === shipId);

    const totalWeightKg = shipManifests.reduce((sum, m) => sum + (Number(m.weightKg) || 0), 0);
    const totalVolumeM3 = shipManifests.reduce((sum, m) => sum + (Number(m.volumeM3) || 0), 0);
    const totalItems = shipManifests.reduce((sum, m) => sum + (Number(m.itemCount) || 0), 0);
    const totalFee = shipManifests.reduce((sum, m) => sum + (Number(m.shippingFee) || 0), 0);

    const maxWeight = ship?.maxCargoWeightKg || 10000;
    const maxVol = ship?.maxVolumeM3 || 500;

    const weightPercentage = maxWeight > 0 ? Math.min(Math.round((totalWeightKg / maxWeight) * 100), 100) : 0;
    const volumePercentage = maxVol > 0 ? Math.min(Math.round((totalVolumeM3 / maxVol) * 100), 100) : 0;

    return {
      totalWeightKg,
      totalVolumeM3,
      totalItems,
      totalFee,
      manifestCount: shipManifests.length,
      weightPercentage,
      volumePercentage,
      isOverloadedWeight: totalWeightKg > maxWeight,
      isOverloadedVolume: totalVolumeM3 > maxVol,
    };
  };

  // Seed sample maritime fleet and passenger cargo manifests directly into Firestore
  const seedSampleData = async () => {
    if (!currentUser) return;
    const now = new Date().toISOString();

    const sampleShips = [
      {
        id: 'ship-nazla-shark-01',
        name: 'KM NAZLA SHARK 01',
        code: 'NZL-SHK-01',
        type: 'Kapal Feri Cepat Penumpang & Kargo',
        captain: 'Capt. Rian Nazla Bahari, M.Mar',
        maxPassengers: 450,
        maxCargoWeightKg: 45000,
        maxVolumeM3: 650,
        originPort: 'Pelabuhan Tanjung Perak (Surabaya)',
        destPort: 'Pelabuhan Soekarno-Hatta (Makassar)',
        status: 'Siap Muat / Sandar' as const,
        departureTime: 'Hari ini, 21:00 WIB',
        arrivalTime: 'Besok, 18:30 WITA',
        deckLayout: 'Deck 1 (Palka Kargo), Deck 2 (Bagasi Eksekutif), Car Deck A (Kendaraan)',
        createdBy: currentUser.uid,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'ship-nazla-ocean-speed',
        name: 'KM NAZLA OCEAN SPEED',
        code: 'NZL-OCS-02',
        type: 'Kapal Ro-Ro Penumpang',
        captain: 'Capt. Hendra Firmansyah',
        maxPassengers: 600,
        maxCargoWeightKg: 85000,
        maxVolumeM3: 1200,
        originPort: 'Pelabuhan Merak (Banten)',
        destPort: 'Pelabuhan Bakauheni (Lampung)',
        status: 'Sedang Berlayar' as const,
        departureTime: 'Hari ini, 14:00 WIB',
        arrivalTime: 'Hari ini, 16:30 WIB',
        deckLayout: 'Main Car Deck B1-B24, Upper Baggage Bay C1-C10',
        createdBy: currentUser.uid,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'ship-nazla-bahari-star',
        name: 'KM NAZLA BAHARI STAR',
        code: 'NZL-BHR-03',
        type: 'Kapal Motor Penumpang Nusantara',
        captain: 'Capt. Nazla Syafiq Ramadhan',
        maxPassengers: 850,
        maxCargoWeightKg: 120000,
        maxVolumeM3: 1800,
        originPort: 'Pelabuhan Tanjung Priok (Jakarta)',
        destPort: 'Pelabuhan Semayang (Balikpapan)',
        status: 'Siap Muat / Sandar' as const,
        departureTime: 'Besok, 08:00 WIB',
        arrivalTime: 'Lusa, 14:00 WITA',
        deckLayout: 'Deck A (Palka Pendingin), Deck B (Bagasi Kabin), Deck C (General Cargo)',
        createdBy: currentUser.uid,
        createdAt: now,
        updatedAt: now,
      }
    ];

    const sampleManifests = [
      {
        id: 'mft-demo-01',
        manifestNumber: 'NZL-2026-8801',
        shipId: 'ship-nazla-shark-01',
        shipName: 'KM NAZLA SHARK 01',
        senderOrPassenger: 'Bambang Sudarsono (Penumpang Eksekutif)',
        identityNumber: '3578012409890003',
        contactPhone: '081234567890',
        category: 'Bagasi Penumpang' as const,
        description: '2 Koper Pakaian & Dokumen Bisnis Kemaritiman',
        itemCount: 2,
        weightKg: 35,
        volumeM3: 0.25,
        deckPosition: 'Deck 2 - Bagasi Eksekutif Slot 12',
        handlingNotes: 'Simpan di kompartemen kering dan aman',
        shippingFee: 150000,
        paymentStatus: 'Lunas' as const,
        status: 'Di Atas Kapal' as const,
        createdBy: currentUser.uid,
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        updatedAt: now,
      },
      {
        id: 'mft-demo-02',
        manifestNumber: 'NZL-2026-8802',
        shipId: 'ship-nazla-shark-01',
        shipName: 'KM NAZLA SHARK 01',
        senderOrPassenger: 'CV Sumber Bahari Jaya (Pengirim Kargo)',
        identityNumber: '3515091102920001',
        contactPhone: '082198765432',
        category: 'Bahan Makanan / Palka Dingin' as const,
        description: 'Peti Ikan Segar & Hasil Laut Beku (Cold Storage)',
        itemCount: 40,
        weightKg: 2400,
        volumeM3: 8.5,
        deckPosition: 'Deck 1 - Palka Dingin Freezer Unit #2',
        handlingNotes: 'Suhu wajib terjaga di kisaran -18°C s/d -20°C',
        shippingFee: 4800000,
        paymentStatus: 'Lunas' as const,
        status: 'Proses Muat / Stowing' as const,
        createdBy: currentUser.uid,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: now,
      },
      {
        id: 'mft-demo-03',
        manifestNumber: 'NZL-2026-8803',
        shipId: 'ship-nazla-shark-01',
        shipName: 'KM NAZLA SHARK 01',
        senderOrPassenger: 'Ahmad Faisal (Penumpang & Pemilik Motor)',
        identityNumber: '7371101905870004',
        contactPhone: '081377889900',
        category: 'Kendaraan Roda 2' as const,
        description: 'Sepeda Motor Honda PCX 160cc (No Pol: L 4521 AB)',
        itemCount: 1,
        weightKg: 132,
        volumeM3: 1.8,
        deckPosition: 'Car Deck A - Bay Motor #04 (Tied down)',
        handlingNotes: 'Kuras bahan bakar minimal 50%, ikat ganjal roda dengan strapping marine',
        shippingFee: 650000,
        paymentStatus: 'Lunas' as const,
        status: 'Di Atas Kapal' as const,
        createdBy: currentUser.uid,
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        updatedAt: now,
      },
      {
        id: 'mft-demo-04',
        manifestNumber: 'NZL-2026-8804',
        shipId: 'ship-nazla-ocean-speed',
        shipName: 'KM NAZLA OCEAN SPEED',
        senderOrPassenger: 'PT Logistik Sinar Mulia',
        identityNumber: '3201082206950008',
        contactPhone: '085211223344',
        category: 'Kargo Umum / Paket' as const,
        description: 'Kardus Tekstil & Pakaian Jadi Siap Distribusi',
        itemCount: 80,
        weightKg: 3200,
        volumeM3: 12.0,
        deckPosition: 'Main Car Deck B1 - Area Pallet B-09',
        handlingNotes: 'Jauhkan dari percikan air laut / gunakan terpal pelindung',
        shippingFee: 5600000,
        paymentStatus: 'Lunas' as const,
        status: 'Di Atas Kapal' as const,
        createdBy: currentUser.uid,
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        updatedAt: now,
      }
    ];

    try {
      for (const ship of sampleShips) {
        await setDoc(doc(db, 'ships', ship.id), ship);
      }
      for (const manifest of sampleManifests) {
        await setDoc(doc(db, 'cargo_manifests', manifest.id), manifest);
      }
    } catch (err) {
      console.error('Error seeding data:', err);
    }
  };

  return (
    <DataContext.Provider value={{
      ships,
      manifests,
      loadingData,
      activeShipId,
      setActiveShipId,
      addShip,
      updateShip,
      deleteShip,
      addManifest,
      updateManifest,
      deleteManifest,
      updateManifestStatus,
      getShipStats,
      seedSampleData,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
