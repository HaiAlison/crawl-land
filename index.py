import time
import os
from dotenv import load_dotenv
load_dotenv()
import json
from selenium.webdriver.common.action_chains import ActionChains
from seleniumwire import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from chromedriver_py import binary_path
import requests
from gql import Client, gql
from gql.transport.requests import RequestsHTTPTransport
import numpy as np

def processLog(log):
    log = json.loads(log["message"])["message"]
    if ("Network.responseReceived" in log["method"] and "params" in log.keys()):
        body = driver.execute_cdp_cmd('Network.getResponseBody', {'requestId': log["params"]["requestId"]})


USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " \
             "Chrome/90.0.4430.212 Safari/537.36";

time.sleep(2)
chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument("user-agent=" + USER_AGENT)
chrome_options.add_argument("--headless")
chrome_options.add_argument("--start-maximized")
chrome_options.add_argument('disable-gpu')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument("--window-size=1599,796")
chrome_options.add_argument('ignore-certificate-errors')


def run_query(query):  # A simple function to use requests.post to make the API call. Note the json= section.
    request = requests.post('https://map.gugotech.com/graphql', json={'query': query})
    if request.status_code == 200:
        return request.json()
    else:
        raise Exception("Query failed to run by returning code of {}. {}".format(request.status_code, query))


def run_mutation(mutation):  # A simple function to use requests.post to make the API call. Note the json= section.
    request = requests.post('https://map.gugotech.com/graphql', json={'query': mutation})
    if request.status_code == 200:
        return request.json()
    else:
        raise Exception("Query failed to run by returning code of {}. {}".format(request.status_code, mutation))

# Select your transport with a defined url endpoint
transport = RequestsHTTPTransport(url="https://map.gugotech.com/graphql")

# Create a GraphQL client using the defined transport
client = Client(transport=transport, fetch_schema_from_transport=True)
lats = np.arange(float(os.environ.get("start_lat")), float(os.environ.get("end_lat")), -0.0006)
long = os.environ.get("long")
for lat in lats:
    driver = webdriver.Chrome(executable_path=binary_path, options=chrome_options)
    driver.get("https://remaps.vn/maps/info?q=" + str(lat) + "," + str(long) + ",20z")
    print('address:',"https://remaps.vn/maps/info?q=" + str(lat) + "," + str(long) + ",20z")
    WebDriverWait(driver, 10).until(lambda driver: driver.execute_script('return document.readyState') == 'complete')
    # driver.implicitly_wait(5)
    time.sleep(5)
    action = ActionChains(driver)
    el = driver.find_element_by_id('map')
    y = range(160, 600, 30)
    x = range(10, 1590, 30)
    for height in y:
        for width in x:
            print(width, height)
            action.move_to_element_with_offset(el, width, height)
            action.click()
            action.perform()
            print(driver.requests[-2].url)
            time.sleep(3)
            if "/api/search/" in driver.requests[-2].url:
                time.sleep(5)
                if hasattr(driver.requests[-2].response,'body'):
                    my_json = driver.requests[-2].response.body.decode('utf8','ignore').replace("'", '"')
                    if "polygons" in my_json:
                        print('ready to create data')
                        area = json.loads(my_json)[0]['area']
                        address = json.loads(my_json)[0]['address'].split(', ')  # số tờ, số thửa, phường, quận, tp
                        print('length address', len(address))
                        if len(address) >= 3:
                            polygons = json.loads(my_json)[0]['polygons']
                            addressIds = {}
                            newMap = {}
                            province = None
                            district = None
                            ward = None
                            if "Hồ Chí Minh" in address[3]:
                                query = """
                                {
                                    checkAddressByName(province:"TP.Hồ Chí Minh"
                                    district:\"""" + address[2] + """\"
                                    ward:\"""" + address[1] + """\"
                                    street:"Đường") {
                                        id
                                    }
                                }
                                """
                                addressIds = run_query(query)
                                province = addressIds['data']['checkAddressByName'][0]['id']
                                district = addressIds['data']['checkAddressByName'][1]['id']
                                ward = addressIds['data']['checkAddressByName'][2]['id']
                            else:
                                mapMutation = gql(
                                    """
                                    mutation createMap($province: String!, $district: String!, $ward: String!, $street: String){
                                        createMap(
                                            province: $province
                                            district: $district
                                            ward: $ward
                                            street: $street
                                            ) {
                                            province
                                            district
                                            ward
                                            street
                                            }
                                        }
                                    """
                                )
                                mapData = {"province": address[3], "district": address[2], "ward": address[1]}
                                newMap = client.execute(mapMutation, variable_values=mapData)
                                province = newMap['createMap']['province']
                                district = newMap['createMap']['district']
                                ward = newMap['createMap']['ward']
                            time.sleep(1)
                            pages = address[0].split(' ')[1]
                            lot = address[0].split(' ')[3]
                            mutation = gql(
                                """
                                mutation createLand($polygons: [[[Float]]] ,$provinceId: ObjectID! $area: Float $districtId: ObjectID!, $wardId: ObjectID!, $streetId: ObjectID, $landNumber: Int!, $mapNumber: Int!){
                                    createLand(
                                        polygon: {
                                            type:Polygon,
                                            coordinates: $polygons
                                        }
                                        provinceId: $provinceId
                                        districtId: $districtId
                                        wardId: $wardId
                                        area: $area
                                        streetId: $streetId
                                        landNumber: $landNumber
                                        mapNumber: $mapNumber
                                        ) {
                                        id
                                        }
                                    }
                                """
                            )
                            variables = {"polygons": polygons[0], "area": area, "provinceId": province, "districtId": district,
                                         "wardId": ward, "landNumber": int(lot), "mapNumber": int(pages)}
                            result = client.execute(mutation, variable_values=variables)
                            print(result)
    driver.quit()


