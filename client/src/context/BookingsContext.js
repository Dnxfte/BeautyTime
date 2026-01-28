import React, { createContext, useMemo, useState } from 'react';
import { getTomorrowStr } from '../utils/dates';

export const BookingsContext = createContext(null);

export function BookingsProvider({ children }) {
  const [bookings, setBookings] = useState([
    {
      id: '1',
      date: `${getTomorrowStr()} о 18:30`,
      master: 'Мельник Олена',
      address: 'Київ, проспект. Червоної Калини 14/13',
      status: 'active',
    },
  ]);

  const addBooking = (newBooking) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  const cancelBooking = (id) => {
    setBookings((prev) => prev.map((item) => (
      item.id === id ? { ...item, status: 'cancelled' } : item
    )));
  };

  const value = useMemo(() => ({ bookings, addBooking, cancelBooking }), [bookings]);

  return (
    <BookingsContext.Provider value={value}>
      {children}
    </BookingsContext.Provider>
  );
}
