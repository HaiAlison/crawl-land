import time
import json
from selenium.webdriver.common.action_chains import ActionChains
from seleniumwire import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from chromedriver_py import binary_path
import requests
from gql import Client, gql
from gql.transport.requests import RequestsHTTPTransport

def processLog(log):
    log = json.loads(log["message"])["message"]
    if ("Network.responseReceived" in log["method"] and "params" in log.keys()):
        body = driver.execute_cdp_cmd('Network.getResponseBody', {'requestId': log["params"]["requestId"]})

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " \
             "Chrome/90.0.4430.212 Safari/537.36";

time.sleep(2)
chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument("user-agent=" + USER_AGENT)
chrome_options.add_argument("--start-maximized")
chrome_options.add_argument('disable-gpu')
# chrome_options.add_argument("--window-size=1920,1080")
chrome_options.add_argument('ignore-certificate-errors')
print(chrome_options)

driver = webdriver.Chrome(executable_path=binary_path, options=chrome_options)
driver.get("https://remaps.vn/maps/info?q=10.785486364537663,106.66682168841365,20z");
WebDriverWait(driver, 10).until(lambda driver: driver.execute_script('return document.readyState') == 'complete')
# driver.implicitly_wait(5)
time.sleep(5)
def run_query(query): # A simple function to use requests.post to make the API call. Note the json= section.
    request = requests.post('http://localhost:3001/graphql', json={'query': query})
    if request.status_code == 200:
        return request.json()
    else:
        raise Exception("Query failed to run by returning code of {}. {}".format(request.status_code, query))

def run_mutation(mutation): # A simple function to use requests.post to make the API call. Note the json= section.
    request = requests.post('https://map.gugotech.com/graphql', json={'query': mutation})
    if request.status_code == 200:
        return request.json()
    else:
        raise Exception("Query failed to run by returning code of {}. {}".format(request.status_code, mutation))

# Select your transport with a defined url endpoint
transport = RequestsHTTPTransport(url="https://map.gugotech.com/graphql")

# Create a GraphQL client using the defined transport
client = Client(transport=transport, fetch_schema_from_transport=True)

action = ActionChains(driver)
el = driver.find_element_by_id('map')
y = range(615,450,-72)
x = range(38,1599,50)
for height in y:
    for width in x:
        print(width,height)
        action.move_to_element_with_offset(el, width,height)
        action.click()
        action.perform()
        for request in driver.requests:
            if request.response and "https://remaps.vn/api/search" in request.url and json.loads(request.response.body):
                address = json.loads(request.response.body)[0]['address'].split(', ') #số tờ, số thửa, phường, quận, tp
                polygons = json.loads(request.response.body)[0]['polygons']
                print(
                    request.url,
                    json.loads(request.response.body)[0]
                )
                query = """
                {
                  checkAddressByName(province:"TP.Hồ Chí Minh"
                  district:\""""+address[2]+"""\"
                  ward:\""""+address[1]+"""\"
                  street:"Đường") {
                    id
                  }
                }
                """
                addressIds = run_query(query)
                province = addressIds['data']['checkAddressByName'][0]['id']
                district = addressIds['data']['checkAddressByName'][1]['id']
                ward = addressIds['data']['checkAddressByName'][2]['id']
                street = addressIds['data']['checkAddressByName'][3]['id']
                pages = address[0].split(' ')[1]
                lot = address[0].split(' ')[3]
                mutation = gql(
                """
                    mutation createLand($polygons: [[[Float]]] , $districtId: ObjectID!, $wardId: ObjectID!, $streetId: ObjectID, $landNumber: Int!, $mapNumber: Int!){
                    createLand(
                        polygon: {
                            type:Polygon,
                            coordinates: $polygons
                        }
                        provinceId:"60a0f43d6a8ebbd4e72f29c9"
                        districtId: $districtId
                        wardId: $wardId
                        streetId: $streetId
                        landNumber: $landNumber
                        mapNumber:$mapNumber
                      ) {
                        id
                        }
                    }
                """
                )

                variables = {"polygons": polygons[0], "provinceId": province, "districtId": district, "wardId": ward, "streetId": street, "landNumber": int(lot), "mapNumber": int(pages)}
                result = client.execute(mutation, variable_values=variables)
                print(result)



driver.implicitly_wait(2)
time.sleep(2)


driver.quit()

