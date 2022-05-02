#get user details connected to port 3030
import json
import requests
import os

user = os.environ['USER']
url = 'http://localhost:3030/user/' + user
r = requests.get(url)
data = r.json()
print(data)
