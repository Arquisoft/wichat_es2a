const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/game-play.feature');

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
                    username: 'NataliaBC',
                    password: 'Contrasena$3',
                    confirmPassword: 'Contrasena$3',
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

    test('User completes a game by answering all questions', ({ given, when, then }) => {

        let username;
        let password;
        let category;
        let dificulty;

        given('Registered user login', async () => {

            // Definimos los datos de usuario y contraseña
            username = "NataliaBC"
            password = "Contrasena$3"

            // Definimos la categoría a seleccionar
            category = "Banderas"
            dificulty = "medio"

            // Introduces los datos de usuario y contraseña
            await page.waitForSelector('[data-testid="username-field"] input', { visible: true, timeout: 60000 });
            await expect(page).toFill('[data-testid="username-field"] input', username, { timeout: 60000 });
            await page.waitForSelector('[data-testid="password-field"] input', { visible: true, timeout: 60000 });
            await expect(page).toFill('[data-testid="password-field"] input', password, { timeout: 60000 });

            await page.waitForSelector("button", { visible: true, timeout: 60000 });
            await expect(page).toClick("button", { text: "Login", timeout: 60000 });

        });

        when('User choose category, press start button and play', async () => {
            await page.waitForSelector('[data-testid="category-select"]', { visible: true, timeout: 60000 });
            await expect(page).toClick('[data-testid="category-select"]', { timeout: 60000 });

            await page.waitForSelector(`[data-testid="category-option-${category}"`, { visible: true, timeout: 60000 });
            await page.click(`[data-testid="category-option-${category}"`, { timeout: 60000 });

            await page.waitForSelector('[data-testid="level-select"]', { visible: true, timeout: 60000 });
            await expect(page).toClick('[data-testid="level-select"]', { timeout: 60000 });

            await page.waitForSelector(`[data-testid="level-option-${dificulty}"]`, { visible: true, timeout: 60000 });
            await page.click(`[data-testid="level-option-${dificulty}"]`, { timeout: 60000 });

            await page.waitForSelector('[data-testid="start-game-button"]', { visible: true, timeout: 60000 });
            await expect(page).toClick('[data-testid="start-game-button"]', { text: 'Comenzar a jugar', timeout: 60000 });

            // Realiza 10 respuestas durante el juego
            for (let i = 0; i < 10; i++) {
                // Esperamos que se cargue la imagen
                await page.waitForSelector('[data-testid="image-game"]', { visible: true, timeout: 100000 });

                // Esperamos a que las opciones estén disponibles
                await page.waitForSelector(`[data-testid^="respuesta-"]`, { visible: true, timeout: 100000 });

                // Seleccionamos todas las opciones disponibles
                const opciones = await page.$$(`[data-testid^="respuesta-"]`);
                if (opciones.length > 0) {
                    // Hacer clic en la primera opción disponible
                    await opciones[0].click({ timeout: 60000 });
                }

                // Esperar un poco antes de continuar
                await page.waitForTimeout(3000);
            }
        });

        then('User sees the game summary', async () => {
            await page.waitForSelector('[data-testid="resumenJuego"]', { text: 'Resumen del Juego', timeout: 100000 });
            const resumenTexto = await page.$eval('h4', el => el.textContent);
            expect(resumenTexto).toContain('Resumen del Juego');
        });
    })

    afterAll(async () => {
        browser.close()
    })

});