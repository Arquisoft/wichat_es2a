const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const { response } = require('../../../wikidata/src/wikidataRoutes');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions;
const feature = loadFeature('./features/history.feature');

let page;
let browser;

defineFeature(feature, test => {

    beforeAll(async () => {
        let userId = null;

        // 1. Crear usuario de test si no existe
        try {
            const res = await fetch(`http://localhost:8000/adduser`, {
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

            const user = await res.json();
            userId = user._id; // Guardar el ID del usuario creado
        } catch (e) {
            console.warn("⚠️ El usuario ya puede existir o hubo un error al crearlo:", e.message);

            // Si ya existe, recuperamos su ID con un GET (asumiendo que hay endpoint)
            const res = await fetch(`http://localhost:8000/user/username/NataliaBA`);
            const user = await res.json();
            userId = user._id;
        }

        // 2. Insertar historial (partida de prueba)
        if (userId) {
            try {
                await fetch(`http://localhost:3001/game/start`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId })
                });

                await fetch(`http://localhost:3001/game/end`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId,
                        username: 'NataliaBA',
                        duration: 20,
                        correct: 9,
                        wrong: 1,
                        isCompleted: true,
                        category: 'Ciencia',
                        level: 'Difícil',
                        totalQuestions: 10,
                        answered: 10,
                        points: 90
                    })
                });
            } catch (e) {
                console.error("❌ Error al insertar partida de prueba:", e.message);
            }
        }

        browser = process.env.GITHUB_ACTIONS
            ? await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] })
            : await puppeteer.launch({ headless: false, slowMo: 10, defaultViewport: { width: 1920, height: 1080 } });
        page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
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

            await page.waitForSelector('[data-testid="username-field"] input', { visible: true, timeout: 60000 });
            await expect(page).toFill('[data-testid="username-field"] input', username, { timeout: 60000 });
            await page.waitForSelector('[data-testid="password-field"] input', { visible: true, timeout: 60000 });
            await expect(page).toFill('[data-testid="password-field"] input', password, { timeout: 60000 });
            await page.waitForSelector("button", { text: "Login", timeout: 60000 });
            await expect(page).toClick("button", { text: "Login", timeout: 60000 });
        });

        when('User navigates to the history page', async () => {
            await page.waitForSelector('[data-testid="nav-history"]', { text: "Historial", timeout: 500000 });
            await expect(page).toClick('[data-testid="nav-history"]');
        });

        then('User sees a list of past games', async () => {
            await page.waitForSelector('[data-testid="history-title"]', { text: 'Historial de Partidas', timeout: 500000 });
            const historyHeader = await page.$eval('h4', el => el.textContent);
            expect(historyHeader).toContain('Historial de Partidas');
        });
    });

    afterAll(async () => {
        browser.close();
    });

});