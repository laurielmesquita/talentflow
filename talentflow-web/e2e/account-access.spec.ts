import { expect, test } from "@playwright/test";

test.describe("Acesso à conta", () => {
  test("aplica o mínimo de oito caracteres ao cadastro", async ({ page }) => {
    await page.goto("/login?signup=true");

    await expect(page.getByLabel("Nome completo")).toBeVisible();
    const password = page.getByLabel("Senha de acesso");
    await expect(password).toHaveAttribute("minlength", "8");
    await password.fill("1234567");
    expect(await password.evaluate((input) => (input as HTMLInputElement).validity.valid)).toBe(false);
  });

  test("permite revelar a senha por teclado durante a redefinição", async ({ page }) => {
    await page.goto("/reset-password?token=token-de-teste");

    const password = page.getByLabel("Nova Senha", { exact: true });
    const revealPassword = page.getByRole("button", { name: "Mostrar senha" });
    await expect(password).toHaveAttribute("minlength", "8");

    await revealPassword.press("Enter");

    await expect(password).toHaveAttribute("type", "text");
    await expect(page.getByRole("button", { name: "Ocultar senha" })).toHaveAttribute("aria-pressed", "true");
  });

  test("anuncia a confirmação de recuperação de senha", async ({ page }) => {
    await page.route(/\/api\/auth\/forgot-password$/, async (route) => {
      await route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });
    await page.goto("/forgot-password");

    await page.getByLabel("E-mail cadastrado").fill("pessoa@empresa.com");
    await page.getByRole("button", { name: "Enviar Link de Recuperação" }).click();

    await expect(page.getByRole("status")).toContainText("E-mail de Recuperação Enviado");
  });
});
