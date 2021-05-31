import time
import json
from selenium.webdriver.common.action_chains import ActionChains
from seleniumwire import webdriver
from selenium.webdriver.support.ui import WebDriverWait

from browsermobproxy import Server
from chromedriver_py import binary_path

def processLog(log):
    log = json.loads(log["message"])["message"]
    if ("Network.responseReceived" in log["method"] and "params" in log.keys()):
        body = driver.execute_cdp_cmd('Network.getResponseBody', {'requestId': log["params"]["requestId"]})

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " \
             "Chrome/90.0.4430.212 Safari/537.36";

server = Server("/Users/phucanthony/Downloads/browsermob-proxy-2.1.4/bin/browsermob-proxy")
server.start()
# If sleep is not added sometime `create_proxy` throws an error
time.sleep(2)
proxy = server.create_proxy()
chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument("--proxy-server={0}".format(proxy.proxy))
chrome_options.add_argument("user-agent=" + USER_AGENT)
chrome_options.add_argument("--start-maximized")
chrome_options.add_argument('disable-gpu')
chrome_options.add_argument("--window-size=1920,1080")
chrome_options.add_argument('ignore-certificate-errors')
print(chrome_options)

sel_proxy = proxy.selenium_proxy()

# profile.set_proxy(sel_proxy)
driver = webdriver.Chrome(executable_path=binary_path, options=chrome_options)
proxy.new_har("mysite", options={'captureHeaders': True, 'captureContent': True} )
driver.get("https://remaps.vn/maps/info?q=10.785486364537663,106.66682168841365,20z");
WebDriverWait(driver, 10).until(lambda driver: driver.execute_script('return document.readyState') == 'complete')
driver.implicitly_wait(5)
time.sleep(5)
action = ActionChains(driver)
el = driver.find_element_by_id('map')
action.move_to_element_with_offset(el, 300, 300)
action.double_click()
action.perform()
driver.implicitly_wait(2)
time.sleep(2)

# results = proxy.har['log']['entries']
#
# for item in results:
#     if "https://remaps.vn/api/search" in item['request']['url']:
#         print(item['response'])
#         print(item['request'])

for request in driver.requests:
    if request.response and "https://remaps.vn/api" in request.url:
        print(
            request.url,
            request.response.body,
            request.response.headers['Content-Type']
        )

driver.quit()
