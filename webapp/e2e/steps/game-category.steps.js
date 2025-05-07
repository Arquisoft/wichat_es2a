const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/game-category.feature');

let page;
let browser;

defineFeature(feature, test => {

  beforeAll(async () => {
    // 1. Crear usuario de test si no existe
    try {
      await fetch(`http://localhost:8000/adduser`, {
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
    } catch (e) {
      console.warn("⚠️ El usuario ya puede existir o hubo un error al crearlo:", e.message);
    }

    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] })
      : await puppeteer.launch({ headless: false, slowMo: 100 });
    page = await browser.newPage();
    //Way of setting up the timeout
    setDefaultOptions({ timeout: 60000 })

    await page
      .goto("http://localhost:3000", {
        waitUntil: "networkidle0",
      })
      .catch(() => { });
  });

  test('User choose a category and start game', ({ given, when, then }) => {

    let username;
    let password;
    let category;
    let dificulty;

    given('Registered user login', async () => {

      // Definimos los datos de usuario y contraseña
      username = "NataliaBB";

      password = "Contrasena$2";

      // Definimos la categoría a seleccionar
      category = "Banderas"
      dificulty = "medio"

      // Introduces los datos de usuario y contraseña
      await page.waitForSelector('[data-testid="username-field"] input', { visible: true, timeout: 60000 });
      await expect(page).toFill('[data-testid="username-field"] input', username, { timeout: 60000 });

      await page.waitForSelector('[data-testid="password-field"] input', { visible: true, timeout: 60000 });
      await expect(page).toFill('[data-testid="password-field"] input', password, { timeout: 60000 });

      await page.waitForSelector('button', { visible: true, timeout: 60000 });
      await expect(page).toClick("button", { text: "Login", timeout: 60000 });

    });

    when('User choose category and press start button', async () => {
      await page.waitForSelector('[data-testid="category-select"]', { visible: true, timeout: 60000 });
      await expect(page).toClick('[data-testid="category-select"]', { timeout: 60000 });

      await page.waitForSelector(`[data-testid="category-option-${category}"`, { visible: true, timeout: 60000 });
      await page.click(`[data-testid="category-option-${category}"`, { timeout: 60000 });

      await page.waitForSelector('[data-testid="level-select"]', { visible: true, timeout: 500000 });
      await expect(page).toClick('[data-testid="level-select"]', { timeout: 500000 });

      await page.waitForSelector(`[data-testid="level-option-${dificulty}"]`, { visible: true, timeout: 500000 });
      await page.click(`[data-testid="level-option-${dificulty}"]`, { timeout: 500000 });

      await page.waitForSelector('[data-testid="start-game-button"]', { visible: true, timeout: 500000 });
      await expect(page).toClick('[data-testid="start-game-button"]', { text: 'Comenzar a jugar', timeout: 500000 });
    });

    then('Game start in this category', async () => {
      await page.waitForFunction(
        () => document.body.innerText.includes('¿De qué país es esta bandera?'),
        { timeout: 500000 }
      );
      await expect(page).toMatchElement('div', { text: '¿De qué país es esta bandera?', timeout: 500000 });
    });
  })

  afterAll(async () => {
    browser.close()
  })

});