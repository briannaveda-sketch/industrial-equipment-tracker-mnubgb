
export type PlantType = 
  | 'CD-1' 
  | 'CD-2' 
  | 'CD-3' 
  | 'CD-4' 
  | 'AV-2' 
  | 'AV-3' 
  | 'PG-1' 
  | 'SER' 
  | 'DESAL' 
  | 'BC-4' 
  | 'BC-5' 
  | 'OTHER';

export type EquipmentType = 
  | 'PUMP' 
  | 'MOTOR' 
  | 'FAN' 
  | 'FAN COOLER' 
  | 'BLOWER' 
  | 'FURNACE' 
  | 'HEAT EXCHANGER' 
  | 'CONTROL VALVE' 
  | 'INSTRUMENT' 
  | 'DRUM' 
  | 'TOWER' 
  | 'TANK';

export type EquipmentStatus = 
  | 'AVAILABLE' 
  | 'IN OPERATION' 
  | 'NOT AVAILABLE' 
  | 'IN WORKSHOP';

export type DeletionReason = 
  | 'UPLOAD ERROR' 
  | 'DEVICE DISASSEMBLED' 
  | 'OTHER';

export interface Equipment {
  id: string;
  tag: string;
  plant: PlantType;
  type: EquipmentType;
  status: EquipmentStatus;
  comments: string;
  createdAt: number;
  updatedAt: number;
  deleted?: boolean;
  deletionReason?: DeletionReason;
  deletionDetails?: string;
}

export interface ChangeLog {
  id: string;
  equipmentId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
  timestamp: number;
  changes: any;
  deviceInfo: {
    deviceName: string;
    ipAddress: string;
  };
}

export interface StatusSummary {
  plant: PlantType;
  available: number;
  inOperation: number;
  notAvailable: number;
  inWorkshop: number;
  total: number;
}
