import { test, expect } from "@playwright/test";
test("landing, catalog, gallery and materials", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Пространство",
  );
  await page.getByRole("button", { name: "Минимализм", exact: true }).click();
  await expect(page.locator(".catalog-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Открыть фото кухни Linea" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Следующее фото" }).click();
  await page.getByRole("button", { name: "Закрыть", exact: true }).click();
  await page.getByRole("button", { name: "Сравнить материалы" }).click();
  await expect(page.locator(".material-compare")).toBeVisible();
  await page.getByLabel("Материал 1", { exact: true }).selectOption("wood");
  await page.getByRole("button", { name: "Закрыть", exact: true }).click();
});
test("planner layouts, invalid resize, materials, save, history and import", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Спроектировать кухню", exact: true })
    .click();
  await page.getByRole("button", { name: "Г-образная", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Продолжить", exact: true })
    .click();
  await expect(page.locator(".project-summary")).toContainText("Г-образная");
  await page.getByRole("button", { name: "Шаг 2: Размеры" }).click();
  const a = page.getByLabel("Стена A", { exact: true });
  await a.fill("180");
  await a.press("Tab");
  await expect(page.getByRole("status")).toBeVisible();
  await expect(a).toHaveValue("360");
  await page.getByRole("button", { name: "Шаг 4: Фасады" }).click();
  await page.getByLabel("Материал фасадов").selectOption("wood");
  await page.getByRole("button", { name: "Оливковый", exact: true }).click();
  const total = await page.locator(".estimate-total").innerText();
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await page
    .locator(".config-heading")
    .getByRole("button", { name: /Мои проекты/ })
    .click();
  await expect(page.locator(".saved-projects article")).toHaveCount(1);
  await page.getByRole("button", { name: "Закрыть", exact: true }).click();
  await page.getByRole("button", { name: "Отменить", exact: true }).click();
  await page.getByRole("button", { name: "Повторить", exact: true }).click();
  await expect(page.locator(".estimate-total")).toHaveText(total);
  await page.reload();
  await expect(page.locator(".project-summary")).toContainText("Г-образная");
  const draft = await page.evaluate(() => localStorage.getItem("forma-draft"));
  const payload = Buffer.from(draft!).toString("base64url");
  const other = await context.newPage();
  await other.goto("/#project=" + payload);
  await expect(other.locator(".estimate-total")).toHaveText(total);
  await other.goto("/#project=broken");
  await other.reload();
  await expect(other.getByRole("status")).toContainText("Не удалось");
});
test("module editor, all views, U layout and printable estimate", async ({
  page,
}) => {
  await page.goto("/#planner");
  await page.getByRole("button", { name: "П-образная", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Продолжить", exact: true })
    .click();
  await page.getByRole("button", { name: "Шаг 3: Модули" }).click();
  await page
    .getByRole("button", { name: "Очистить кухню", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Продолжить", exact: true })
    .click();
  await page
    .getByRole("button", { name: /Шкаф 60 см/ })
    .first()
    .click();
  await expect(page.locator(".module-settings")).toBeVisible();
  await page.getByRole("button", { name: "Удалить выбранный модуль" }).click();
  await expect(page.locator(".project-summary")).toContainText("0 модулей");
  await page
    .getByRole("button", { name: "Заполнить стену", exact: true })
    .click();
  await expect(page.locator(".project-summary")).not.toContainText("0 модулей");
  await page.getByRole("button", { name: "Фасады", exact: true }).click();
  await expect(page.locator(".drawing")).toHaveClass(/elevation/);
  const popup = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Скачать смету / PDF" }).click();
  const print = await popup;
  await expect(print.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(print.locator("body")).toContainText(
    "не является коммерческим предложением",
  );
});
test("booking confirms the selected slot without storing personal data", async ({
  page,
}) => {
  await page.goto("/#planner");
  await page
    .getByRole("button", { name: "Бесплатный замер", exact: true })
    .last()
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.locator(".date-list button").nth(1).click();
  await dialog.locator(".time-list button:not([disabled])").first().click();
  await dialog.getByLabel("Ваше имя", { exact: true }).fill("Тестовый Клиент");
  await dialog.getByLabel("Телефон", { exact: true }).fill("+7 999 123 45 67");
  await dialog.getByRole("button", { name: "Выбрать это время" }).click();
  await expect(dialog.locator(".booking-success")).toContainText(
    "Время выбрано.",
  );
  const stored = await page.evaluate(() => JSON.stringify(localStorage));
  expect(stored).not.toContain("Тестовый Клиент");
  expect(stored).not.toContain("999 123");
  expect(stored).toContain("forma-bookings");
});
test("mobile has no horizontal overflow and planner is usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Конструктор кухни", exact: true })
    .click();
  await expect(page.locator(".drawing")).toBeVisible();
  await page.getByRole("button", { name: "Шаг 5: Детали" }).click();
  await page
    .getByRole("button", { name: "Кварцевый агломерат", exact: false })
    .click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("dimensions allow typing a replacement before validating", async ({
  page,
}) => {
  await page.goto("/#planner");
  await page.getByRole("button", { name: "Шаг 2: Размеры" }).click();
  const wall = page.getByLabel("Стена A", { exact: true });
  await wall.selectText();
  await wall.pressSequentially("400");
  await wall.press("Tab");
  await expect(wall).toHaveValue("400");
  await expect(page.locator(".kitchen-svg").first()).toContainText("400 см");
});

test("save does not consume undo and overwrite is confirmed", async ({
  page,
}) => {
  await page.goto("/#planner");
  await page.getByRole("button", { name: "Шаг 4: Фасады" }).click();
  await page.getByRole("button", { name: "Оливковый", exact: true }).click();
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await page.getByRole("button", { name: "Отменить", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Песочный", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Перезаписать");
});

test("browser Back preserves edits of an imported project", async ({
  page,
}) => {
  await page.goto("/#planner");
  const draft = await page.evaluate(() => localStorage.getItem("forma-draft"));
  await page.goto("/#project=" + Buffer.from(draft!).toString("base64url"));
  await page.reload();
  await page.getByRole("button", { name: "Шаг 2: Размеры" }).click();
  await page.getByLabel("Стена A", { exact: true }).fill("400");
  await page.getByLabel("Стена A", { exact: true }).press("Tab");
  await page.getByRole("button", { name: "На главную", exact: true }).click();
  await page.goBack();
  await page.getByRole("button", { name: "Шаг 2: Размеры" }).click();
  await expect(page.getByLabel("Стена A", { exact: true })).toHaveValue("400");
});

test("dialog restores keyboard focus to its opener", async ({ page }) => {
  await page.goto("/");
  const opener = page.getByRole("button", { name: "Открыть фото кухни Terra" });
  await opener.click();
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
});

test("consultation validates the phone and closes confirmation automatically", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Обсудить вашу идею", exact: true })
    .click();
  const d = page.getByRole("dialog");
  await d.getByLabel("Ваше имя", { exact: true }).fill("Анна");
  await d.getByLabel("Телефон", { exact: true }).fill("123-------");
  await d
    .getByLabel("Какая кухня вам близка?", { exact: true })
    .fill("Кухня с натуральным дубом");
  await d.getByRole("button", { name: "Обсудить идею" }).click();
  await expect(d.locator(".consult-success")).toHaveCount(0);
  await expect(d.getByLabel("Телефон", { exact: true })).toHaveValue("123");
  expect(
    await d
      .getByLabel("Телефон", { exact: true })
      .evaluate((input: HTMLInputElement) => input.validity.patternMismatch),
  ).toBe(true);
  await d.getByLabel("Телефон", { exact: true }).fill("+7 999 123 45 67");
  await d.getByRole("button", { name: "Обсудить идею" }).click();
  await expect(d.locator(".consult-success")).toContainText(
    "Спасибо за вашу идею!",
  );
  await expect(d).toBeHidden({ timeout: 7000 });
});
