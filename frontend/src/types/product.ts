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
    _id?: string;
    user: {
      _id: string;
      name: string;
      avatar?: string;
    };
    name: string;
    rating: number;
    comment: string;
    verified: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  interface Pot {
    _id?: string;
    name: string;
    image: string;
    quantity: number;
    createdAt?: string;
    updatedAt?: string;
  }
  
  interface Product {
    _id: string;
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
export type { Pot };
export type { ProductImage };
export type { ProductSpecification };
export type { ProductFeature };
export type { PlantCareInfo };
export type { Review };
