const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/game-category.feature');

let page;
let browser;

defineFeature(feature, test => {
  let userId = null;

  beforeAll(async () => {
    // 1. Crear usuario de test si no existe
    try {
      await fetch(`http://localhost:8000/adduser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'NataliaBA',
          password: 'Contrasena$1',
          confirmPassword: 'Contrasena$1',
          avatarOptions: {
            hair: "short",
            eyes: "happy",
            mouth: "smile",
            hairColor: "brown",
            skinColor: "light"
          }
        })
      });

      const user = await res.json();
      userId = user._id; // Guardar el ID del usuario creado
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
      username = "NataliaBA"
      password = "Contrasena$1"

      // Definimos la categoría a seleccionar
      category = "Banderas"
      dificulty = "medio"

      // Introduces los datos de usuario y contraseña
      await expect(page).toFill('[data-testid="username-field"] input', username);
      await expect(page).toFill('[data-testid="password-field"] input', password);

      await expect(page).toClick("button", { text: "Login" });

    });

    when('User choose category and press start button', async () => {

      // Abre el Select para escoger la categoría
      await expect(page).toClick('[aria-labelledby="category-select-label"]');

      // Escoge la categoría del menú desplegable
      await page.click('li[data-value="' + category + '"]');

      // Abre el Select para escoger la dificultad
      await expect(page).toClick('[aria-labelledby="level-select-label"]');

      // Escoge la dificultad "Medio" del menú desplegable
      await page.waitForSelector('li[data-value="' + dificulty + '"]', { visible: true, timeout: 600000 });
      await page.click('li[data-value="' + dificulty + '"]');

      // Finalmente, hacer clic en el botón para comenzar el juego.
      await expect(page).toClick('button', { text: 'Comenzar a jugar' });



    });

    then('Game start in this category', async () => {

      // Espera a que el div que contiene el texto sea visible.
      await page.waitForSelector('div', { text: '¿De qué país es esta bandera?' });

      // Verifica que el texto esté presente en el div.
      // Se comprueba el texto de la pregunta que se muestra en el juego.
      // Ya que cada categoría tiene su propia pregunta.
      await expect(page).toMatchElement('div', { text: '¿De qué país es esta bandera?' });

    });
  })

  afterAll(async () => {
    browser.close()
  })

});