import fs from 'fs'
import chrome from 'selenium-webdriver/chrome';
import webdriver, {Actions, Origin} from 'selenium-webdriver';
import {Proxy} from 'browsermob-proxy';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36';

const options = new chrome.Options();
options.addArguments([`user-agent="${USER_AGENT}"`]);
options.addArguments("--start-maximized");
options.addArguments('disable-gpu');

async function f() {
    const chromePath = require('chromedriver').path;
    const service = new chrome.ServiceBuilder(chromePath).build();
    chrome.setDefaultService(service);

    const driver = new webdriver.Builder()
        .forBrowser('chrome')
        .withCapabilities(webdriver.Capabilities.chrome())
        .setChromeOptions(options) // note this
        .build();

    await driver.get('https://remaps.vn/maps/info?q=10.785486364537663,106.66682168841365,20z');
    await driver.wait(async function () {
        return driver
            .executeScript('return document.readyState')
            .then(function (readyState) {
                return readyState === 'complete';
            });
    });
    await driver.sleep(3000)
    const actions = driver.actions({async: true});
    // Performs mouse move action onto the element
    await actions.move({x: parseInt(150), y: parseInt(250)}).doubleClick().perform();
    const href = await driver.executeScript(`
        return window.location.href;
    `)
}

f().then(r => console.log(r));

