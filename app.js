import fs from 'fs'
import firefox from 'selenium-webdriver/firefox';
import firefoxdriver from 'geckodriver';
import webdriver, { Actions, Origin } from 'selenium-webdriver';
import BrowserMob from 'browsermob-proxy-client';
import selProxy from 'selenium-webdriver/proxy';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36';

// const options = new chrome.Options();
// options.addArguments([`user-agent="${USER_AGENT}"`]);
// options.addArguments("--start-maximized");
// options.addArguments('disable-gpu');
// options.addArguments("--window-size=1920,1080")

const defaultProxy = BrowserMob.createClient();

function getRequestUrls(requestEntries) {
	const urls = [];
	requestEntries.forEach(obj => {
		// console.log(obj);
		console.log(obj.response.content);
		if (obj.request.url.includes('https://remaps.vn/api/search')) {
			urls.push(obj);
		}
	});

	return urls;
}

(async function f() {
	await defaultProxy.start();
	await defaultProxy.createHar({ captureContent: true, captureHeaders: true, captureBinaryContent: true });
	// const chromePath = require('chromedriver').path;
	// const service = new chrome.ServiceBuilder(chromePath).build();
	// chrome.setDefaultService(service);

	const { port } = defaultProxy.proxy;

	const driver = new webdriver.Builder()
		.forBrowser('chrome')
		.withCapabilities({ 'browserName': 'firefox', acceptSslCerts: true, acceptInsecureCerts: true })
		.setProxy(selProxy.manual({ http: 'localhost:' + port, https: 'localhost:' + port }))
		// .setChromeOptions(options) // note this
		.build();

	await driver.get('https://remaps.vn/maps/info?q=10.785486364537663,106.66682168841365,20z');
	await driver.wait(async function () {
		return driver
			.executeScript('return document.readyState')
			.then(function (readyState) {
				return readyState === 'complete';
			});
	});
	await driver.sleep(3000);
	const actions = driver.actions({ async: true });
	// Performs mouse move action onto the element
	await actions.move({ x: 300, y: 300 }).click().perform();
	await driver.sleep(1000);
	const har = await defaultProxy.getHar();
	const urls = getRequestUrls(har.log.entries);
	// console.log(har);
	console.log(urls);
	const href = await driver.executeScript(`
        return window.location.href;
    `)
	await driver.quit();
	await defaultProxy.closeProxies();
	await defaultProxy.end();
})();

