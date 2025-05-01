const puppeteer = require('puppeteer');
const { defineFeature, loadFeature }=require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/game-category.feature');

let page;
let browser;

defineFeature(feature, test => {
  
  beforeAll(async () => {
    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox']})
      : await puppeteer.launch({ headless: false, slowMo: 100 });
    page = await browser.newPage();
    //Way of setting up the timeout
    setDefaultOptions({ timeout: 60000 })

    await page
      .goto("http://localhost:3000", {
        waitUntil: "networkidle0",
      })
      .catch(() => {});
  });

  test('User choose a category and start game', ({given,when,then}) => {
    
    let username;
    let password;
    let category;
    let dificulty;

    given('Registered user login' , async () => {

      // Definimos los datos de usuario y contraseña
      username = "admin"
      password = "admin"

      // Definimos la categoría a seleccionar
      category = "Lugares"
      dificulty = "medio"

      // Introduces los datos de usuario y contraseña
      await expect(page).toFill('[data-testid="username-field"] input', username);
      await expect(page).toFill('[data-testid="password-field"] input', password);

      // Entramos en sesion con el usuario admin y la contraseña admin
      await expect(page).toClick("button", { text: "Login" });

    });

    when('User choose category and press start button', async () => {
      
      // Abre el Select para escoger la categoría
      await expect(page).toClick('[aria-labelledby="category-select-label"]');

      // Escoge la categoría del menú desplegable
      await page.click('li[data-value="'+category+'"]');

      // Abre el Select para escoger la dificultad
      await expect(page).toClick('[aria-labelledby="level-select-label"]');

      // Escoge la dificultad "Medio" del menú desplegable
      await page.click('li[data-value="'+dificulty+'"]');

      // Finalmente, hacer clic en el botón para comenzar el juego.
      await expect(page).toClick('button', { text: 'Comenzar a jugar' });

      

    });

    then('Game start in this category', async () => {
        
        // Espera a que el div que contiene el texto sea visible.
        await page.waitForSelector('div', { text: '¿A qué lugar corresponde la siguiente foto?' });  

        // Verifica que el texto esté presente en el div.
        // Se comprueba el texto de la pregunta que se muestra en el juego.
        // Ya que cada categoría tiene su propia pregunta.
        await expect(page).toMatchElement('div', { text: '¿A qué lugar corresponde la siguiente foto?' });  
        
    });
  })

  afterAll(async ()=>{
    browser.close()
  })

});