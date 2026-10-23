import { expect, test, type Page } from "@playwright/test";

async function signInDemo(page: Page, name: string) {
  await page.goto("/auth");
  await page.getByRole("button", { name: new RegExp(name) }).click();
}

test.describe("public pages", () => {
  test("home renders the hero, catalogue and policy links", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Ghar ki har repair");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("ek tap dur");
    await expect(page.getByRole("heading", { name: /One price/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "AC Gas Filling", exact: true })).toBeVisible();
    await expect(page.getByText("₹3,399").first()).toBeVisible();

    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: "Privacy policy" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Terms of service" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Cancellation & refunds" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Support", exact: true })).toBeVisible();
  });

  test("primary navigation reaches the dedicated pages", async ({ page }) => {
    await page.goto("/");
    const mobile = test.info().project.name === "mobile";

    async function goTo(name: string) {
      if (mobile) {
        await page.getByRole("button", { name: "Open menu" }).click();
        const menu = page.getByRole("dialog", { name: "Site menu" });
        await expect(menu).toBeVisible();
        await menu.getByRole("link", { name, exact: true }).click();
        return;
      }
      await page.locator("header").getByRole("link", { name, exact: true }).click();
    }

    await goTo("Services");
    await expect(page).toHaveURL(/\/services$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Every repair");

    await goTo("How it works");
    await expect(page).toHaveURL(/\/how-it-works$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Booked in two minutes");
    await expect(page.getByRole("heading", { name: "Two OTPs. Zero confusion." })).toBeVisible();

    await goTo("Why Mistri Now");
    await expect(page).toHaveURL(/\/why-mistri-now$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("neighbourhood mistri");
    await expect(page.getByRole("table")).toBeVisible();

    await goTo("Support");
    await expect(page).toHaveURL(/\/support$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("A real person");
    await expect(page.getByRole("heading", { name: /Send us a message/i })).toBeVisible();
  });

  test("legal pages publish draft policies with review notices", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { level: 1, name: "Privacy policy" })).toBeVisible();
    await expect(page.getByText(/attorney review/i).first()).toBeVisible();
    await expect(page.getByText(/₹?8 years|8 years/)).toBeVisible();

    await page.goto("/terms");
    await expect(page.getByRole("heading", { level: 1, name: "Terms of service" })).toBeVisible();

    await page.goto("/refund");
    await expect(
      page.getByRole("heading", { level: 1, name: "Cancellation & refunds" }),
    ).toBeVisible();
    await expect(page.getByText(/5–7 business days|5-7 business days/)).toBeVisible();
  });

  test("support page shows channels and the message form", async ({ page }) => {
    await page.goto("/support");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("A real person");
    await expect(page.getByRole("link", { name: /Call support/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Send us a message/i })).toBeVisible();
    await expect(page.getByLabel("Your name")).toBeVisible();
    await expect(page.getByLabel("Mobile number")).toBeVisible();
    await expect(page.getByRole("button", { name: /Prepare message/i })).toBeVisible();
  });

  test("legacy contact URL redirects to support", async ({ page }) => {
    await page.goto("/contact");
    await expect(page).toHaveURL(/\/support$/);
  });

  test("unknown routes render the 404 page", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");
    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByRole("heading", { name: /moved on to another job/i })).toBeVisible();
  });
});

test.describe("portals", () => {
  test("customer demo sign-in returns to the storefront with an account page", async ({ page }) => {
    await signInDemo(page, "Anjali Sharma");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("link", { name: /Book a service/i }).first()).toBeVisible();

    await page.goto("/account");
    await expect(page.getByRole("heading", { name: /Namaste, Anjali/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Your bookings" })).toBeVisible();
  });

  test("worker demo sign-in lands on the jobs dashboard", async ({ page }) => {
    await signInDemo(page, "Imran Khan");
    await expect(page).toHaveURL(/\/worker\/dashboard$/);
    await expect(page.getByRole("heading", { name: /Namaste, Imran/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Active jobs" })).toBeVisible();
  });

  test("pending worker sees the approval holding screen", async ({ page }) => {
    await signInDemo(page, "Mahesh Chand");
    await expect(page).toHaveURL(/\/worker\/dashboard$/);
    await expect(
      page.getByRole("heading", { name: /application is under review/i }),
    ).toBeVisible();
  });

  test("admin demo sign-in lands on the control room", async ({ page }) => {
    await signInDemo(page, "Platform admin");
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Rewari");
    await expect(page.getByRole("heading", { name: "Orders & revenue" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Approvals/i })).toBeVisible();
  });
});

test.describe("booking flow", () => {
  test("customer can book a service and reach the live detail page", async ({ page }) => {
    await signInDemo(page, "Anjali Sharma");
    await expect(page).toHaveURL(/\/$/);

    const card = page
      .locator("article")
      .filter({ has: page.getByRole("heading", { name: "AC Service", exact: true }) });
    await card.getByRole("button", { name: "Book" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "AC Service" })).toBeVisible();

    await dialog.getByLabel("Service address").fill("24, Model Town, near Jain Chowk, Rewari");
    await dialog.getByRole("button", { name: /Continue/i }).click();

    const slot = dialog.locator("button").filter({ hasText: /(AM|PM)/ }).first();
    await slot.click();
    await dialog.getByRole("button", { name: /Continue/i }).click();

    await expect(dialog.getByText(/Pay after service/i)).toBeVisible();
    await dialog.getByRole("button", { name: /Confirm booking/i }).click();

    await expect(page).toHaveURL(/\/bookings\/[0-9a-f-]+/);
    await expect(page.getByText(/^MRW-[A-Z0-9]{6}$/).first()).toBeVisible();
    await expect(page.getByText("AC Service", { exact: true }).first()).toBeVisible();
  });
});
