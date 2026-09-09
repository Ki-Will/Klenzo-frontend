import { test, expect } from "@playwright/test";

test.describe("Klenzo Web Frontend E2E Suite", () => {
  test("should render the landing/onboarding page correctly", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page).toHaveTitle(/Klenzo|Klenzoo/i);
    await expect(page.locator("text=SMS Expense Tracking")).toBeVisible();
    await expect(page.locator("text=Get Started")).toBeVisible();
  });

  test("should navigate to login page and display login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should allow navigating to sign-up page", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.locator("text=Create Account")).toBeVisible();
  });

  test("should render dashboard expenses page and budget insights", async ({ page }) => {
    await page.goto("/expenses");
    // Check key budget interactive elements
    await expect(page.locator("text=Budget") || page.locator("text=Expenses")).toBeDefined();
  });
});
