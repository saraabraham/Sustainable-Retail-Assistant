
import { test, expect } from '@playwright/test';

test.describe('Complete Shopping Flow', () => {
    test('user can search, view products, add to cart, and checkout', async ({ page }) => {
        // Navigate to homepage
        await page.goto('http://localhost:3000');

        // Verify page loaded
        await expect(page.locator('h1')).toContainText('Sustainable Retail Assistant');

        // Search for products
        await page.fill('input[placeholder*="Ask me anything"]', 'eco-friendly kitchen items under $200');
        await page.click('button:has-text("Send")');

        // Wait for recommendations
        await expect(page.locator('text=I found')).toBeVisible({ timeout: 15000 });

        // Click on first product to add to cart
        await page.locator('[class*="ProductCard"]').first().click();
        await page.waitForTimeout(1000);

        // Verify cart badge shows 1 item
        await expect(page.locator('text=1')).toBeVisible();

        // Open cart
        await page.click('button:has([class*="ShoppingCart"])');

        // Verify cart shows product
        await expect(page.locator('text=My Cart')).toBeVisible();
        await expect(page.locator('text=Sustainability Metrics')).toBeVisible();

        // Proceed to checkout
        await page.click('button:has-text("Proceed to Checkout")');

        // Fill Step 1: Personal Info
        await page.fill('input[name="firstName"]', 'John');
        await page.fill('input[name="lastName"]', 'Doe');
        await page.fill('input[name="email"]', 'john@example.com');
        await page.fill('input[name="phone"]', '555-1234');
        await page.click('button:has-text("Continue")');

        // Fill Step 2: Shipping
        await page.fill('input[name="address"]', '123 Main St');
        await page.fill('input[name="city"]', 'San Francisco');
        await page.fill('input[name="state"]', 'CA');
        await page.fill('input[name="zipCode"]', '94102');
        await page.click('button:has-text("Continue")');

        // Fill Step 3: Payment
        await page.fill('input[name="cardNumber"]', '4111111111111111');
        await page.fill('input[name="cardName"]', 'John Doe');
        await page.fill('input[name="expiryDate"]', '12/25');
        await page.fill('input[name="cvv"]', '123');
        await page.click('button:has-text("Place Order")');

        // Verify success message
        await expect(page.locator('text=Order Confirmed')).toBeVisible({ timeout: 5000 });
    });

    test('sustainability metrics update correctly', async ({ page }) => {
        await page.goto('http://localhost:3000');

        // Search for products
        await page.fill('input[placeholder*="Ask me anything"]', 'sustainable furniture');
        await page.click('button:has-text("Send")');
        await page.waitForTimeout(3000);

        // Add multiple products
        const products = page.locator('[class*="ProductCard"]');
        await products.nth(0).click();
        await page.waitForTimeout(500);
        await products.nth(1).click();
        await page.waitForTimeout(500);

        // Open cart
        await page.click('button:has([class*="ShoppingCart"])');

        // Verify metrics are displayed
        await expect(page.locator('text=Avg. Score')).toBeVisible();
        await expect(page.locator('text=Carbon')).toBeVisible();
        await expect(page.locator('text=Water')).toBeVisible();
        await expect(page.locator('text=Recyclable')).toBeVisible();
    });

    test('TCO calculator works correctly', async ({ page }) => {
        await page.goto('http://localhost:3000');

        // Search and get products
        await page.fill('input[placeholder*="Ask me anything"]', 'furniture');
        await page.click('button:has-text("Send")');
        await page.waitForTimeout(3000);

        // Click View TCO Calculator
        await page.click('button:has-text("View TCO Calculator")');

        // Verify TCO modal opens
        await expect(page.locator('text=Total Cost of Ownership')).toBeVisible();

        // Change time period
        await page.click('button:has-text("10 years")');
        await page.waitForTimeout(1000);

        // Verify calculations displayed
        await expect(page.locator('text=Initial Cost')).toBeVisible();
        await expect(page.locator('text=Energy Cost/Year')).toBeVisible();
        await expect(page.locator('text=Expected Lifespan')).toBeVisible();
    });
});

test.describe('Performance Tests', () => {
    test('page loads within 3 seconds', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('http://localhost:3000');
        await expect(page.locator('h1')).toBeVisible();
        const loadTime = Date.now() - startTime;

        expect(loadTime).toBeLessThan(3000);
    });

    test('search returns results within 5 seconds', async ({ page }) => {
        await page.goto('http://localhost:3000');

        const startTime = Date.now();
        await page.fill('input[placeholder*="Ask me anything"]', 'sustainable furniture');
        await page.click('button:has-text("Send")');
        await expect(page.locator('text=I found')).toBeVisible();
        const searchTime = Date.now() - startTime;

        expect(searchTime).toBeLessThan(5000);
    });
});
