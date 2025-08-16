import { useState, useEffect } from 'react';
import { database } from '../supabase';

interface StockInfo {
  isLoading: boolean;
  stock: number | null;
  isOutOfStock: boolean;
  isLowStock: boolean;
}

export function useProductStock(productId: string | null): StockInfo {
  const [stockInfo, setStockInfo] = useState<StockInfo>({
    isLoading: true,
    stock: null,
    isOutOfStock: false,
    isLowStock: false
  });

  useEffect(() => {
    if (!productId) {
      setStockInfo({
        isLoading: false,
        stock: null,
        isOutOfStock: true,
        isLowStock: false
      });
      return;
    }

    const fetchStock = async () => {
      try {
        setStockInfo(prev => ({ ...prev, isLoading: true }));
        
        const { data, error } = await database.getProduct(productId);
        
        if (error) {
          // Handle network errors gracefully
          if (error.code === 'NETWORK_ERROR') {
            setStockInfo({
              isLoading: false,
              stock: null,
              isOutOfStock: false,
              isLowStock: false
            });
            return;
          }
          
          setStockInfo({
            isLoading: false,
            stock: null,
            isOutOfStock: true,
            isLowStock: false
          });
          return;
        }

        const stock = data?.stock_quantity ?? 0;
        
        setStockInfo({
          isLoading: false,
          stock,
          isOutOfStock: stock <= 0,
          isLowStock: stock > 0 && stock <= 5
        });
      } catch (error) {
        setStockInfo({
          isLoading: false,
          stock: null,
          isOutOfStock: true,
          isLowStock: false
        });
      }
    };

    fetchStock();
  }, [productId]);

  return stockInfo;
}