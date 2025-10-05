'use client';

import React, { createContext, useContext, useState } from 'react';
import { useSession } from 'next-auth/react';
import SignUpModal from './SignUpModal';

const AuthContext = createContext();

export const useAuthModal = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestedFeature, setRequestedFeature] = useState('');
  const { data: session } = useSession();

  const requireAuth = (feature = '') => {
    if (!session) {
      setRequestedFeature(feature);
      setIsModalOpen(true);
      return false;
    }
    return true;
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setRequestedFeature('');
  };

  return (
    <AuthContext.Provider value={{ requireAuth, isModalOpen, requestedFeature }}>
      {children}
      <SignUpModal
        isOpen={isModalOpen}
        onClose={closeModal}
        feature={requestedFeature}
      />
    </AuthContext.Provider>
  );
}
