const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/logout-session.feature');

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

    test('User logs in with his account and logs out', ({ given, when, then }) => {
        let username;
        let password;
        given('User in home view', async () => {

            username = "NataliaBA"
            password = "Contrasena$1"
            await expect(page).toFill('[data-testid="username-field"] input', username);
            await expect(page).toFill('[data-testid="password-field"] input', password);
            await expect(page).toClick("button", { text: "Login" });

        });

        when('User selects the logout button', async () => {
            // 1. Click en el botón de menú (usando tu XPath original)
            const [menuButton] = await page.$x('//*[@id="root"]/div/header/div/div/div[3]/button');
            if (!menuButton) throw new Error('Botón de menú no encontrado');
            await menuButton.click();
        
            // 2. Esperar y hacer clic en el <li> que contiene un <p> con el texto exacto
            const [logoutItem] = await page.$x('//li[.//p[normalize-space()="Cerrar Sesión"]]');
            if (!logoutItem) throw new Error('Opción de logout no encontrada');
            await logoutItem.click();
        });

        then('User logs out and sees the login view', async () => {
            await page.waitForSelector('h1', { text: 'Log in to your account', timeout: 10000 });
            const titulo = await page.$eval('h1', el => el.textContent);
            expect(titulo).toContain('Log in to your account');
        });
    })

    afterAll(async () => {
        browser.close()
    })

});