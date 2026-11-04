import { User, Station, Charger, Booking, ChargingSession } from '../types';

export const INITIAL_USERS: User[] = [
  {
    user_id: 1,
    name: 'Alex Vance',
    email: 'admin@evcharge.com',
    password_hash: 'admin123',
    phone: '+91 9876543210',
    role: 'ADMIN',
    created_at: '2026-01-01 08:00:00'
  },
  {
    user_id: 2,
    name: 'Maya Lin',
    email: 'operator1@evcharge.com',
    password_hash: 'admin123',
    phone: '+91 9876543211',
    role: 'OPERATOR',
    created_at: '2026-01-02 09:00:00'
  },
  {
    user_id: 3,
    name: 'David Chen',
    email: 'operator2@evcharge.com',
    password_hash: 'admin123',
    phone: '+91 9876543212',
    role: 'OPERATOR',
    created_at: '2026-01-03 10:00:00'
  },
  {
    user_id: 4,
    name: 'Elena Rostova',
    email: 'elena@example.com',
    password_hash: 'admin123',
    phone: '+91 9876543213',
    role: 'USER',
    created_at: '2026-01-10 11:30:00'
  },
  {
    user_id: 5,
    name: 'Marcus Brody',
    email: 'marcus@example.com',
    password_hash: 'admin123',
    phone: '+91 9876543214',
    role: 'USER',
    created_at: '2026-01-11 14:20:00'
  },
  {
    user_id: 6,
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password_hash: 'admin123',
    phone: '+91 9876543215',
    role: 'USER',
    created_at: '2026-01-12 16:45:00'
  },
  {
    user_id: 7,
    name: 'Samuel Taylor',
    email: 'samuel@example.com',
    password_hash: 'admin123',
    phone: '+91 9876543216',
    role: 'USER',
    created_at: '2026-01-15 18:10:00'
  }
];

export const INITIAL_STATIONS: Station[] = [
  {
    station_id: 1,
    station_name: 'Green Hub FastCharge',
    address: 'Anna Salai, Guindy',
    city: 'Chennai',
    latitude: 13.0067,
    longitude: 80.2489,
    opening_time: '06:00',
    closing_time: '23:00',
    operator_id: 2,
    status: 'ACTIVE',
    created_at: '2026-01-05 06:00:00'
  },
  {
    station_id: 2,
    station_name: 'Metro SuperStation',
    address: 'MG Road, Brigade Gateway',
    city: 'Bangalore',
    latitude: 12.9716,
    longitude: 77.5946,
    opening_time: '00:00',
    closing_time: '23:59',
    operator_id: 2,
    status: 'ACTIVE',
    created_at: '2026-01-06 06:00:00'
  },
  {
    station_id: 3,
    station_name: 'Eco Charge Point',
    address: 'Banjara Hills, Road No. 12',
    city: 'Hyderabad',
    latitude: 17.385,
    longitude: 78.4867,
    opening_time: '06:00',
    closing_time: '23:00',
    operator_id: 2,
    status: 'ACTIVE',
    created_at: '2026-01-07 06:00:00'
  },
  {
    station_id: 4,
    station_name: 'Central Charge Hub',
    address: 'Connaught Place, Block A',
    city: 'Delhi',
    latitude: 28.6328,
    longitude: 77.2197,
    opening_time: '00:00',
    closing_time: '23:59',
    operator_id: 3,
    status: 'ACTIVE',
    created_at: '2026-01-08 06:00:00'
  },
  {
    station_id: 5,
    station_name: 'Smart EV Station',
    address: 'Koregaon Park, Lane 5',
    city: 'Pune',
    latitude: 18.5369,
    longitude: 73.8937,
    opening_time: '06:00',
    closing_time: '22:00',
    operator_id: 3,
    status: 'ACTIVE',
    created_at: '2026-01-09 06:00:00'
  },
  {
    station_id: 6,
    station_name: 'Quick Charge Depot',
    address: 'Salt Lake, Sector V',
    city: 'Kolkata',
    latitude: 22.5726,
    longitude: 88.3639,
    opening_time: '06:00',
    closing_time: '22:30',
    operator_id: 2,
    status: 'ACTIVE',
    created_at: '2026-01-10 06:00:00'
  },
  {
    station_id: 7,
    station_name: 'Highway EV Plaza',
    address: 'Marine Drive, Nariman Point',
    city: 'Mumbai',
    latitude: 18.9441,
    longitude: 72.8236,
    opening_time: '06:00',
    closing_time: '23:00',
    operator_id: 3,
    status: 'ACTIVE',
    created_at: '2026-01-11 06:00:00'
  },
  {
    station_id: 8,
    station_name: 'Tech Park Charger',
    address: 'Electronic City Phase 1',
    city: 'Bangalore',
    latitude: 12.8447,
    longitude: 77.6631,
    opening_time: '05:00',
    closing_time: '23:00',
    operator_id: 3,
    status: 'ACTIVE',
    created_at: '2026-01-12 06:00:00'
  }
];

export const INITIAL_CHARGERS: Charger[] = [
  // Station 1: Chennai (6 chargers)
  { charger_id: 1, station_id: 1, connector_type: 'CCS2', power_kw: 150.0, price_per_kwh: 12.5, status: 'AVAILABLE', created_at: '2026-01-05 08:00:00' },
  { charger_id: 2, station_id: 1, connector_type: 'CCS2', power_kw: 350.0, price_per_kwh: 15.0, status: 'OCCUPIED', created_at: '2026-01-05 08:00:00' },
  { charger_id: 3, station_id: 1, connector_type: 'Type 2', power_kw: 22.0, price_per_kwh: 8.0, status: 'AVAILABLE', created_at: '2026-01-05 08:00:00' },
  { charger_id: 4, station_id: 1, connector_type: 'Tesla Supercharger', power_kw: 250.0, price_per_kwh: 14.0, status: 'AVAILABLE', created_at: '2026-01-05 08:00:00' },
  { charger_id: 5, station_id: 1, connector_type: 'CHAdeMO', power_kw: 50.0, price_per_kwh: 10.0, status: 'AVAILABLE', created_at: '2026-01-05 08:00:00' },
  { charger_id: 6, station_id: 1, connector_type: 'CCS2', power_kw: 150.0, price_per_kwh: 12.5, status: 'MAINTENANCE', created_at: '2026-01-05 08:00:00' },

  // Station 2: Bangalore MG Road (5 chargers)
  { charger_id: 7, station_id: 2, connector_type: 'CCS2', power_kw: 350.0, price_per_kwh: 14.5, status: 'AVAILABLE', created_at: '2026-01-06 08:00:00' },
  { charger_id: 8, station_id: 2, connector_type: 'CCS2', power_kw: 350.0, price_per_kwh: 14.5, status: 'OCCUPIED', created_at: '2026-01-06 08:00:00' },
  { charger_id: 9, station_id: 2, connector_type: 'Tesla Supercharger', power_kw: 250.0, price_per_kwh: 13.5, status: 'AVAILABLE', created_at: '2026-01-06 08:00:00' },
  { charger_id: 10, station_id: 2, connector_type: 'Type 2', power_kw: 22.0, price_per_kwh: 7.5, status: 'AVAILABLE', created_at: '2026-01-06 08:00:00' },
  { charger_id: 11, station_id: 2, connector_type: 'GB/T', power_kw: 60.0, price_per_kwh: 9.5, status: 'AVAILABLE', created_at: '2026-01-06 08:00:00' },

  // Station 3: Hyderabad (4 chargers)
  { charger_id: 12, station_id: 3, connector_type: 'CCS2', power_kw: 150.0, price_per_kwh: 11.0, status: 'AVAILABLE', created_at: '2026-01-07 08:00:00' },
  { charger_id: 13, station_id: 3, connector_type: 'CCS2', power_kw: 150.0, price_per_kwh: 11.0, status: 'OCCUPIED', created_at: '2026-01-07 08:00:00' },
  { charger_id: 14, station_id: 3, connector_type: 'Type 2', power_kw: 43.0, price_per_kwh: 9.0, status: 'AVAILABLE', created_at: '2026-01-07 08:00:00' },
  { charger_id: 15, station_id: 3, connector_type: 'CHAdeMO', power_kw: 50.0, price_per_kwh: 10.0, status: 'MAINTENANCE', created_at: '2026-01-07 08:00:00' },

  // Station 4: Delhi (5 chargers)
  { charger_id: 16, station_id: 4, connector_type: 'CCS2', power_kw: 350.0, price_per_kwh: 16.0, status: 'AVAILABLE', created_at: '2026-01-08 08:00:00' },
  { charger_id: 17, station_id: 4, connector_type: 'CCS2', power_kw: 150.0, price_per_kwh: 13.0, status: 'AVAILABLE', created_at: '2026-01-08 08:00:00' },
  { charger_id: 18, station_id: 4, connector_type: 'Tesla Supercharger', power_kw: 250.0, price_per_kwh: 14.0, status: 'OCCUPIED', created_at: '2026-01-08 08:00:00' },
  { charger_id: 19, station_id: 4, connector_type: 'Type 2', power_kw: 22.0, price_per_kwh: 8.5, status: 'AVAILABLE', created_at: '2026-01-08 08:00:00' },
  { charger_id: 20, station_id: 4, connector_type: 'CHAdeMO', power_kw: 62.5, price_per_kwh: 10.5, status: 'AVAILABLE', created_at: '2026-01-08 08:00:00' },

  // Station 5: Pune (4 chargers)
  { charger_id: 21, station_id: 5, connector_type: 'CCS2', power_kw: 175.0, price_per_kwh: 11.5, status: 'AVAILABLE', created_at: '2026-01-09 08:00:00' },
  { charger_id: 22, station_id: 5, connector_type: 'CCS2', power_kw: 175.0, price_per_kwh: 11.5, status: 'AVAILABLE', created_at: '2026-01-09 08:00:00' },
  { charger_id: 23, station_id: 5, connector_type: 'Tesla Supercharger', power_kw: 250.0, price_per_kwh: 12.5, status: 'AVAILABLE', created_at: '2026-01-09 08:00:00' },
  { charger_id: 24, station_id: 5, connector_type: 'Type 2', power_kw: 22.0, price_per_kwh: 7.0, status: 'OCCUPIED', created_at: '2026-01-09 08:00:00' },

  // Station 6: Kolkata (3 chargers)
  { charger_id: 25, station_id: 6, connector_type: 'CCS2', power_kw: 120.0, price_per_kwh: 10.5, status: 'AVAILABLE', created_at: '2026-01-10 08:00:00' },
  { charger_id: 26, station_id: 6, connector_type: 'Type 2', power_kw: 22.0, price_per_kwh: 7.5, status: 'AVAILABLE', created_at: '2026-01-10 08:00:00' },
  { charger_id: 27, station_id: 6, connector_type: 'CHAdeMO', power_kw: 50.0, price_per_kwh: 9.5, status: 'AVAILABLE', created_at: '2026-01-10 08:00:00' },

  // Station 7: Mumbai (4 chargers)
  { charger_id: 28, station_id: 7, connector_type: 'CCS2', power_kw: 200.0, price_per_kwh: 13.0, status: 'AVAILABLE', created_at: '2026-01-11 08:00:00' },
  { charger_id: 29, station_id: 7, connector_type: 'CCS2', power_kw: 150.0, price_per_kwh: 12.0, status: 'AVAILABLE', created_at: '2026-01-11 08:00:00' },
  { charger_id: 30, station_id: 7, connector_type: 'Type 2', power_kw: 22.0, price_per_kwh: 8.5, status: 'AVAILABLE', created_at: '2026-01-11 08:00:00' },
  { charger_id: 31, station_id: 7, connector_type: 'Tesla Supercharger', power_kw: 250.0, price_per_kwh: 13.5, status: 'OCCUPIED', created_at: '2026-01-11 08:00:00' },

  // Station 8: Bangalore EC (3 chargers)
  { charger_id: 32, station_id: 8, connector_type: 'CCS2', power_kw: 150.0, price_per_kwh: 11.5, status: 'AVAILABLE', created_at: '2026-01-12 08:00:00' },
  { charger_id: 33, station_id: 8, connector_type: 'Type 2', power_kw: 22.0, price_per_kwh: 7.5, status: 'AVAILABLE', created_at: '2026-01-12 08:00:00' },
  { charger_id: 34, station_id: 8, connector_type: 'Tesla Supercharger', power_kw: 250.0, price_per_kwh: 13.0, status: 'AVAILABLE', created_at: '2026-01-12 08:00:00' }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    booking_id: 1,
    user_id: 4,
    charger_id: 1,
    start_time: '2026-11-02 10:00:00',
    end_time: '2026-11-02 11:30:00',
    booking_status: 'COMPLETED',
    notes: 'Regular weekly commuter charge',
    created_at: '2026-11-01 10:00:00'
  },
  {
    booking_id: 2,
    user_id: 5,
    charger_id: 7,
    start_time: '2026-11-02 12:00:00',
    end_time: '2026-11-02 14:00:00',
    booking_status: 'COMPLETED',
    notes: 'Highway trip top-up',
    created_at: '2026-11-01 12:00:00'
  },
  {
    booking_id: 3,
    user_id: 6,
    charger_id: 12,
    start_time: '2026-11-01 14:00:00',
    end_time: '2026-11-01 15:30:00',
    booking_status: 'COMPLETED',
    notes: 'Quick charge during shopping',
    created_at: '2026-10-31 14:00:00'
  },
  {
    booking_id: 4,
    user_id: 4,
    charger_id: 1,
    start_time: '2026-11-04 09:00:00',
    end_time: '2026-11-04 10:30:00',
    booking_status: 'CONFIRMED',
    notes: 'Morning work commute reserve',
    created_at: '2026-11-03 08:00:00'
  },
  {
    booking_id: 5,
    user_id: 5,
    charger_id: 4,
    start_time: '2026-11-04 14:00:00',
    end_time: '2026-11-04 16:00:00',
    booking_status: 'CONFIRMED',
    notes: 'Tesla Model Y high-speed slot',
    created_at: '2026-11-03 08:15:00'
  },
  {
    booking_id: 6,
    user_id: 6,
    charger_id: 11,
    start_time: '2026-11-05 15:00:00',
    end_time: '2026-11-05 16:30:00',
    booking_status: 'CONFIRMED',
    notes: 'Afternoon charge slot',
    created_at: '2026-11-03 08:30:00'
  },
  {
    booking_id: 7,
    user_id: 7,
    charger_id: 2,
    start_time: '2026-11-04 11:00:00',
    end_time: '2026-11-04 12:00:00',
    booking_status: 'CONFIRMED',
    notes: 'Downtown fast charge',
    created_at: '2026-11-03 08:45:00'
  }
];

export const INITIAL_SESSIONS: ChargingSession[] = [
  {
    session_id: 1,
    booking_id: 1,
    energy_used: 48.5,
    start_time: '2026-11-02 10:02:00',
    end_time: '2026-11-02 11:28:00',
    total_cost: 606.25,
    created_at: '2026-11-02 11:30:00'
  },
  {
    session_id: 2,
    booking_id: 2,
    energy_used: 62.0,
    start_time: '2026-11-02 12:05:00',
    end_time: '2026-11-02 13:58:00',
    total_cost: 899.0,
    created_at: '2026-11-02 14:00:00'
  },
  {
    session_id: 3,
    booking_id: 3,
    energy_used: 38.2,
    start_time: '2026-11-01 14:01:00',
    end_time: '2026-11-01 15:25:00',
    total_cost: 420.2,
    created_at: '2026-11-01 15:30:00'
  }
];
