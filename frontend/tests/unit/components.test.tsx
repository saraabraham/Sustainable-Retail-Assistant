
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatInterface from '@/components/ChatInterface';
import ProductCard from '@/components/ProductCard';
import Cart from '@/components/Cart';

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
        energyEfficiency: 'A',
        certifications: ['FSC', 'Fair Trade']
    },
    circularEconomyOptions: [
        { type: 'repair', description: 'Free repair service' }
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
        expect(screen.getByText('92')).toBeInTheDocument();
    });

    it('shows sustainability badge', () => {
        render(<ProductCard product={mockProduct} showSustainabilityBadge={true} />);

        const badge = screen.getByText('92');
        expect(badge).toBeInTheDocument();
    });

    it('calls onSelect when clicked', () => {
        const onSelect = jest.fn();
        render(<ProductCard product={mockProduct} onSelect={onSelect} />);

        fireEvent.click(screen.getByText('Eco-Friendly Table'));
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

    it('calculates total price correctly', () => {
        render(
            <Cart
                items={mockItems}
                onRemove={jest.fn()}
                onClear={jest.fn()}
            />
        );

        fireEvent.click(screen.getByRole('button'));

        waitFor(() => {
            expect(screen.getByText('$450.00')).toBeInTheDocument();
        });
    });

    it('shows sustainability metrics', () => {
        render(
            <Cart
                items={mockItems}
                onRemove={jest.fn()}
                onClear={jest.fn()}
            />
        );

        fireEvent.click(screen.getByRole('button'));

        waitFor(() => {
            expect(screen.getByText('Sustainability Metrics')).toBeInTheDocument();
        });
    });

    it('calls onClear when clear button clicked', () => {
        const onClear = jest.fn();
        render(
            <Cart
                items={mockItems}
                onRemove={jest.fn()}
                onClear={onClear}
            />
        );

        fireEvent.click(screen.getByRole('button'));

        waitFor(() => {
            const clearButton = screen.getByText('Clear Cart');
            fireEvent.click(clearButton);
            expect(onClear).toHaveBeenCalled();
        });
    });
});

describe('ChatInterface Component', () => {
    it('renders initial greeting message', () => {
        render(<ChatInterface />);

        expect(screen.getByText(/Hello! I'm your sustainable shopping assistant/i)).toBeInTheDocument();
    });

    it('allows user to type a message', () => {
        render(<ChatInterface />);

        const input = screen.getByPlaceholderText(/Ask me anything/i);
        fireEvent.change(input, { target: { value: 'sustainable furniture' } });

        expect(input).toHaveValue('sustainable furniture');
    });

    it('disables send button when input is empty', () => {
        render(<ChatInterface />);

        const sendButton = screen.getByText('Send');
        expect(sendButton).toBeDisabled();
    });
});



