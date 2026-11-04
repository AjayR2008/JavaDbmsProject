export type UserRole = 'USER' | 'OPERATOR' | 'ADMIN';

export interface User {
  user_id: number;
  name: string;
  email: string;
  password_hash: string;
  phone: string;
  role: UserRole;
  created_at: string;
}

export type StationStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export interface Station {
  station_id: number;
  station_name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  opening_time: string;
  closing_time: string;
  operator_id: number;
  status: StationStatus;
  created_at: string;
}

export type ChargerStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';

export interface Charger {
  charger_id: number;
  station_id: number;
  connector_type: string;
  power_kw: number;
  price_per_kwh: number;
  status: ChargerStatus;
  created_at: string;
}

export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
  booking_id: number;
  user_id: number;
  charger_id: number;
  start_time: string; // YYYY-MM-DD HH:mm:ss
  end_time: string;   // YYYY-MM-DD HH:mm:ss
  booking_status: BookingStatus;
  notes: string;
  created_at: string;
}

export interface ChargingSession {
  session_id: number;
  booking_id: number;
  energy_used: number;
  start_time: string;
  end_time: string;
  total_cost: number;
  created_at: string;
}

export interface JoinedStationCharger {
  station_id: number;
  station_name: string;
  address: string;
  city: string;
  opening_time: string;
  closing_time: string;
  operator_id: number;
  station_status: StationStatus;
  charger_id: number;
  connector_type: string;
  power_kw: number;
  price_per_kwh: number;
  charger_status: ChargerStatus;
}
