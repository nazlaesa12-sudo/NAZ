import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from './AuthContext';
import { Container, YardBlock, Vessel, ContainerStatus } from '../types';

interface BlockStats {
  totalTeus: number;
  containerCount: number;
  utilizationPercentage: number;
  isFull: boolean;
  totalGrossWeightTon: number;
}

interface TerminalStats {
  totalTeusInYard: number;
  totalContainers: number;
  activeVessels: number;
  reeferActiveCount: number;
  dgHazardousCount: number;
  totalGrossWeightTon: number;
  totalHandlingFee: number;
  yardCapacityPercentage: number;
}

interface DataContextType {
  containers: Container[];
  yardBlocks: YardBlock[];
  vessels: Vessel[];
  loadingData: boolean;
  addContainer: (data: Omit<Container, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<string>;
  updateContainer: (id: string, data: Partial<Container>) => Promise<void>;
  deleteContainer: (id: string) => Promise<void>;
  updateContainerStatus: (id: string, status: ContainerStatus) => Promise<void>;
  addYardBlock: (data: Omit<YardBlock, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<string>;
  updateYardBlock: (id: string, data: Partial<YardBlock>) => Promise<void>;
  deleteYardBlock: (id: string) => Promise<void>;
  addVessel: (data: Omit<Vessel, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<string>;
  updateVessel: (id: string, data: Partial<Vessel>) => Promise<void>;
  deleteVessel: (id: string) => Promise<void>;
  getBlockStats: (blockName: string) => BlockStats;
  getTerminalStats: () => TerminalStats;
  seedSampleData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [containers, setContainers] = useState<Container[]>([]);
  const [yardBlocks, setYardBlocks] = useState<YardBlock[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Firestore Realtime listeners
  useEffect(() => {
    if (!currentUser) {
      setContainers([]);
      setYardBlocks([]);
      setVessels([]);
      setLoadingData(false);
      return;
    }

    setLoadingData(true);

    // Containers onSnapshot
    const containersPath = 'containers';
    const unsubContainers = onSnapshot(
      collection(db, containersPath),
      (snapshot) => {
        const list: Container[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Container);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setContainers(list);
        setLoadingData(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, containersPath);
      }
    );

    // Yard Blocks onSnapshot
    const blocksPath = 'yard_blocks';
    const unsubBlocks = onSnapshot(
      collection(db, blocksPath),
      (snapshot) => {
        const list: YardBlock[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as YardBlock);
        });
        setYardBlocks(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, blocksPath);
      }
    );

    // Vessels onSnapshot
    const vesselsPath = 'vessels';
    const unsubVessels = onSnapshot(
      collection(db, vesselsPath),
      (snapshot) => {
        const list: Vessel[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Vessel);
        });
        setVessels(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, vesselsPath);
      }
    );

    return () => {
      unsubContainers();
      unsubBlocks();
      unsubVessels();
    };
  }, [currentUser]);

  // Add Container
  const addContainer = async (data: Omit<Container, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<string> => {
    if (!currentUser) throw new Error('Pengguna belum terotentikasi');
    const id = `ctn-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newContainer: Container = {
      ...data,
      id,
      createdBy: currentUser.uid,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'containers', id), newContainer);
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `containers/${id}`);
    }
  };

  // Update Container
  const updateContainer = async (id: string, data: Partial<Container>): Promise<void> => {
    if (!currentUser) throw new Error('Pengguna belum terotentikasi');
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'containers', id), {
        ...data,
        updatedAt: now,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `containers/${id}`);
    }
  };

  // Delete Container
  const deleteContainer = async (id: string): Promise<void> => {
    if (!currentUser) throw new Error('Pengguna belum terotentikasi');
    try {
      await deleteDoc(doc(db, 'containers', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `containers/${id}`);
    }
  };

  // Quick Update Status
  const updateContainerStatus = async (id: string, status: ContainerStatus): Promise<void> => {
    await updateContainer(id, { status });
  };

  // Add Yard Block
  const addYardBlock = async (data: Omit<YardBlock, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<string> => {
    if (!currentUser) throw new Error('Pengguna belum terotentikasi');
    const id = `blk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newBlock: YardBlock = {
      ...data,
      id,
      createdBy: currentUser.uid,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'yard_blocks', id), newBlock);
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `yard_blocks/${id}`);
    }
  };

  // Update Yard Block
  const updateYardBlock = async (id: string, data: Partial<YardBlock>): Promise<void> => {
    if (!currentUser) throw new Error('Pengguna belum terotentikasi');
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'yard_blocks', id), {
        ...data,
        updatedAt: now,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `yard_blocks/${id}`);
    }
  };

  // Delete Yard Block
  const deleteYardBlock = async (id: string): Promise<void> => {
    if (!currentUser) throw new Error('Pengguna belum terotentikasi');
    try {
      await deleteDoc(doc(db, 'yard_blocks', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `yard_blocks/${id}`);
    }
  };

  // Add Vessel
  const addVessel = async (data: Omit<Vessel, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<string> => {
    if (!currentUser) throw new Error('Pengguna belum terotentikasi');
    const id = `vsl-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newVessel: Vessel = {
      ...data,
      id,
      createdBy: currentUser.uid,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'vessels', id), newVessel);
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `vessels/${id}`);
    }
  };

  // Update Vessel
  const updateVessel = async (id: string, data: Partial<Vessel>): Promise<void> => {
    if (!currentUser) throw new Error('Pengguna belum terotentikasi');
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'vessels', id), {
        ...data,
        updatedAt: now,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `vessels/${id}`);
    }
  };

  // Delete Vessel
  const deleteVessel = async (id: string): Promise<void> => {
    if (!currentUser) throw new Error('Pengguna belum terotentikasi');
    try {
      await deleteDoc(doc(db, 'vessels', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `vessels/${id}`);
    }
  };

  // Calculate TEU for a container
  const getTeu = (size: string) => {
    if (size === '40ft') return 2;
    if (size === '45ft') return 2.25;
    return 1;
  };

  // Calculate stats for a block
  const getBlockStats = (blockName: string): BlockStats => {
    const block = yardBlocks.find(b => b.name === blockName || b.code === blockName);
    const blockContainers = containers.filter(
      c => (c.yardBlock === blockName || c.yardBlock === block?.name) && c.status === 'Di Lapangan (CY)'
    );

    const totalTeus = blockContainers.reduce((sum, c) => sum + getTeu(c.size), 0);
    const totalGrossWeightTon = blockContainers.reduce((sum, c) => sum + (c.grossWeightKg || 0), 0) / 1000;
    const maxCapacity = block?.maxTeuCapacity || 400;
    const utilizationPercentage = maxCapacity > 0 ? Math.round((totalTeus / maxCapacity) * 100) : 0;

    return {
      totalTeus,
      containerCount: blockContainers.length,
      utilizationPercentage,
      isFull: totalTeus >= maxCapacity,
      totalGrossWeightTon: Math.round(totalGrossWeightTon * 10) / 10,
    };
  };

  // Overall Terminal Stats
  const getTerminalStats = (): TerminalStats => {
    const inYard = containers.filter(c => c.status === 'Di Lapangan (CY)');
    const totalTeusInYard = inYard.reduce((sum, c) => sum + getTeu(c.size), 0);
    const totalGrossWeightTon = containers.reduce((sum, c) => sum + (c.grossWeightKg || 0), 0) / 1000;
    const totalHandlingFee = containers.reduce((sum, c) => sum + (c.handlingFee || 0), 0);
    const reeferActiveCount = inYard.filter(c => c.type.includes('Reefer')).length;
    const dgHazardousCount = inYard.filter(c => c.isHazardous).length;
    const activeVessels = vessels.filter(v => v.status === 'Sandar / Berthed' || v.status === 'Bongkar Muat (Working)').length;

    const totalCapacity = yardBlocks.reduce((sum, b) => sum + (b.maxTeuCapacity || 0), 0) || 2000;
    const yardCapacityPercentage = totalCapacity > 0 ? Math.min(Math.round((totalTeusInYard / totalCapacity) * 100), 100) : 0;

    return {
      totalTeusInYard,
      totalContainers: containers.length,
      activeVessels,
      reeferActiveCount,
      dgHazardousCount,
      totalGrossWeightTon: Math.round(totalGrossWeightTon * 10) / 10,
      totalHandlingFee,
      yardCapacityPercentage,
    };
  };

  // Seed Sample Data for Terminal Petikemas
  const seedSampleData = async () => {
    if (!currentUser) return;
    const now = new Date().toISOString();

    const sampleBlocks: YardBlock[] = [
      {
        id: 'blk-shk-a',
        code: 'BLK-SHK-A',
        name: 'Blok Hiu A (Dry Export)',
        zoneType: 'Dry / General Cargo',
        maxTeuCapacity: 500,
        maxTiers: 5,
        equipmentAssigned: 'RTG Shark-01 & Head Truck H-08',
        status: 'Operasional Aktif',
        createdBy: currentUser.uid,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'blk-shk-b',
        code: 'BLK-SHK-B',
        name: 'Blok Hiu B (Dry Import)',
        zoneType: 'Dry / General Cargo',
        maxTeuCapacity: 450,
        maxTiers: 5,
        equipmentAssigned: 'RTG Shark-02 & Reach Stacker RS-01',
        status: 'Operasional Aktif',
        createdBy: currentUser.uid,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'blk-shk-c',
        code: 'BLK-SHK-C',
        name: 'Blok Reefer C (Cold Chain)',
        zoneType: 'Reefer Yard (Colokan Listrik)',
        maxTeuCapacity: 200,
        maxTiers: 3,
        equipmentAssigned: 'Reach Stacker RS-03 & Teknisi Reefer Hiu',
        status: 'Operasional Aktif',
        createdBy: currentUser.uid,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'blk-shk-d',
        code: 'BLK-SHK-D',
        name: 'Blok Empty D (Depot Kosong)',
        zoneType: 'Empty Depot',
        maxTeuCapacity: 600,
        maxTiers: 6,
        equipmentAssigned: 'Side Loader SL-01',
        status: 'Operasional Aktif',
        createdBy: currentUser.uid,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'blk-shk-e',
        code: 'BLK-SHK-E',
        name: 'Blok DG E (Dangerous Goods)',
        zoneType: 'Hazardous / Bahan Berbahaya',
        maxTeuCapacity: 120,
        maxTiers: 2,
        equipmentAssigned: 'Khusus Petugas K3 & RTG Safety',
        status: 'Operasional Aktif',
        createdBy: currentUser.uid,
        createdAt: now,
        updatedAt: now,
      }
    ];

    const sampleVessels: Vessel[] = [
      {
        id: 'vsl-nazla-pioneer',
        name: 'MV NAZLA SHARK PIONEER',
        callsign: 'NZL-V01',
        berthLocation: 'Dermaga Petikemas 01 (Quay 1)',
        eta: 'Hari ini, 06:00 WIB',
        etd: 'Besok, 18:00 WIB',
        targetTeus: 850,
        status: 'Bongkar Muat (Working)',
        shippingLine: 'NAZLA SHARK LINE',
        createdBy: currentUser.uid,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'vsl-nazla-titan',
        name: 'MV NAZLA OCEAN TITAN',
        callsign: 'NZL-V02',
        berthLocation: 'Dermaga Petikemas 02 (Quay 2)',
        eta: 'Kemarin, 22:00 WIB',
        etd: 'Hari ini, 23:30 WIB',
        targetTeus: 1200,
        status: 'Sandar / Berthed',
        shippingLine: 'NAZLA SHARK LINE',
        createdBy: currentUser.uid,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'vsl-samudera-raya',
        name: 'MV SAMUDERA RAYA EXPRESS',
        callsign: 'SMR-88',
        berthLocation: 'Area Labuh Luar (Anchorage)',
        eta: 'Besok, 10:00 WIB',
        etd: 'Lusa, 14:00 WIB',
        targetTeus: 600,
        status: 'Menunggu Pandu',
        shippingLine: 'SAMUDERA ALLIANCE',
        createdBy: currentUser.uid,
        createdAt: now,
        updatedAt: now,
      }
    ];

    const sampleContainers: Container[] = [
      {
        id: 'ctn-01',
        containerNumber: 'NZLU-408192-3',
        isoCode: '42G1',
        size: '40ft',
        type: 'Dry Standard (GP)',
        status: 'Di Lapangan (CY)',
        category: 'Ekspor',
        grossWeightKg: 28400,
        tareWeightKg: 3750,
        sealNumber: 'NZL-SEAL-89912',
        shippingLine: 'NAZLA SHARK LINE',
        consignee: 'PT Indofood Makmur Ekspor',
        yardBlock: 'Blok Hiu A (Dry Export)',
        yardSlot: 'R04-T02-B08',
        vesselName: 'MV NAZLA SHARK PIONEER',
        voyageNumber: 'V.2026-EXP-08',
        reeferTemp: '-',
        isHazardous: false,
        dgClass: 'Non-DG',
        handlingFee: 1850000,
        createdBy: currentUser.uid,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        updatedAt: now,
      },
      {
        id: 'ctn-02',
        containerNumber: 'NZLU-219804-7',
        isoCode: '22R1',
        size: '20ft',
        type: 'Reefer Pendingin (RF)',
        status: 'Di Lapangan (CY)',
        category: 'Ekspor',
        grossWeightKg: 21500,
        tareWeightKg: 3050,
        sealNumber: 'NZL-COOL-44019',
        shippingLine: 'NAZLA SHARK LINE',
        consignee: 'PT Hasil Bahari Nusantara',
        yardBlock: 'Blok Reefer C (Cold Chain)',
        yardSlot: 'R02-T01-B04',
        vesselName: 'MV NAZLA SHARK PIONEER',
        voyageNumber: 'V.2026-EXP-08',
        reeferTemp: '-21.5°C',
        isHazardous: false,
        dgClass: 'Non-DG',
        handlingFee: 2400000,
        createdBy: currentUser.uid,
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        updatedAt: now,
      },
      {
        id: 'ctn-03',
        containerNumber: 'MSKU-882103-5',
        isoCode: '45G1',
        size: '40ft',
        type: 'High Cube (HC)',
        status: 'Gate-In Terdaftar',
        category: 'Impor',
        grossWeightKg: 30200,
        tareWeightKg: 3900,
        sealNumber: 'ML-9923841',
        shippingLine: 'MAERSK LINE',
        consignee: 'PT Astra Komponen Otomotif',
        yardBlock: 'Blok Hiu B (Dry Import)',
        yardSlot: 'R01-T03-B02',
        vesselName: 'MV NAZLA OCEAN TITAN',
        voyageNumber: 'V.2026-IMP-14',
        reeferTemp: '-',
        isHazardous: false,
        dgClass: 'Non-DG',
        handlingFee: 1950000,
        createdBy: currentUser.uid,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: now,
      },
      {
        id: 'ctn-04',
        containerNumber: 'NZLU-105541-0',
        isoCode: '22T1',
        size: '20ft',
        type: 'Tank Container (TK)',
        status: 'Di Lapangan (CY)',
        category: 'Domestik',
        grossWeightKg: 24000,
        tareWeightKg: 3600,
        sealNumber: 'NZL-DG-11029',
        shippingLine: 'NAZLA SHARK LINE',
        consignee: 'PT Kimia Bahari Sejahtera',
        yardBlock: 'Blok DG E (Dangerous Goods)',
        yardSlot: 'R01-T01-B01',
        vesselName: 'MV NAZLA SHARK PIONEER',
        voyageNumber: 'V.2026-EXP-08',
        reeferTemp: '-',
        isHazardous: true,
        dgClass: 'Class 3 - Flammable Liquid',
        handlingFee: 3200000,
        createdBy: currentUser.uid,
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        updatedAt: now,
      },
      {
        id: 'ctn-05',
        containerNumber: 'ONEY-774019-2',
        isoCode: '22G1',
        size: '20ft',
        type: 'Dry Standard (GP)',
        status: 'Di Lapangan (CY)',
        category: 'Empty (Kosong)',
        grossWeightKg: 2200,
        tareWeightKg: 2200,
        sealNumber: 'NO-SEAL-EMPTY',
        shippingLine: 'OCEAN NETWORK EXPRESS (ONE)',
        consignee: 'Depot Kontainer Shark',
        yardBlock: 'Blok Empty D (Depot Kosong)',
        yardSlot: 'R05-T04-B10',
        vesselName: '-',
        voyageNumber: '-',
        reeferTemp: '-',
        isHazardous: false,
        dgClass: 'Non-DG',
        handlingFee: 650000,
        createdBy: currentUser.uid,
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        updatedAt: now,
      }
    ];

    try {
      for (const b of sampleBlocks) {
        await setDoc(doc(db, 'yard_blocks', b.id), b);
      }
      for (const v of sampleVessels) {
        await setDoc(doc(db, 'vessels', v.id), v);
      }
      for (const c of sampleContainers) {
        await setDoc(doc(db, 'containers', c.id), c);
      }
    } catch (err) {
      console.error('Error seeding container terminal data:', err);
    }
  };

  return (
    <DataContext.Provider value={{
      containers,
      yardBlocks,
      vessels,
      loadingData,
      addContainer,
      updateContainer,
      deleteContainer,
      updateContainerStatus,
      addYardBlock,
      updateYardBlock,
      deleteYardBlock,
      addVessel,
      updateVessel,
      deleteVessel,
      getBlockStats,
      getTerminalStats,
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
