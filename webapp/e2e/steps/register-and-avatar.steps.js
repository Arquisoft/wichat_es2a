const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/register-and-avatar.feature');

let page;
let browser;

defineFeature(feature, test => {

  beforeAll(async () => {
    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] })
      : await puppeteer.launch({ headless: false, slowMo: 100 });
    page = await browser.newPage();
    //Way of setting up the timeout
    setDefaultOptions({ timeout: 10000 })

    await page
      .goto("http://localhost:3000", {
        waitUntil: "networkidle0",
      })
      .catch(() => { });
  });

  test('User is not registered in the site', ({ given, when, then }) => {

    let username;
    let password;

    given('An unregistered user', async () => {
      username = "prueba1" + Math.floor(Math.random() * 1000);
      password = "EstoEsUnaPassDePrueba123."
      await page.waitForSelector("a", { text: "Sing up", timeout: 60000 });
      await expect(page).toClick("a", { text: "Sign up", timeout: 60000 });

    });

    when('I fill in the data in the form, edit my avatar, and press send.', async () => {
      await page.waitForSelector('input[name="username"]', { visible: true, timeout: 60000 });
      await expect(page).toFill('input[name="username"]', username, { timeout: 60000 });

      await page.waitForSelector('input[name="password"]', { visible: true, timeout: 60000 });
      await expect(page).toFill('input[name="password"]', password, { timeout: 60000 });

      await page.waitForSelector('input[name="confirmPassword"]', { visible: true, timeout: 60000 });
      await expect(page).toFill('input[name="confirmPassword"]', password, { timeout: 60000 });

      // Piel
      await page.waitForSelector('button[aria-label="skin"]', { visible: true, timeout: 60000 });
      await expect(page).toClick('button[aria-label="skin"]', { timeout: 60000 });
      await page.waitForSelector('button', { visible: true, timeout: 60000 });
      await expect(page).toClick('button', { text: 'Bronze', timeout: 60000 });

      // Pelo
      await page.waitForSelector('button[aria-label="hair"]', { visible: true, timeout: 60000 });
      await expect(page).toClick('button[aria-label="hair"]', { timeout: 60000 });
      await page.waitForSelector('button', { visible: true, timeout: 60000 });
      await expect(page).toClick('button', { text: 'Blonde', timeout: 60000 });
      await page.waitForSelector('button', { visible: true, timeout: 60000 });
      await expect(page).toClick('button', { text: 'curlyShortHair', timeout: 60000 });

      // Ojos
      await page.waitForSelector('button[aria-label="eyes"]', { visible: true, timeout: 60000 });
      await expect(page).toClick('button[aria-label="eyes"]', { timeout: 60000 });
      await page.waitForSelector('button', { visible: true, timeout: 60000 });
      await expect(page).toClick('button', { text: 'starstruck', timeout: 60000 });

      // Boca
      await page.waitForSelector('button[aria-label="mouth"]', { visible: true, timeout: 60000 });
      await expect(page).toClick('button[aria-label="mouth"]', { timeout: 60000 });
      await page.waitForSelector('button', { visible: true, timeout: 60000 });
      await expect(page).toClick('button', { text: 'unimpressed', timeout: 60000 });

      // Enviar el formulario
      await page.waitForSelector('button', { visible: true, timeout: 60000 });
      await expect(page).toClick('button', { text: 'Sign up', timeout: 60000 });
    });

    then('The user should be redirected to the Login page', async () => {
      await page.waitForSelector("h1", { visible: true, timeout: 60000 });
      await expect(page).toMatchElement("h1", { text: "Log in to your account", timeout: 60000 });
    });
  })

  afterAll(async () => {
    browser.close()
  })

});