#!/usr/bin/env python
# coding: utf-8

# In[6]:


import requests

url = "http://3.108.110.237/iot/iotservice.php"

payload = "{\"type\":\"fetchCode\"}"
headers = {}

response = requests.request("POST", url, headers=headers, data=payload)

print(response.text)


# In[2]:


mycode = """
void setup(){ pinMode(7, OUTPUT); } void loop(){ digitalWrite(7, HIGH); delay(1000); digitalWrite(7, LOW); delay(1000);}
"""


# In[5]:


import requests

url = "http://3.108.110.237/iot/iotservice.php"

payload = "{\"type\":\"updateCode\", \"code\":\"void setup(){ pinMode(7, OUTPUT); } void loop(){ digitalWrite(7, HIGH); delay(1000); digitalWrite(7, LOW); delay(1000);}\"}"
headers = {}

response = requests.request("POST", url, headers=headers, data=payload)

print(response.text)


# In[9]:


import time
while True:
    url = "http://3.108.110.237/iot/iotservice.php"

    payload = "{\"type\":\"getStatus\"}"
    headers = {}

    response = requests.request("POST", url, headers=headers, data=payload)

    print(response.text)
    time.sleep(1);

