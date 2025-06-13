"use client";

import React, { ReactNode } from 'react';
import { FirebaseProvider } from './FirebaseProvider';

interface ProvidersProps {
  children: ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <FirebaseProvider>
      {children}
    </FirebaseProvider>
  );
};

export default Providers;
