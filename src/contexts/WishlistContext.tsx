import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  scent?: string;
  image?: string;
  addedAt: Date;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  addToWishlist: (item: Omit<WishlistItem, 'id' | 'addedAt'>) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (name: string, scent?: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  const wishlistCount = wishlistItems.length;

  const addToWishlist = (newItem: Omit<WishlistItem, 'id' | 'addedAt'>) => {
    // Check if item already exists
    const existingItem = wishlistItems.find(
      item => item.name === newItem.name && item.scent === newItem.scent
    );

    if (existingItem) {
      return;
    }

    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const wishlistItem: WishlistItem = {
      ...newItem,
      id,
      addedAt: new Date()
    };

    setWishlistItems(items => [...items, wishlistItem]);
  };

  const removeFromWishlist = (id: string) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
  };

  const isInWishlist = (name: string, scent?: string) => {
    return wishlistItems.some(item => item.name === name && item.scent === scent);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const value = {
    wishlistItems,
    wishlistCount,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};