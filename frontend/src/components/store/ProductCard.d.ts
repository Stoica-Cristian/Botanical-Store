import { ReactElement } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
}

interface ProductCardProps {
  product: Product;
}

declare const ProductCard: (props: ProductCardProps) => ReactElement;

export default ProductCard; 