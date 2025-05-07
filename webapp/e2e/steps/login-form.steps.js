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
    } catch (e) {
      console.warn("⚠️ El usuario ya puede existir o hubo un error al crearlo:", e.message);
    }

    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] })
      : await puppeteer.launch({ headless: false, slowMo: 100 });
    page = await browser.newPage();
    setDefaultOptions({ timeout: 10000 });

    await page
      .goto(`http://${webappIp}:${webappPort}`, {
        waitUntil: "networkidle0",
      })
      .catch(() => { });
  });

  test('The user has an account and wants to log in', ({ given, when, then }) => {

    const username = "NataliaBA";
    const password = "Contrasena$1";

    given('A registered user', async () => {
      await page.waitForSelector('h1', { visible: true, timeout: 60000 });
      await expect(page).toMatchElement('h1', { text: "Log in to your account", timeout: 60000 });
    });

    when('I fill the login credentials and press submit', async () => {
      await page.waitForSelector('[data-testid="username-field"] input', { visible: true, timeout: 60000 });
      await expect(page).toFill('[data-testid="username-field"] input', username, { timeout: 60000 });

      await page.waitForSelector('[data-testid="password-field"] input', { visible: true, timeout: 60000 });
      await expect(page).toFill('[data-testid="password-field"] input', password, { timeout: 60000 });

      await page.waitForSelector('button', { visible: true, timeout: 60000 });
      await expect(page).toClick('button', { text: 'Login', timeout: 60000 });
    });

    then('I should be logged in successfully', async () => {
      await page.waitForFunction(
        () => document.body.innerText.includes('WICHAT'),
        { timeout: 60000 }
      );
      await expect(page).toMatchElement('h1', { text: "WICHAT", timeout: 60000 });
    });
  });

  afterAll(async () => {
    browser.close();
  });

});