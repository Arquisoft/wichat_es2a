const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/register-form.feature');

let page;
let browser;

defineFeature(feature, test => {

  beforeAll(async () => {
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

  test('The user is not registered in the site', ({ given, when, then }) => {

    let username;
    let password;

    given('An unregistered user', async () => {
      username = "prueba2" + Math.floor(Math.random() * 1000);
      password = "EstoEsUnaPassDePrueba123-"
      await page.waitForSelector("a", { text: "Sign up", timeout: 60000 });
      await expect(page).toClick("a", { text: "Sign up", timeout: 60000 });

    });

    when('I fill the data in the form and press submit', async () => {
      await page.waitForSelector('input[name="username"]', { visible: true, timeout: 60000 });
      await expect(page).toFill('input[name="username"]', username, { timeout: 60000 });

      await page.waitForSelector('input[name="password"]', { visible: true, timeout: 60000 });
      await expect(page).toFill('input[name="password"]', password, { timeout: 60000 });

      await page.waitForSelector('input[name="confirmPassword"]', { visible: true, timeout: 60000 });
      await expect(page).toFill('input[name="confirmPassword"]', password, { timeout: 60000 });

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