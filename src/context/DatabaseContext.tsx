import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Station,
  Charger,
  Booking,
  ChargingSession,
  UserRole,
  ChargerStatus,
  StationStatus
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_STATIONS,
  INITIAL_CHARGERS,
  INITIAL_BOOKINGS,
  INITIAL_SESSIONS
} from '../data/seedData';

interface SqlResult {
  columns: string[];
  rows: (string | number | null)[][];
  rowCount: number;
  error?: string;
}

interface DatabaseContextType {
  users: User[];
  stations: Station[];
  chargers: Charger[];
  bookings: Booking[];
  sessions: ChargingSession[];
  currentUser: User;
  
  // RBAC helpers
  isAdmin: boolean;
  isOperator: boolean;
  isUser: boolean;
  canAddStation: boolean;
  canUpdateCharger: boolean;
  canRemoveStation: boolean;
  canAccessDbmsConsole: boolean;
  
  // Actions
  login: (email: string, pass: string) => { success: boolean; message: string };
  signup: (data: { name: string; email: string; password: string; phone: string; role: UserRole }) => { success: boolean; message: string };
  switchUser: (userId: number) => void;
  logout: () => void;
  addStation: (data: {
    station_name: string;
    city: string;
    address: string;
    opening_time: string;
    closing_time: string;
    latitude: number;
    longitude: number;
    operator_id: number;
  }) => { success: boolean; message: string; stationId?: number };
  updateCharger: (data: {
    charger_id: number;
    status: ChargerStatus;
    power_kw: number;
    price_per_kwh: number;
  }) => { success: boolean; message: string };
  removeStation: (stationId: number) => { success: boolean; message: string };
  bookSlot: (data: {
    userId: number;
    chargerId: number;
    date: string;
    startTime: string; // HH:mm:ss
    endTime: string;   // HH:mm:ss
    notes: string;
  }) => { success: boolean; message: string; type: 'success' | 'error'; bookingId?: number };
  cancelBooking: (bookingId: number) => { success: boolean; message: string };
  executeSql: (query: string) => SqlResult;
  resetDatabase: () => void;
}

const STORAGE_KEY = 'ev_charging_system_db_v1';

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [stations, setStations] = useState<Station[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_stations');
      return saved ? JSON.parse(saved) : INITIAL_STATIONS;
    } catch {
      return INITIAL_STATIONS;
    }
  });

  const [chargers, setChargers] = useState<Charger[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_chargers');
      return saved ? JSON.parse(saved) : INITIAL_CHARGERS;
    } catch {
      return INITIAL_CHARGERS;
    }
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_bookings');
      return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
    } catch {
      return INITIAL_BOOKINGS;
    }
  });

  const [sessions, setSessions] = useState<ChargingSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_sessions');
      return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
    } catch {
      return INITIAL_SESSIONS;
    }
  });

  // Default active user is Alex Vance (ADMIN) matching EVWebServer
  const [currentUserId, setCurrentUserId] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_curr_user_id');
      return saved ? Number(saved) : 1;
    } catch {
      return 1;
    }
  });

  const currentUser = users.find(u => u.user_id === currentUserId) || users[0] || INITIAL_USERS[0];

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_stations', JSON.stringify(stations));
  }, [stations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_chargers', JSON.stringify(chargers));
  }, [chargers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_curr_user_id', String(currentUserId));
  }, [currentUserId]);

  // RBAC flags
  const isAdmin = currentUser.role === 'ADMIN';
  const isOperator = currentUser.role === 'OPERATOR';
  const isUser = currentUser.role === 'USER';
  const canAddStation = isAdmin || isOperator;
  const canUpdateCharger = isAdmin || isOperator;
  const canRemoveStation = isAdmin;
  const canAccessDbmsConsole = isAdmin;

  // Actions
  const switchUser = (userId: number) => {
    const user = users.find(u => u.user_id === userId);
    if (user) {
      setCurrentUserId(userId);
    }
  };

  const login = (email: string, pass: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password_hash === pass.trim());
    if (user) {
      setCurrentUserId(user.user_id);
      return { success: true, message: `Welcome back, ${user.name}! Authenticated as [${user.role}].` };
    }
    return { success: false, message: 'Invalid Email or Password. Please try again.' };
  };

  const signup = (data: { name: string; email: string; password: string; phone: string; role: UserRole }) => {
    const existing = users.find(u => u.email.toLowerCase() === data.email.toLowerCase().trim());
    if (existing) {
      return { success: false, message: 'This email is already registered in MySQL users table. Please log in or use another email.' };
    }
    const newId = users.length > 0 ? Math.max(...users.map(u => u.user_id)) + 1 : 1;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newUser: User = {
      user_id: newId,
      name: data.name.trim(),
      email: data.email.trim(),
      password_hash: data.password.trim(),
      phone: data.phone.trim() || '+91 9000000000',
      role: data.role,
      created_at: now
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUserId(newId);
    return { success: true, message: `Registration successful! Logged in as ${newUser.name} [${newUser.role}].` };
  };

  const logout = () => {
    // Switch to first regular user or demo guest
    const firstUser = users.find(u => u.role === 'USER') || users[0];
    if (firstUser) setCurrentUserId(firstUser.user_id);
  };

  const addStation = (data: {
    station_name: string;
    city: string;
    address: string;
    opening_time: string;
    closing_time: string;
    latitude: number;
    longitude: number;
    operator_id: number;
  }) => {
    if (!canAddStation) {
      return {
        success: false,
        message: `ACCESS DENIED (403 Forbidden): Role '${currentUser.role}' is not permitted to add charging stations. Only ADMIN or OPERATOR roles have infrastructure creation privileges.`
      };
    }

    const newStationId = stations.length > 0 ? Math.max(...stations.map(s => s.station_id)) + 1 : 1;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // Operator must assign to self; Admin can assign to selected operator
    const opId = isOperator ? currentUser.user_id : data.operator_id;

    const newStation: Station = {
      station_id: newStationId,
      station_name: data.station_name,
      city: data.city,
      address: data.address,
      opening_time: data.opening_time,
      closing_time: data.closing_time,
      latitude: data.latitude,
      longitude: data.longitude,
      operator_id: opId,
      status: 'ACTIVE',
      created_at: now
    };

    // Auto-create 2 initial chargers for newly added station (as in EVWebServer.java)
    const nextChargerId = chargers.length > 0 ? Math.max(...chargers.map(c => c.charger_id)) + 1 : 1;
    const initialBays: Charger[] = [
      {
        charger_id: nextChargerId,
        station_id: newStationId,
        connector_type: 'CCS2',
        power_kw: 60.0,
        price_per_kwh: 18.50,
        status: 'AVAILABLE',
        created_at: now
      },
      {
        charger_id: nextChargerId + 1,
        station_id: newStationId,
        connector_type: 'Type 2',
        power_kw: 22.0,
        price_per_kwh: 14.00,
        status: 'AVAILABLE',
        created_at: now
      }
    ];

    setStations(prev => [...prev, newStation]);
    setChargers(prev => [...prev, ...initialBays]);

    return {
      success: true,
      stationId: newStationId,
      message: `Station '${data.station_name}' (ID #${newStationId}) registered by ${currentUser.name} [${currentUser.role}] into MySQL table 'stations' with 2 default charger bays (CCS2 60kW & Type 2 22kW)!`
    };
  };

  const updateCharger = (data: {
    charger_id: number;
    status: ChargerStatus;
    power_kw: number;
    price_per_kwh: number;
  }) => {
    if (!canUpdateCharger) {
      return {
        success: false,
        message: `ACCESS DENIED (403 Forbidden): Role '${currentUser.role}' is not permitted to update charger telemetry. Only OPERATOR or ADMIN roles can modify chargers.`
      };
    }

    const exists = chargers.some(c => c.charger_id === data.charger_id);
    if (!exists) {
      return { success: false, message: `Charger bay #${data.charger_id} not found in database.` };
    }

    setChargers(prev =>
      prev.map(c =>
        c.charger_id === data.charger_id
          ? {
              ...c,
              status: data.status,
              power_kw: data.power_kw,
              price_per_kwh: data.price_per_kwh
            }
          : c
      )
    );

    return {
      success: true,
      message: `Charger Bay #${data.charger_id} telemetry updated by ${currentUser.name} [${currentUser.role}]: Status=${data.status}, Power=${data.power_kw}kW, Tariff=Rs.${data.price_per_kwh.toFixed(2)}/kWh.`
    };
  };

  const removeStation = (stationId: number) => {
    if (!canRemoveStation) {
      return {
        success: false,
        message: `ACCESS DENIED (403 Forbidden): Station decommissioning requires 'ADMIN' privilege. Your role: '${currentUser.role}'.`
      };
    }

    const station = stations.find(s => s.station_id === stationId);
    if (!station) {
      return { success: false, message: `Station #${stationId} not found in database.` };
    }

    // Cascade delete chargers & bookings associated with these chargers
    const chargersToDelete = chargers.filter(c => c.station_id === stationId).map(c => c.charger_id);
    
    setStations(prev => prev.filter(s => s.station_id !== stationId));
    setChargers(prev => prev.filter(c => c.station_id !== stationId));
    setBookings(prev => prev.filter(b => !chargersToDelete.includes(b.charger_id)));

    return {
      success: true,
      message: `Station '${station.station_name}' (ID #${stationId}) decommissioned by ${currentUser.name} [ADMIN]. Foreign key CASCADE deleted ${chargersToDelete.length} dependent chargers from database.`
    };
  };

  const bookSlot = (data: {
    userId: number;
    chargerId: number;
    date: string;
    startTime: string; // HH:mm:ss
    endTime: string;   // HH:mm:ss
    notes: string;
  }) => {
    const bookingUserId = isUser ? currentUser.user_id : data.userId;
    const startTimestamp = `${data.date.trim()} ${data.startTime.trim()}`;
    const endTimestamp = `${data.date.trim()} ${data.endTime.trim()}`;

    // Validate datetime strings
    const startDate = new Date(startTimestamp.replace(' ', 'T'));
    const endDate = new Date(endTimestamp.replace(' ', 'T'));

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return {
        success: false,
        type: 'error' as const,
        message: 'Invalid date or time format. Please provide valid timestamps.'
      };
    }

    if (endDate <= startDate) {
      return {
        success: false,
        type: 'error' as const,
        message: 'End time must be later than start time.'
      };
    }

    // Core ACID Overlap Collision Check Query from BookSlot.java & EVWebServer.java
    // Predicate: (start_time < new_end) AND (end_time > new_start) for CONFIRMED bookings on the same charger bay
    const conflict = bookings.find(b => {
      if (b.charger_id !== data.chargerId || b.booking_status !== 'CONFIRMED') {
        return false;
      }
      const bStart = new Date(b.start_time.replace(' ', 'T')).getTime();
      const bEnd = new Date(b.end_time.replace(' ', 'T')).getTime();
      const nStart = startDate.getTime();
      const nEnd = endDate.getTime();

      return bStart < nEnd && bEnd > nStart;
    });

    if (conflict) {
      return {
        success: false,
        type: 'error' as const,
        message: `DOUBLE-BOOKING REJECTED (ACID Guard): Bay #${data.chargerId} is already reserved by Booking #${conflict.booking_id} from ${conflict.start_time} to ${conflict.end_time}. Please pick another time or choose an alternate bay.`
      };
    }

    const newBookingId = bookings.length > 0 ? Math.max(...bookings.map(b => b.booking_id)) + 1 : 1;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newBooking: Booking = {
      booking_id: newBookingId,
      user_id: bookingUserId,
      charger_id: data.chargerId,
      start_time: startTimestamp,
      end_time: endTimestamp,
      booking_status: 'CONFIRMED',
      notes: data.notes || 'EV Reservation',
      created_at: now
    };

    setBookings(prev => [newBooking, ...prev]);

    return {
      success: true,
      type: 'success' as const,
      bookingId: newBookingId,
      message: `SLOT RESERVATION CONFIRMED: Booking #${newBookingId} successfully registered in MySQL table 'bookings' for Bay #${data.chargerId} (${startTimestamp} to ${endTimestamp})!`
    };
  };

  const cancelBooking = (bookingId: number) => {
    setBookings(prev =>
      prev.map(b => (b.booking_id === bookingId ? { ...b, booking_status: 'CANCELLED' } : b))
    );
    return { success: true, message: `Booking #${bookingId} has been cancelled.` };
  };

  // SQL Query Execution Engine Simulator
  const executeSql = (query: string): SqlResult => {
    const raw = query.trim();
    if (!raw) {
      return { columns: [], rows: [], rowCount: 0, error: 'Empty SQL query provided.' };
    }

    const upper = raw.toUpperCase();

    // 1. SELECT s.station_name, s.city, COUNT(c.charger_id)... GROUP BY
    if (upper.includes('GROUP BY') || (upper.includes('COUNT') && upper.includes('FROM STATIONS'))) {
      const summary = stations.map(s => {
        const bays = chargers.filter(c => c.station_id === s.station_id);
        const avgPrice = bays.length > 0 ? (bays.reduce((acc, b) => acc + b.price_per_kwh, 0) / bays.length).toFixed(2) : '0.00';
        return [s.station_name, s.city, bays.length, `Rs. ${avgPrice}`];
      });
      return {
        columns: ['station_name', 'city', 'total_chargers', 'avg_price_per_kwh'],
        rows: summary,
        rowCount: summary.length
      };
    }

    // 2. SELECT FROM USERS
    if (upper.includes('FROM USERS')) {
      const cols = ['user_id', 'name', 'email', 'phone', 'role', 'created_at'];
      const rows = users.map(u => [u.user_id, u.name, u.email, u.phone, u.role, u.created_at]);
      return { columns: cols, rows, rowCount: rows.length };
    }

    // 3. SELECT FROM STATIONS JOIN CHARGERS
    if (upper.includes('FROM STATIONS') && upper.includes('CHARGERS')) {
      const cols = ['station_id', 'station_name', 'city', 'hours', 'charger_id', 'connector_type', 'power_kw', 'tariff', 'status'];
      const rows: (string | number)[][] = [];
      stations.forEach(s => {
        const stationBays = chargers.filter(c => c.station_id === s.station_id);
        if (stationBays.length === 0) {
          rows.push([s.station_id, s.station_name, s.city, `${s.opening_time} - ${s.closing_time}`, '-', '-', '-', '-', s.status]);
        } else {
          stationBays.forEach(c => {
            rows.push([
              s.station_id,
              s.station_name,
              s.city,
              `${s.opening_time} - ${s.closing_time}`,
              c.charger_id,
              c.connector_type,
              `${c.power_kw} kW`,
              `Rs. ${c.price_per_kwh}`,
              c.status
            ]);
          });
        }
      });
      return { columns: cols, rows, rowCount: rows.length };
    }

    // 4. SELECT FROM STATIONS
    if (upper.includes('FROM STATIONS')) {
      const cols = ['station_id', 'station_name', 'address', 'city', 'opening_time', 'closing_time', 'operator_id', 'status'];
      const rows = stations.map(s => [s.station_id, s.station_name, s.address, s.city, s.opening_time, s.closing_time, s.operator_id, s.status]);
      return { columns: cols, rows, rowCount: rows.length };
    }

    // 5. SELECT FROM CHARGERS
    if (upper.includes('FROM CHARGERS')) {
      const cols = ['charger_id', 'station_id', 'connector_type', 'power_kw', 'price_per_kwh', 'status'];
      const rows = chargers.map(c => [c.charger_id, c.station_id, c.connector_type, c.power_kw, c.price_per_kwh, c.status]);
      return { columns: cols, rows, rowCount: rows.length };
    }

    // 6. SELECT FROM BOOKINGS
    if (upper.includes('FROM BOOKINGS')) {
      const cols = ['booking_id', 'user_id', 'charger_id', 'start_time', 'end_time', 'booking_status', 'notes'];
      const rows = bookings.map(b => [b.booking_id, b.user_id, b.charger_id, b.start_time, b.end_time, b.booking_status, b.notes]);
      return { columns: cols, rows, rowCount: rows.length };
    }

    // 7. SELECT FROM CHARGING_SESSIONS
    if (upper.includes('FROM CHARGING_SESSIONS') || upper.includes('FROM SESSIONS')) {
      const cols = ['session_id', 'booking_id', 'energy_used (kWh)', 'start_time', 'end_time', 'total_cost (Rs.)'];
      const rows = sessions.map(s => [s.session_id, s.booking_id, s.energy_used, s.start_time, s.end_time, s.total_cost]);
      return { columns: cols, rows, rowCount: rows.length };
    }

    // Fallback: general query error or unrecognized table
    return {
      columns: ['status', 'message'],
      rows: [['Query Executed', `Relational mock query executed: "${raw}"`]],
      rowCount: 1
    };
  };

  const resetDatabase = () => {
    localStorage.removeItem(STORAGE_KEY + '_users');
    localStorage.removeItem(STORAGE_KEY + '_stations');
    localStorage.removeItem(STORAGE_KEY + '_chargers');
    localStorage.removeItem(STORAGE_KEY + '_bookings');
    localStorage.removeItem(STORAGE_KEY + '_sessions');
    localStorage.removeItem(STORAGE_KEY + '_curr_user_id');

    setUsers(INITIAL_USERS);
    setStations(INITIAL_STATIONS);
    setChargers(INITIAL_CHARGERS);
    setBookings(INITIAL_BOOKINGS);
    setSessions(INITIAL_SESSIONS);
    setCurrentUserId(1);
  };

  return (
    <DatabaseContext.Provider
      value={{
        users,
        stations,
        chargers,
        bookings,
        sessions,
        currentUser,
        isAdmin,
        isOperator,
        isUser,
        canAddStation,
        canUpdateCharger,
        canRemoveStation,
        canAccessDbmsConsole,
        login,
        signup,
        switchUser,
        logout,
        addStation,
        updateCharger,
        removeStation,
        bookSlot,
        cancelBooking,
        executeSql,
        resetDatabase
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
