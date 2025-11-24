// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
  sustainabilityScore: number;
  environmentalImpact: EnvironmentalImpact;
  circularEconomyOptions: CircularEconomyOption[];
  specifications: Record<string, any>;
  inStock: boolean;
  tags: string[];
}

export interface EnvironmentalImpact {
  carbonFootprint: number; // kg CO2
  waterUsage: number; // liters
  recyclablePercentage: number;
  energyEfficiency: 'A+++' | 'A++' | 'A+' | 'A' | 'B' | 'C' | 'D';
  certifications: string[];
}

export interface CircularEconomyOption {
  type: 'repair' | 'refurbish' | 'recycle' | 'buyback';
  description: string;
  availableUntil?: Date;
  estimatedValue?: number;
  provider?: string;
}

// User Types
export interface UserProfile {
  id: string;
  preferences: UserPreferences;
  lifestyleData: LifestyleData;
  interactionHistory: InteractionHistory[];
  savedProducts: string[];
  purchaseHistory: PurchaseRecord[];
}

export interface UserPreferences {
  sustainabilityPriority: 'high' | 'medium' | 'low';
  budgetRange: {
    min: number;
    max: number;
  };
  preferredCategories: string[];
  lifestyleType: string;
  environmentalConcerns: string[];
}

export interface LifestyleData {
  householdSize: number;
  livingSpace: 'apartment' | 'house' | 'studio' | 'other';
  location: string;
  interests: string[];
}

export interface InteractionHistory {
  timestamp: Date;
  action: 'view' | 'search' | 'compare' | 'save' | 'purchase';
  productId?: string;
  query?: string;
  metadata?: Record<string, any>;
}

export interface PurchaseRecord {
  productId: string;
  purchaseDate: Date;
  price: number;
  satisfactionScore?: number;
}

// Recommendation Types
export interface Recommendation {
  product: Product;
  score: number;
  reasons: RecommendationReason[];
  alternatives: Product[];
  totalCostOfOwnership: CostAnalysis;
}

export interface RecommendationReason {
  type: 'sustainability' | 'lifestyle' | 'price' | 'quality' | 'popularity';
  explanation: string;
  weight: number;
}

export interface CostAnalysis {
  initialCost: number;
  energyCostPerYear: number;
  maintenanceCostPerYear: number;
  expectedLifespan: number;
  totalCost: number;
  comparisonToAverage: number;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  recommendations?: Recommendation[];
  metadata?: Record<string, any>;
}

export interface ChatContext {
  conversationId: string;
  messages: ChatMessage[];
  userIntent: string;
  extractedEntities: Entity[];
}

export interface Entity {
  type: 'product_category' | 'price_range' | 'sustainability_requirement' | 'feature';
  value: string;
  confidence: number;
}

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: Record<string, any>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Filter Types
export interface ProductFilters {
  categories?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  sustainabilityScore?: {
    min: number;
    max: number;
  };
  inStockOnly?: boolean;
  certifications?: string[];
  energyEfficiency?: string[];
}

export interface SearchParams {
  query: string;
  filters?: ProductFilters;
  sortBy?: 'relevance' | 'price' | 'sustainability' | 'popularity';
  page?: number;
  pageSize?: number;
}

// Component Props Types
export interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  showSustainabilityBadge?: boolean;
  compact?: boolean;
}

export interface ChatInterfaceProps {
  onMessageSend: (message: string) => Promise<void>;
  isLoading?: boolean;
  initialMessage?: string;
}

export interface ProductCarouselProps {
  products: Product[];
  filters?: ProductFilters;
  onFilterChange?: (filters: ProductFilters) => void;
  title?: string;
}

export interface ComparisonMatrixProps {
  products: Product[];
  onRemove?: (productId: string) => void;
  onClear?: () => void;
}
