const { test, expect } = require('@playwright/test');

test.describe('Anto Melody Maker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3335');
  });

  test('page loads with title "Anto Melody Maker"', async ({ page }) => {
    await expect(page).toHaveTitle('Anto Melody Maker');
    await expect(page.locator('h1')).toHaveText('Anto Melody Maker');
  });

  test('grid renders with 12 rows (8 melody + 4 drums) and 16 columns (192 cells total)', async ({ page }) => {
    const rows = page.locator('.grid-row');
    await expect(rows).toHaveCount(12);

    const cells = page.locator('.cell');
    await expect(cells).toHaveCount(192);
  });

  test('last 4 rows are drum rows with drum class', async ({ page }) => {
    const drumCells = page.locator('.cell.drum');
    await expect(drumCells).toHaveCount(64); // 4 rows x 16 cols
  });

  test('separator exists between melody and drum sections', async ({ page }) => {
    const separator = page.locator('.grid-separator');
    await expect(separator).toHaveCount(1);
  });

  test('cells toggle on click (active/inactive)', async ({ page }) => {
    const firstCell = page.locator('.cell').first();

    // Initially not active
    await expect(firstCell).not.toHaveClass(/active/);

    // Click to activate
    await firstCell.click();
    await expect(firstCell).toHaveClass(/active/);

    // Click again to deactivate
    await firstCell.click();
    await expect(firstCell).not.toHaveClass(/active/);
  });

  test('play button toggles play/stop state', async ({ page }) => {
    const playBtn = page.locator('#play-btn');
    await expect(playBtn).toContainText('Play');

    await playBtn.click();
    await expect(playBtn).toContainText('Stop');
    await expect(playBtn).toHaveClass(/playing/);

    await playBtn.click();
    await expect(playBtn).toContainText('Play');
    await expect(playBtn).not.toHaveClass(/playing/);
  });

  test('BPM slider updates displayed value', async ({ page }) => {
    const slider = page.locator('#bpm-slider');
    const bpmValue = page.locator('#bpm-value');

    await expect(bpmValue).toHaveText('120');

    await slider.fill('150');
    await expect(bpmValue).toHaveText('150');
  });

  test('clear button resets all cells', async ({ page }) => {
    const cells = page.locator('.cell');
    await cells.nth(0).click();
    await cells.nth(5).click();
    await cells.nth(20).click();

    await expect(cells.nth(0)).toHaveClass(/active/);
    await expect(cells.nth(5)).toHaveClass(/active/);

    await page.locator('#clear-btn').click();

    const activeCells = page.locator('.cell.active');
    await expect(activeCells).toHaveCount(0);
  });

  test('visual canvas exists and has dimensions', async ({ page }) => {
    const canvas = page.locator('#visual-canvas');
    await expect(canvas).toBeVisible();

    const width = await canvas.evaluate(el => el.width);
    const height = await canvas.evaluate(el => el.height);
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });

  test('save and load buttons exist', async ({ page }) => {
    const saveBtn = page.locator('#save-btn');
    const loadBtn = page.locator('#load-btn');
    await expect(saveBtn).toBeVisible();
    await expect(loadBtn).toBeVisible();
  });

  test('save stores data and load shows list', async ({ page }) => {
    // Activate a cell
    await page.locator('.cell').first().click();

    // Mock prompt to return a name
    await page.evaluate(() => {
      window.prompt = () => 'Test Melody';
    });

    // Save
    await page.locator('#save-btn').click();

    // Open load dropdown
    await page.locator('#load-btn').click();

    // Should show the saved item
    const loadItem = page.locator('.load-item');
    await expect(loadItem).toHaveCount(1);
    await expect(loadItem.locator('.load-item-name')).toHaveText('Test Melody');
  });

  test('click load item loads state (cell becomes active)', async ({ page }) => {
    // Activate cell at row 0, col 0
    const firstCell = page.locator('.cell').first();
    await firstCell.click();
    await expect(firstCell).toHaveClass(/active/);

    // Mock prompt and save
    await page.evaluate(() => {
      window.prompt = () => 'Load Test';
    });
    await page.locator('#save-btn').click();

    // Clear all cells
    await page.locator('#clear-btn').click();
    await expect(firstCell).not.toHaveClass(/active/);

    // Open load dropdown and click item
    await page.locator('#load-btn').click();
    await page.locator('.load-item').first().click();

    // Cell should be active again
    await expect(firstCell).toHaveClass(/active/);
  });

  test('delete removes save from list', async ({ page }) => {
    // Mock prompt and save
    await page.evaluate(() => {
      window.prompt = () => 'Delete Test';
    });
    await page.locator('#save-btn').click();

    // Open load dropdown
    await page.locator('#load-btn').click();
    await expect(page.locator('.load-item')).toHaveCount(1);

    // Click delete button
    await page.locator('.load-item-delete').first().click();
    await expect(page.locator('.load-item')).toHaveCount(0);
  });

  test('sequencer highlights current column when playing', async ({ page }) => {
    await page.locator('.cell').first().click();

    await page.locator('#play-btn').click();

    await page.waitForTimeout(600);

    const currentStepCells = page.locator('.cell.current-step');
    const count = await currentStepCells.count();
    expect(count).toBeGreaterThan(0);

    await page.locator('#play-btn').click();

    await expect(page.locator('.cell.current-step')).toHaveCount(0);
  });
});
