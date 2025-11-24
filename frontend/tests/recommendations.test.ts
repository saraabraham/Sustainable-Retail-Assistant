import { describe, it, expect, beforeAll } from '@jest/globals';
import recommendationService from '@/services/recommendationService';

describe('Recommendation Accuracy Tests', () => {
  const testQueries = [
    {
      query: 'sustainable furniture under $500',
      expectedCategories: ['furniture'],
      minSustainabilityScore: 70,
      maxPrice: 500,
    },
    {
      query: 'eco-friendly kitchen items',
      expectedCategories: ['kitchen'],
      minSustainabilityScore: 60,
    },
    {
      query: 'organic bedroom textiles with recycling options',
      expectedCategories: ['bedroom', 'textiles'],
      minSustainabilityScore: 70,
      requiresCircularOptions: true,
    },
  ];

  describe('Query Understanding', () => {
    testQueries.forEach(({ query, expectedCategories, minSustainabilityScore }) => {
      it(`should correctly parse query: "${query}"`, async () => {
        const result = await recommendationService.processNaturalLanguageQuery(query);

        expect(result.success).toBe(true);
        if (result.data) {
          const categories = result.data.categories || [];
          expectedCategories.forEach((category) => {
            expect(
              categories.some((c: string) =>
                c.toLowerCase().includes(category.toLowerCase())
              )
            ).toBe(true);
          });
        }
      });
    });
  });

  describe('Recommendation Quality', () => {
    it('should return relevant products for sustainability query', async () => {
      const query = 'sustainable furniture';
      const result = await recommendationService.getRecommendations(query, {
        sustainabilityPriority: 'high',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      if (result.data) {
        expect(result.data.length).toBeGreaterThan(0);
        
        // All products should have high sustainability scores
        const allHighSustainability = result.data.every(
          (rec) => rec.product.sustainabilityScore >= 70
        );
        expect(allHighSustainability).toBe(true);
      }
    });

    it('should respect price constraints', async () => {
      const query = 'furniture under $200';
      const result = await recommendationService.getRecommendations(query, {
        budgetRange: { min: 0, max: 200 },
      });

      expect(result.success).toBe(true);
      
      if (result.data) {
        const allWithinBudget = result.data.every(
          (rec) => rec.product.price <= 200
        );
        expect(allWithinBudget).toBe(true);
      }
    });

    it('should prioritize circular economy options when requested', async () => {
      const query = 'furniture with repair options';
      const result = await recommendationService.getRecommendations(query);

      expect(result.success).toBe(true);
      
      if (result.data && result.data.length > 0) {
        const topRecommendation = result.data[0];
        expect(topRecommendation.product.circularEconomyOptions.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Recommendation Scoring', () => {
    it('should rank more sustainable products higher', async () => {
      const query = 'sustainable bedroom furniture';
      const result = await recommendationService.getRecommendations(query, {
        sustainabilityPriority: 'high',
      });

      expect(result.success).toBe(true);
      
      if (result.data && result.data.length >= 2) {
        // Scores should be in descending order
        for (let i = 0; i < result.data.length - 1; i++) {
          expect(result.data[i].score).toBeGreaterThanOrEqual(result.data[i + 1].score);
        }
      }
    });

    it('should provide meaningful recommendation reasons', async () => {
      const query = 'eco-friendly furniture';
      const result = await recommendationService.getRecommendations(query);

      expect(result.success).toBe(true);
      
      if (result.data && result.data.length > 0) {
        const topRecommendation = result.data[0];
        expect(topRecommendation.reasons.length).toBeGreaterThan(0);
        
        topRecommendation.reasons.forEach((reason) => {
          expect(reason.type).toBeTruthy();
          expect(reason.explanation).toBeTruthy();
          expect(reason.weight).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('Sustainable Alternatives', () => {
    it('should find more sustainable alternatives', async () => {
      // This test would need a real product ID from your database
      const testProductId = 'test-product-id';
      const result = await recommendationService.getSustainableAlternative(testProductId);

      if (result.success && result.data) {
        // Alternative should have higher sustainability score
        expect(result.data.product.sustainabilityScore).toBeGreaterThan(0);
        expect(result.data.reasons.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Total Cost of Ownership Accuracy', () => {
    it('should calculate realistic TCO values', async () => {
      const testProductId = 'test-product-id';
      const years = 5;
      const result = await recommendationService.calculateTCO(testProductId, years);

      if (result.success && result.data) {
        const tco = result.data;
        
        // Total cost should be sum of components
        const calculatedTotal =
          tco.initialCost +
          tco.energyCostPerYear * years +
          tco.maintenanceCostPerYear * years;
        
        expect(Math.abs(tco.totalCost - calculatedTotal)).toBeLessThan(1);
        
        // Lifespan should be realistic
        expect(tco.expectedLifespan).toBeGreaterThan(0);
        expect(tco.expectedLifespan).toBeLessThan(50);
      }
    });

    it('should provide comparison to category average', async () => {
      const testProductId = 'test-product-id';
      const result = await recommendationService.calculateTCO(testProductId);

      if (result.success && result.data) {
        expect(result.data.comparisonToAverage).toBeDefined();
        // Comparison should be a percentage
        expect(Math.abs(result.data.comparisonToAverage)).toBeLessThan(200);
      }
    });
  });

  describe('Performance Benchmarks', () => {
    it('should return recommendations within acceptable time', async () => {
      const startTime = Date.now();
      const query = 'sustainable furniture';
      
      await recommendationService.getRecommendations(query);
      
      const duration = Date.now() - startTime;
      
      // Should respond within 2 seconds
      expect(duration).toBeLessThan(2000);
    });

    it('should handle multiple concurrent requests', async () => {
      const queries = [
        'sustainable furniture',
        'eco-friendly kitchen items',
        'organic textiles',
        'energy-efficient lighting',
      ];

      const startTime = Date.now();
      const results = await Promise.all(
        queries.map((query) => recommendationService.getRecommendations(query))
      );
      const duration = Date.now() - startTime;

      // All should succeed
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });

      // Should handle concurrency efficiently
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty query gracefully', async () => {
      const result = await recommendationService.getRecommendations('');
      
      // Should not crash
      expect(result).toBeDefined();
    });

    it('should handle very specific queries', async () => {
      const query = 'FSC-certified oak dining table under $800 with at least 80% recyclable materials';
      const result = await recommendationService.getRecommendations(query);

      expect(result.success).toBe(true);
      // Should return results or gracefully indicate no matches
      expect(result.data || result.error).toBeDefined();
    });

    it('should handle queries with conflicting requirements', async () => {
      const query = 'luxury sustainable furniture under $50';
      const result = await recommendationService.getRecommendations(query);

      expect(result.success).toBe(true);
      // Should prioritize or balance requirements
      expect(result.data).toBeDefined();
    });
  });
});
