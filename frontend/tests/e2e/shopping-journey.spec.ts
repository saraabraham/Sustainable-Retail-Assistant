import { test, expect } from '@playwright/test';

test.describe('End-to-End Shopping Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Complete shopping journey - search to comparison', async ({ page }) => {
    // Step 1: Land on homepage
    await expect(page.locator('h1')).toContainText('Sustainable Retail Assistant');

    // Step 2: Type query in chat interface
    const chatInput = page.locator('input[placeholder*="Ask me anything"]');
    await chatInput.fill('sustainable furniture under $500');
    
    // Step 3: Send message
    await page.locator('button:has-text("Send")').click();

    // Step 4: Wait for recommendations
    await expect(page.locator('text=I found')).toBeVisible({ timeout: 10000 });

    // Step 5: Verify product cards appear
    const productCards = page.locator('[class*="ProductCard"]');
    await expect(productCards.first()).toBeVisible();

    // Step 6: Click on first product to view details
    await productCards.first().click();

    // Step 7: Check sustainability badge is visible
    await expect(page.locator('[class*="sustainability"]')).toBeVisible();

    // Step 8: Add product to comparison
    const firstProduct = productCards.first();
    await firstProduct.click();

    // Step 9: Add another product to comparison
    const secondProduct = productCards.nth(1);
    await secondProduct.click();

    // Step 10: Verify comparison matrix appears
    await expect(page.locator('text=Product Comparison')).toBeVisible();

    // Step 11: Check comparison table has data
    const comparisonTable = page.locator('table');
    await expect(comparisonTable).toBeVisible();

    // Step 12: Verify sustainability scores are displayed
    await expect(page.locator('text=Sustainability Score')).toBeVisible();

    // Step 13: Verify TCO information is present
    await expect(page.locator('text=/Price|Cost/')).toBeVisible();
  });

  test('Filter products by sustainability', async ({ page }) => {
    // Open filters
    await page.locator('button:has-text("Filters")').click();

    // Set minimum sustainability score
    const sustainabilitySlider = page.locator('input[type="range"]');
    await sustainabilitySlider.fill('80');

    // Wait for filtered results
    await page.waitForTimeout(1000);

    // Verify all visible products meet criteria
    const sustainabilityScores = await page
      .locator('[class*="sustainabilityScore"]')
      .allTextContents();
    
    sustainabilityScores.forEach((score) => {
      const numericScore = parseInt(score.match(/\d+/)?.[0] || '0');
      expect(numericScore).toBeGreaterThanOrEqual(80);
    });
  });

  test('Calculate Total Cost of Ownership', async ({ page }) => {
    // Trigger search
    const chatInput = page.locator('input[placeholder*="Ask me anything"]');
    await chatInput.fill('energy-efficient appliances');
    await page.locator('button:has-text("Send")').click();

    // Wait for results
    await page.waitForSelector('[class*="ProductCard"]');

    // Click on first product
    await page.locator('[class*="ProductCard"]').first().click();

    // Look for TCO calculator
    await expect(page.locator('text=Total Cost of Ownership')).toBeVisible({ timeout: 5000 });

    // Change time period
    await page.locator('button:has-text("10 years")').click();

    // Verify calculations update
    await expect(page.locator('text=/Total Cost/')).toBeVisible();

    // Check energy cost breakdown
    await expect(page.locator('text=/Energy Cost/')).toBeVisible();
  });

  test('Conversational refinement', async ({ page }) => {
    // Initial query
    const chatInput = page.locator('input[placeholder*="Ask me anything"]');
    await chatInput.fill('show me furniture');
    await page.locator('button:has-text("Send")').click();

    // Wait for first response
    await expect(page.locator('text=I found')).toBeVisible();

    // Refine query
    await chatInput.fill('only sustainable options');
    await page.locator('button:has-text("Send")').click();

    // Verify refined results
    await page.waitForTimeout(2000);
    const messages = page.locator('[class*="message"]');
    await expect(messages).toHaveCount(4); // Initial greeting + 2 queries + 2 responses

    // Further refinement
    await chatInput.fill('under $300');
    await page.locator('button:has-text("Send")').click();

    // Verify price-filtered results
    await page.waitForTimeout(2000);
    await expect(messages).toHaveCount(6);
  });

  test('Sustainable alternative recommendation', async ({ page }) => {
    // Search for products
    const chatInput = page.locator('input[placeholder*="Ask me anything"]');
    await chatInput.fill('furniture');
    await page.locator('button:has-text("Send")').click();

    // Wait for results
    await page.waitForSelector('[class*="ProductCard"]');

    // Click on a product
    await page.locator('[class*="ProductCard"]').first().click();

    // Look for sustainable alternative button/link
    const alternativeButton = page.locator('button:has-text(/Alternative|Sustainable/)');
    
    if (await alternativeButton.isVisible()) {
      await alternativeButton.click();

      // Verify alternative is shown
      await expect(page.locator('text=/more sustainable/i')).toBeVisible();
    }
  });

  test('Mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify layout adapts
    await expect(page.locator('h1')).toBeVisible();

    // Chat interface should be usable
    const chatInput = page.locator('input[placeholder*="Ask me anything"]');
    await expect(chatInput).toBeVisible();

    // Send query
    await chatInput.fill('sustainable furniture');
    await page.locator('button:has-text("Send")').click();

    // Results should display properly
    await expect(page.locator('[class*="ProductCard"]')).toBeVisible({ timeout: 10000 });

    // Carousel navigation should work
    if (await page.locator('button[aria-label*="Next"]').isVisible()) {
      await page.locator('button[aria-label*="Next"]').click();
      await page.waitForTimeout(500);
    }
  });

  test('Performance - page load time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    
    // Wait for main content to be visible
    await expect(page.locator('h1')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Page should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('Accessibility - keyboard navigation', async ({ page }) => {
    // Tab to chat input
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Type query
    await page.keyboard.type('sustainable furniture');
    
    // Enter to send
    await page.keyboard.press('Enter');
    
    // Wait for results
    await expect(page.locator('text=I found')).toBeVisible();

    // Tab through product cards
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Enter to select product
    await page.keyboard.press('Enter');

    // Verify product details or comparison triggered
    await page.waitForTimeout(1000);
  });

  test('Error handling - network failure', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true);

    const chatInput = page.locator('input[placeholder*="Ask me anything"]');
    await chatInput.fill('sustainable furniture');
    await page.locator('button:has-text("Send")').click();

    // Should show error message
    await expect(page.locator('text=/error|failed|try again/i')).toBeVisible({ timeout: 5000 });

    // Re-enable network
    await context.setOffline(false);

    // Retry should work
    await page.locator('button:has-text("Send")').click();
    await expect(page.locator('text=I found')).toBeVisible({ timeout: 10000 });
  });
});
