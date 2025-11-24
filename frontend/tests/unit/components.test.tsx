import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatInterface from '@/components/ChatInterface';
import ProductCard from '@/components/ProductCard';
import Cart from '@/components/Cart';

// Mock the recommendation service
jest.mock('@/services/recommendationService', () => ({
    __esModule: true,
    default: {
        getRecommendations: jest.fn(() =>
            Promise.resolve({
                success: true,
                data: []
            })
        ),
        processNaturalLanguageQuery: jest.fn(() =>
            Promise.resolve({
                success: true,
                data: { categories: ['furniture'], priceRange: { min: 0, max: 500 } }
            })
        ),
    }
}));

// Mock data
const mockProduct = {
    id: '1',
    name: 'Eco-Friendly Table',
    description: 'Sustainable bamboo table',
    category: 'furniture',
    price: 450,
    imageUrl: 'https://example.com/image.jpg',
    sustainabilityScore: 92,
    inStock: true,
    environmentalImpact: {
        carbonFootprint: 25.5,
        waterUsage: 150,
        recyclablePercentage: 95,
        energyEfficiency: 'A' as const,
        certifications: ['FSC', 'Fair Trade']
    },
    circularEconomyOptions: [
        { type: 'repair' as const, description: 'Free repair service', available: true }
    ],
    specifications: {},
    tags: ['sustainable', 'bamboo'],
    createdAt: new Date(),
    updatedAt: new Date()
};

describe('ProductCard Component', () => {
    it('renders product information correctly', () => {
        render(<ProductCard product={mockProduct} />);

        expect(screen.getByText('Eco-Friendly Table')).toBeInTheDocument();
        expect(screen.getByText('$450.00')).toBeInTheDocument();
    });

    it('shows sustainability score', () => {
        render(<ProductCard product={mockProduct} showSustainabilityBadge={true} />);

        const score = screen.getByText('92');
        expect(score).toBeInTheDocument();
    });

    it('calls onSelect when clicked', () => {
        const onSelect = jest.fn();
        render(<ProductCard product={mockProduct} onSelect={onSelect} />);

        const card = screen.getByText('Eco-Friendly Table');
        fireEvent.click(card);
        expect(onSelect).toHaveBeenCalledWith(mockProduct);
    });

    it('displays certifications', () => {
        render(<ProductCard product={mockProduct} />);

        expect(screen.getByText('FSC')).toBeInTheDocument();
        expect(screen.getByText('Fair Trade')).toBeInTheDocument();
    });

    it('shows out of stock when not available', () => {
        const outOfStockProduct = { ...mockProduct, inStock: false };
        render(<ProductCard product={outOfStockProduct} />);

        expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    });
});

describe('Cart Component', () => {
    const mockItems = [
        { product: mockProduct, quantity: 1 }
    ];

    it('displays cart item count', () => {
        render(
            <Cart
                items={mockItems}
                onRemove={jest.fn()}
                onClear={jest.fn()}
            />
        );

        expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('opens cart sidebar when clicked', async () => {
        render(
            <Cart
                items={mockItems}
                onRemove={jest.fn()}
                onClear={jest.fn()}
            />
        );

        // Click cart button
        const cartButton = screen.getByRole('button');
        fireEvent.click(cartButton);

        // Wait for sidebar to open
        await waitFor(() => {
            expect(screen.getByText('My Cart')).toBeInTheDocument();
        });
    });

    it('shows sustainability metrics when cart has items', async () => {
        render(
            <Cart
                items={mockItems}
                onRemove={jest.fn()}
                onClear={jest.fn()}
            />
        );

        fireEvent.click(screen.getByRole('button'));

        await waitFor(() => {
            expect(screen.getByText('Sustainability Metrics')).toBeInTheDocument();
        });
    });

    it('calls onClear when clear button clicked', async () => {
        const onClear = jest.fn();
        render(
            <Cart
                items={mockItems}
                onRemove={jest.fn()}
                onClear={onClear}
            />
        );

        fireEvent.click(screen.getByRole('button'));

        await waitFor(() => {
            const clearButton = screen.getByText('Clear Cart');
            fireEvent.click(clearButton);
            expect(onClear).toHaveBeenCalled();
        });
    });

    it('shows empty state when no items', async () => {
        render(
            <Cart
                items={[]}
                onRemove={jest.fn()}
                onClear={jest.fn()}
            />
        );

        fireEvent.click(screen.getByRole('button'));

        await waitFor(() => {
            expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
        });
    });
});

describe('ChatInterface Component', () => {
    it('renders initial greeting message', () => {
        const mockOnRecommendations = jest.fn();
        render(<ChatInterface onRecommendationsReceived={mockOnRecommendations} />);

        expect(screen.getByText(/Hello! I'm your sustainable shopping assistant/i)).toBeInTheDocument();
    });

    it('allows user to type a message', () => {
        const mockOnRecommendations = jest.fn();
        render(<ChatInterface onRecommendationsReceived={mockOnRecommendations} />);

        const input = screen.getByPlaceholderText(/Ask me anything/i);
        fireEvent.change(input, { target: { value: 'sustainable furniture' } });

        expect(input).toHaveValue('sustainable furniture');
    });

    it('disables send button when input is empty', () => {
        const mockOnRecommendations = jest.fn();
        render(<ChatInterface onRecommendationsReceived={mockOnRecommendations} />);

        const sendButton = screen.getByText('Send');
        expect(sendButton).toBeDisabled();
    });

    it('enables send button when input has text', () => {
        const mockOnRecommendations = jest.fn();
        render(<ChatInterface onRecommendationsReceived={mockOnRecommendations} />);

        const input = screen.getByPlaceholderText(/Ask me anything/i);
        fireEvent.change(input, { target: { value: 'test query' } });

        const sendButton = screen.getByText('Send');
        expect(sendButton).not.toBeDisabled();
    });

    it('clears input after sending message', async () => {
        const mockOnRecommendations = jest.fn();
        render(<ChatInterface onRecommendationsReceived={mockOnRecommendations} />);

        const input = screen.getByPlaceholderText(/Ask me anything/i);
        const sendButton = screen.getByText('Send');

        fireEvent.change(input, { target: { value: 'test query' } });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(input).toHaveValue('');
        });
    });
});