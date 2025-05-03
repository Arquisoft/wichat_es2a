const puppeteer = require('puppeteer');
const { defineFeature, loadFeature }=require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/register-and-avatar.feature');

let page;
let browser;

defineFeature(feature, test => {
  
  beforeAll(async () => {
    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox']})
      : await puppeteer.launch({ headless: false, slowMo: 100 });
    page = await browser.newPage();
    //Way of setting up the timeout
    setDefaultOptions({ timeout: 10000 })

    await page
      .goto("http://localhost:3000", {
        waitUntil: "networkidle0",
      })
      .catch(() => {});
  });

  test('User is not registered in the site', ({given,when,then}) => {
    
    let username;
    let password;

    given('An unregistered user', async () => {
      username = "prueba" + Math.floor(Math.random() * 1000);
      password = "EstoEsUnaPassDePrueba123."
      await expect(page).toClick("a", { text: "Sign up" });
      
    });

    when('I fill in the data in the form, edit my avatar, and press send.', async () => {
      await expect(page).toFill('input[name="username"]', username);
      await expect(page).toFill('input[name="password"]', password);
      await expect(page).toFill('input[name="confirmPassword"]', password);

      // Piel
      await expect(page).toClick('button[aria-label="skin"]');
      await expect(page).toClick('button', { text: 'Bronze' });

      // Pelo
      await expect(page).toClick('button[aria-label="hair"]');
      await expect(page).toClick('button', { text: 'Blonde' });
      await expect(page).toClick('button', { text: 'curlyShortHair' });

      // Ojos
      await expect(page).toClick('button[aria-label="eyes"]');
      await expect(page).toClick('button', { text: 'starstruck' });

      // Boca
      await expect(page).toClick('button[aria-label="mouth"]');
      await expect(page).toClick('button', { text: 'unimpressed' });
      await expect(page).toClick('button', { text: 'Sign up' })
    });

    then('The user should be redirected to the Login page', async () => {
        await expect(page).toMatchElement("h1", { text: "Log in to your account" });
    });
  })

  afterAll(async ()=>{
    browser.close()
  })

});