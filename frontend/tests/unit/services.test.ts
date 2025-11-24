import recommendationService from '@/services/recommendationService';

// Mock axios
jest.mock('axios');

describe('RecommendationService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getRecommendations', () => {
        it('returns recommendations successfully', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: [
                        {
                            product: {
                                id: '1',
                                name: 'Test Product',
                                sustainabilityScore: 90
                            },
                            score: 85,
                            reasons: []
                        }
                    ]
                }
            };

            const axios = require('axios');
            axios.create = jest.fn(() => ({
                post: jest.fn().mockResolvedValue(mockResponse),
                interceptors: {
                    request: { use: jest.fn() },
                    response: { use: jest.fn() }
                }
            }));

            const result = await recommendationService.getRecommendations('test query');
            expect(result.success).toBe(true);
        });
    });

    describe('calculateTCO', () => {
        it('calculates total cost of ownership', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        initialCost: 450,
                        energyCostPerYear: 30,
                        maintenanceCostPerYear: 20,
                        totalCost: 700,
                        expectedLifespan: 10
                    }
                }
            };

            const axios = require('axios');
            axios.create = jest.fn(() => ({
                get: jest.fn().mockResolvedValue(mockResponse),
                interceptors: {
                    request: { use: jest.fn() },
                    response: { use: jest.fn() }
                }
            }));

            const result = await recommendationService.calculateTCO('product-1', 5);
            expect(result.data.initialCost).toBe(450);
        });
    });
});
