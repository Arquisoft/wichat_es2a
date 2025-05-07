const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions;
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
        setDefaultOptions({ timeout: 60000 });

        await page.goto("http://localhost:3000", { waitUntil: "networkidle0" }).catch(() => {});
    });

    test('User completes a game by answering all questions', ({ given, when, then }) => {

        let username;
        let password;
        let category;
        let dificulty;

        given('Registered user login', async () => {
            username = "NataliaBC";
            password = "Contrasena$3";
            category = "Banderas";
            dificulty = "facil";

            await expect(page).toFill('[data-testid="username-field"] input', username);
            await expect(page).toFill('[data-testid="password-field"] input', password);
            await expect(page).toClick("button", { text: "Login" });

            // Esperar a que el juego cargue correctamente tras login
            await page.waitForFunction(() => {
                return [...document.querySelectorAll('a')].some(a => a.textContent.includes("Jugar"));
            }, { timeout: 10000 });
        });

        when('User choose category, press start button and play', async () => {
            await expect(page).toClick('[aria-labelledby="category-select-label"]');
            await page.click(`li[data-value="${category}"]`);

            await expect(page).toClick('[aria-labelledby="level-select-label"]');
            await page.click(`li[data-value="${dificulty}"]`);

            await expect(page).toClick('button', { text: 'Comenzar a jugar' });

            for (let i = 0; i < 10; i++) {
                await page.waitForSelector('img[alt="Imagen del juego"]', { visible: true });
                await page.waitForSelector(`[data-testid^="respuesta-"]`, { visible: true });

                const opciones = await page.$$(`[data-testid^="respuesta-"]`);
                if (opciones.length > 0) {
                    await opciones[0].click();
                }

                // Pequeña espera para dar tiempo a transición
                await page.waitForTimeout(500);
            }
        });

        then('User sees the game summary', async () => {
            await page.waitForSelector('h4', { visible: true, timeout: 10000 });
            const resumenTexto = await page.$eval('h4', el => el.textContent);
            expect(resumenTexto).toContain('Resumen del Juego');
        });

    }, 180000); // 3 minutos de timeout máximo

    afterAll(async () => {
        await browser.close();
    });

});
