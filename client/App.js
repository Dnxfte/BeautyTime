import React from 'react';
import { BookingsProvider } from './src/context/BookingsContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <BookingsProvider>
      <RootNavigator />
    </BookingsProvider>
  );
}
