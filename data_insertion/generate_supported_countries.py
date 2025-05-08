import pycountry
import requests
import os
import json
import time
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("LASTFM_API_KEY")
OUTPUT_FILE = "supported_countries.json"

def get_all_country_names():
    return [country.name for country in pycountry.countries]

def is_country_supported(country):
    url = (
        f"http://ws.audioscrobbler.com/2.0/?method=geo.gettoptracks"
        f"&country={country}&api_key={API_KEY}&format=json"
    )
    try:
        res = requests.get(url)
        return res.status_code == 200 and "tracks" in res.json()
    except Exception as e:
        print(f"Error for {country}: {e}")
        return False

def generate_supported_country_list():
    supported = []
    all_countries = get_all_country_names()

    for i, country in enumerate(all_countries):
        print(f"[{i+1}/{len(all_countries)}] Checking {country}...")
        if is_country_supported(country):
            print(f"{country} is supported")
            supported.append(country)
        else:
            print(f"{country} is NOT supported")
        time.sleep(0.5)  # 防止 API rate limit

    with open(OUTPUT_FILE, "w") as f:
        json.dump(supported, f, indent=2)

    print(f"\nSaved {len(supported)} supported countries to {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_supported_country_list()
