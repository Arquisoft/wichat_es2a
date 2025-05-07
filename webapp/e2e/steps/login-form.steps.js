const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions;
const feature = loadFeature('./features/login-form.feature');

let page;
let browser;

const webappIp = process.env.DEPLOY_HOST || 'localhost';
const webappPort = process.env.WEBAPP_PORT || '3000';

defineFeature(feature, test => {
  
  beforeAll(async () => {
    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox']})
      : await puppeteer.launch({ headless: false, slowMo: 100 });
    page = await browser.newPage();
    setDefaultOptions({ timeout: 10000 });

    await page
      .goto(`http://${webappIp}:${webappPort}`, {
        waitUntil: "networkidle0",
      })
      .catch(() => {});
  });

  test('The user has an account and wants to log in', ({given, when, then}) => {
    
    const username = "NataliaBA";
    const password = "Contrasena$1";

    given('A registered user', async () => {
      await expect(page).toMatchElement('h1', { text: "Log in to your account" });
    });

    when('I fill the login credentials and press submit', async () => {
      await expect(page).toFill('[data-testid="username-field"] input', username);
      await expect(page).toFill('[data-testid="password-field"] input', password);
      await expect(page).toClick('button', { text: 'Login' });
    });

    then('I should be logged in successfully', async () => {
      await expect(page).toMatchElement('h1', { text: "WICHAT" });
    });
  });

  afterAll(async () => {
    browser.close();
  });

});