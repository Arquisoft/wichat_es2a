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
            dificulty = "facil"

            // Introduces los datos de usuario y contraseña
            await expect(page).toFill('[data-testid="username-field"] input', username);
            await expect(page).toFill('[data-testid="password-field"] input', password);

            await expect(page).toClick("button", { text: "Login" });

        });

        when('User choose category, press start button and play', async () => {
            // Abre el Select para escoger la categoría (Futbolistas)
            await expect(page).toClick('[aria-labelledby="category-select-label"]');

            // Escoge la categoría "Futbolistas" del menú desplegable
            await page.click('li[data-value="' + category + '"]');

            // Abre el Select para escoger la dificultad
            await expect(page).toClick('[aria-labelledby="level-select-label"]');

            // Escoge la dificultad "Medio" del menú desplegable
            await page.click('li[data-value="' + dificulty + '"]');

            // Finalmente, hacer clic en el botón para comenzar el juego.
            await expect(page).toClick('button', { text: 'Comenzar a jugar' });

            for (let i = 0; i < 10; i++) {
                // Esperamos que se cargue la imagen
                await page.waitForSelector('img[alt="Imagen del juego"]', { visible: true });

                // Esperamos a que las opciones estén disponibles
                await page.waitForSelector(`[data-testid^="respuesta-"]`, { visible: true });

                // Seleccionamos todas las opciones disponibles
                const opciones = await page.$$(`[data-testid^="respuesta-"]`);
                if (opciones.length > 0) {
                    // Hacer clic en la primera opción disponible
                    await opciones[0].click();
                }

                // Esperar un poco antes de continuar
                await page.waitForTimeout(3000);
            }
        });

        then('User sees the game summary', async () => {
            await page.waitForSelector('h4', { text: 'Resumen del Juego', timeout: 10000 });
            const resumenTexto = await page.$eval('h4', el => el.textContent);
            expect(resumenTexto).toContain('Resumen del Juego');
        });
    })

    afterAll(async () => {
        browser.close()
    })

});