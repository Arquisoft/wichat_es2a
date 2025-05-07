const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions;
const feature = loadFeature('./features/game-category.feature');

let page;
let browser;

defineFeature(feature, test => {

  beforeAll(async () => {
    // Crear usuario de test si no existe
    try {
      const res = await fetch(`http://localhost:8000/adduser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'NataliaBB',
          password: 'Contrasena$2',
          confirmPassword: 'Contrasena$2',
          avatarOptions: {
            hair: "short",
            eyes: "happy",
            mouth: "smile",
            hairColor: "brown",
            skinColor: "light"
          }
        })
      });
      await res.json(); // Omitimos el valor, solo consumimos la respuesta
    } catch (e) {
      console.warn("⚠️ El usuario ya puede existir o hubo un error al crearlo:", e.message);
    }

    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] })
      : await puppeteer.launch({ headless: false, slowMo: 100 });

    page = await browser.newPage();
    setDefaultOptions({ timeout: 60000 });

    await page.goto("http://localhost:3000", { waitUntil: "networkidle0" }).catch(() => {});
  });

  test('User choose a category and start game', ({ given, when, then }) => {

    let username;
    let password;
    let category;
    let dificulty;

    given('Registered user login', async () => {
      username = "NataliaBB";
      password = "Contrasena$2";
      category = "Banderas";
      dificulty = "medio";

      await expect(page).toFill('[data-testid="username-field"] input', username);
      await expect(page).toFill('[data-testid="password-field"] input', password);
      await expect(page).toClick("button", { text: "Login" });

      // Esperar que aparezca algún componente tras login (menú o select)
      await page.waitForFunction(() => {
        return [...document.querySelectorAll('button, a')].some(el => el.textContent.includes("Comenzar") || el.textContent.includes("Jugar"));
      }, { timeout: 10000 });
    });

    when('User choose category and press start button', async () => {
      await expect(page).toClick('[aria-labelledby="category-select-label"]');
      await page.click(`li[data-value="${category}"]`);

      await expect(page).toClick('[aria-labelledby="level-select-label"]');
      await page.click(`li[data-value="${dificulty}"]`);

      await expect(page).toClick('button', { text: 'Comenzar a jugar' });
    });

    then('Game start in this category', async () => {
      await page.waitForSelector('div', { visible: true, timeout: 10000 });

      // Comprobamos que el texto esperado aparece
      await expect(page).toMatchElement('div', { text: '¿De qué país es esta bandera?' });
    });

  }, 180000); // Aumentamos timeout a 3 minutos

  afterAll(async () => {
    await browser.close();
  });

});
