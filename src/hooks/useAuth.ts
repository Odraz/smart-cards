import { useContext } from 'react';
import { FirebaseContext, FirebaseContextType } from '@/components/providers/FirebaseProvider';

export const useAuth = (): FirebaseContextType => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context;
};
