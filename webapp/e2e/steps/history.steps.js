const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions;
const feature = loadFeature('./features/history.feature');

let page;
let browser;

defineFeature(feature, test => {

    beforeAll(async () => {
        browser = process.env.GITHUB_ACTIONS
            ? await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] })
            : await puppeteer.launch({ headless: false, slowMo: 100, defaultViewport: { width: 1920, height: 1080 } });
        page = await browser.newPage();
        setDefaultOptions({ timeout: 60000 });

        await page
            .goto("http://localhost:3000", {
                waitUntil: "networkidle0",
            })
            .catch(() => { });
    });

    test('View personal match history', ({ given, when, then }) => {

        let username;
        let password;

        given('Registered user login', async () => {
            username = "NataliaBA";
            password = "Contrasena$1";

            await expect(page).toFill('[data-testid="username-field"] input', username);
            await expect(page).toFill('[data-testid="password-field"] input', password);
            await expect(page).toClick("button", { text: "LOGIN" });
        });

        when('User navigates to the history page', async () => {
            await expect(page).toClick('a', { text: 'HISTORIAL' });
        });

        then('User sees a list of past games', async () => {
            await page.waitForSelector('h4', { text: 'Historial de Partidas', timeout: 10000 });
            const historyHeader = await page.$eval('h4', el => el.textContent);
            expect(historyHeader).toContain('Historial de Partidas');
        });
    });

    afterAll(async () => {
        browser.close();
    });

});