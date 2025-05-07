const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/logout-session.feature');

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

            username = "NataliaBD"
            password = "Contrasena$4"
            await page.waitForSelector('[data-testid="username-field"] input', { visible: true, timeout: 60000 });
            await expect(page).toFill('[data-testid="username-field"] input', username, { timeout: 60000 });
            
            await page.waitForSelector('[data-testid="password-field"] input', { visible: true, timeout: 60000 });
            await expect(page).toFill('[data-testid="password-field"] input', password, { timeout: 60000 });

            await page.waitForSelector("button", { visible: true, timeout: 60000 });
            await expect(page).toClick("button", { text: "Login", timeout: 60000 });

        });

        when('User selects the logout button', async () => {
            // 1. Click en el botón de menú (usando tu XPath original)
            const [menuButton] = await page.$x('//*[@id="root"]/div/header/div/div/div[3]/button');
            if (!menuButton) throw new Error('Botón de menú no encontrado');
            await menuButton.click({ timeout: 60000 });

            // 2. Esperar y hacer clic en el <li> que contiene un <p> con el texto exacto
            const [logoutItem] = await page.$x('//li[.//p[normalize-space()="Cerrar Sesión"]]');
            if (!logoutItem) throw new Error('Opción de logout no encontrada');
            await logoutItem.click({ timeout: 60000 });
        });

        then('User logs out and sees the login view', async () => {
            await page.waitForSelector('h1', { visible: true, text: 'Log in to your account', timeout: 60000 });
            const titulo = await page.$eval('h1', el => el.textContent);
            expect(titulo).toContain('Log in to your account');
        });
    })

    afterAll(async () => {
        browser.close()
    })

});