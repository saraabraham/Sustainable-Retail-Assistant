import axios, { AxiosInstance } from 'axios';
import {
  Recommendation,
  Product,
  UserPreferences,
  ApiResponse,
  SearchParams,
} from '@/types';

class RecommendationService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Request interceptor for auth tokens
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get personalized recommendations based on user query
   */
  async getRecommendations(
    query: string,
    preferences?: UserPreferences
  ): Promise<ApiResponse<Recommendation[]>> {
    try {
      const response = await this.api.post('/recommendations', {
        query,
        preferences,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'RECOMMENDATION_ERROR',
          message: 'Failed to fetch recommendations',
        },
      };
    }
  }

  /**
   * Get most sustainable alternative for a product
   */
  async getSustainableAlternative(
    productId: string
  ): Promise<ApiResponse<Recommendation>> {
    try {
      const response = await this.api.get(
        `/recommendations/${productId}/sustainable-alternative`
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ALTERNATIVE_ERROR',
          message: 'Failed to fetch sustainable alternative',
        },
      };
    }
  }

  /**
   * Calculate total cost of ownership
   */
  async calculateTCO(productId: string, years: number = 5) {
    try {
      const response = await this.api.get(`/recommendations/${productId}/tco`, {
        params: { years },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TCO_ERROR',
          message: 'Failed to calculate total cost of ownership',
        },
      };
    }
  }

  /**
   * Search products with filters
   */
  async searchProducts(
    params: SearchParams
  ): Promise<ApiResponse<{ products: Product[]; total: number }>> {
    try {
      const response = await this.api.post('/products/search', params);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: 'Failed to search products',
        },
      };
    }
  }

  /**
   * Get similar products
   */
  async getSimilarProducts(
    productId: string,
    limit: number = 5
  ): Promise<ApiResponse<Product[]>> {
    try {
      const response = await this.api.get(`/products/${productId}/similar`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SIMILAR_ERROR',
          message: 'Failed to fetch similar products',
        },
      };
    }
  }

  /**
   * Get trending sustainable products
   */
  async getTrendingProducts(
    category?: string,
    limit: number = 10
  ): Promise<ApiResponse<Product[]>> {
    try {
      const response = await this.api.get('/products/trending', {
        params: { category, limit },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TRENDING_ERROR',
          message: 'Failed to fetch trending products',
        },
      };
    }
  }

  /**
   * Compare multiple products
   */
  async compareProducts(
    productIds: string[]
  ): Promise<ApiResponse<Product[]>> {
    try {
      const response = await this.api.post('/products/compare', {
        productIds,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'COMPARE_ERROR',
          message: 'Failed to compare products',
        },
      };
    }
  }

  /**
   * Process natural language query using Azure Cognitive Services
   */
  async processNaturalLanguageQuery(query: string) {
    try {
      const response = await this.api.post('/nlp/analyze', { query });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NLP_ERROR',
          message: 'Failed to process query',
        },
      };
    }
  }

  /**
   * Save user interaction for learning
   */
  async trackInteraction(interaction: {
    action: string;
    productId?: string;
    query?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      const response = await this.api.post('/user/interactions', interaction);
      return response.data;
    } catch (error) {
      console.error('Failed to track interaction:', error);
      return { success: false };
    }
  }
}

export default new RecommendationService();
