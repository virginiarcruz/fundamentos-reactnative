import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsLoaded = await AsyncStorage.getItem('@GoMarketPlace: cart');

      if (productsLoaded) {
        setProducts(JSON.parse(productsLoaded));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const existProductOnCart = products.find(item => item.id === product.id);
      if (existProductOnCart) {
        const updatedProduct: Product = {
          id: existProductOnCart.id,
          title: existProductOnCart.title,
          image_url: existProductOnCart.image_url,
          price: existProductOnCart.price,
          quantity: existProductOnCart.quantity + 1,
        };
        const updatedList: Product[] = products.filter(
          item => item.id !== updatedProduct.id,
        );

        setProducts([...updatedList, updatedProduct]);

        await AsyncStorage.setItem(
          '@GoMarketPlace: cart',
          JSON.stringify([...updatedList, updatedProduct]),
        );
      }

      if (!existProductOnCart) {
        const newProductOnCart: Product = {
          id: product.id,
          title: product.title,
          image_url: product.image_url,
          price: Number(product.price),
          quantity: 1,
        };

        setProducts([...products, newProductOnCart]);

      }

      await AsyncStorage.setItem(
        '@GoMarketPlace: cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newList: Product[] = products.map(item => {
        if (item.id === id) {
          const newQuantity: Product = {
            id: item.id,
            title: item.title,
            image_url: item.image_url,
            price: item.price,
            quantity: item.quantity + 1,
          };
          return newQuantity;
        }
        return item;
      });
      setProducts(newList);

      await AsyncStorage.setItem(
        '@GoMarketPlace: cart',
        JSON.stringify(newList),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const checkItem: Product | undefined = products.find(
        item => item.id === id,
      );

      if (checkItem !== undefined) {
        if (checkItem.quantity === 1) {
          const newList = products.filter(item => item.id !== id);

          setProducts(newList);

        } else {
          const newList: Product[] = products.map(item => {
            if (item.id === id) {
              const newQuantity: Product = {
                id: item.id,
                title: item.title,
                image_url: item.image_url,
                price: item.price,
                quantity: item.quantity - 1,
              };
              return newQuantity;
            }
            return item;
          });

          setProducts(newList);

        }
      }
      await AsyncStorage.setItem(
        '@GoMarketPlace: cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
