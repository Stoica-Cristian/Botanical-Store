interface ProductImage {
    url: string;
    alt: string;
    isPrimary: boolean;
  }
  
  interface ProductSpecification {
    name: string;
    value: string;
  }
  
  interface ProductFeature {
    description: string;
    icon?: string;
  }
  
  interface PlantCareInfo {
    lightRequirement: string;
    wateringFrequency: string;
    temperature: string;
    humidity: string;
    fertilizing: string;
    difficulty: string;
  }
  
  interface Review {
    id: string;
    author: string;
    rating: number;
    date: string;
    comment: string;
    likes: number;
    verified: boolean;
  }
  
  interface  Size {
    label: string;
    value: string;
    inStock: boolean;
  }
  
  interface PotStyle {
    name: string;
    value: string;
    image: string;
  }
  
  interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    rating: number;
    reviewsCount: number;
    scientificName: string;
    category: string;
    images: ProductImage[];
    specifications: ProductSpecification[];
    features: ProductFeature[];
    reviews: Review[];
    careInfo: PlantCareInfo;
    createdAt: string;
    updatedAt: string;
  }

export type { Product };
export type { Size };
export type { PotStyle };
export type { ProductImage };
export type { ProductSpecification };
export type { ProductFeature };
export type { PlantCareInfo };
export type { Review };
