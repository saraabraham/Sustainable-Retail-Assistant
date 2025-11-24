import recommendationService from '@/services/recommendationService';

// Mock axios
global.fetch = jest.fn();

describe('RecommendationService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, data: [] })
        });
    });

    describe('getRecommendations', () => {
        it('returns recommendations successfully', async () => {
            const mockResponse = {
                success: true,
                data: [
                    {
                        product: {
                            id: '1',
                            name: 'Test Product',
                            sustainabilityScore: 90,
                            price: 100,
                            category: 'furniture'
                        },
                        score: 85,
                        reasons: []
                    }
                ]
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await recommendationService.getRecommendations('test query');
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
        });

        it('handles API errors gracefully', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => ({ error: 'Server error' })
            });

            const result = await recommendationService.getRecommendations('test query');
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it('handles network errors', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await recommendationService.getRecommendations('test query');
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('processNaturalLanguageQuery', () => {
        it('extracts categories from query', async () => {
            const mockResponse = {
                success: true,
                data: {
                    categories: ['furniture'],
                    priceRange: { min: 0, max: 500 },
                    sustainabilityPriority: 'high'
                }
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await recommendationService.processNaturalLanguageQuery('sustainable furniture under $500');
            expect(result.success).toBe(true);
            expect(result.data?.categories).toContain('furniture');
        });

        it('extracts price range from query', async () => {
            const mockResponse = {
                success: true,
                data: {
                    categories: [],
                    priceRange: { min: 0, max: 200 },
                    sustainabilityPriority: 'medium'
                }
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await recommendationService.processNaturalLanguageQuery('products under $200');
            expect(result.success).toBe(true);
            expect(result.data?.priceRange?.max).toBe(200);
        });
    });

    describe('calculateTCO', () => {
        it('calculates total cost of ownership', async () => {
            const mockResponse = {
                success: true,
                data: {
                    initialCost: 450,
                    energyCostPerYear: 30,
                    maintenanceCostPerYear: 20,
                    totalCost: 700,
                    expectedLifespan: 10,
                    comparisonToAverage: -15
                }
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await recommendationService.calculateTCO('product-1', 5);
            expect(result.success).toBe(true);
            expect(result.data?.initialCost).toBe(450);
            expect(result.data?.totalCost).toBe(700);
        });

        it('includes comparison to category average', async () => {
            const mockResponse = {
                success: true,
                data: {
                    initialCost: 450,
                    energyCostPerYear: 30,
                    maintenanceCostPerYear: 20,
                    totalCost: 700,
                    expectedLifespan: 10,
                    comparisonToAverage: -15
                }
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await recommendationService.calculateTCO('product-1', 5);
            expect(result.data?.comparisonToAverage).toBeDefined();
            expect(typeof result.data?.comparisonToAverage).toBe('number');
        });
    });

    describe('getSustainableAlternative', () => {
        it('finds more sustainable alternatives', async () => {
            const mockResponse = {
                success: true,
                data: {
                    product: {
                        id: 'alt-1',
                        name: 'Sustainable Alternative',
                        sustainabilityScore: 95,
                        price: 480
                    },
                    score: 90,
                    reasons: [
                        {
                            type: 'sustainability',
                            explanation: 'Higher sustainability score',
                            weight: 40
                        }
                    ]
                }
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await recommendationService.getSustainableAlternative('product-1');
            expect(result.success).toBe(true);
            expect(result.data?.product.sustainabilityScore).toBeGreaterThan(0);
        });
    });

    describe('searchProducts', () => {
        it('searches products with filters', async () => {
            const mockResponse = {
                success: true,
                data: [
                    {
                        id: '1',
                        name: 'Product 1',
                        sustainabilityScore: 85,
                        price: 150
                    },
                    {
                        id: '2',
                        name: 'Product 2',
                        sustainabilityScore: 90,
                        price: 180
                    }
                ]
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await recommendationService.searchProducts({
                query: 'furniture',
                filters: {
                    categories: ['furniture'],
                    priceRange: { min: 0, max: 200 }
                }
            });

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(2);
        });
    });
});