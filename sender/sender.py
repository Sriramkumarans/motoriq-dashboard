import time
import random
import requests

API = "http://65.0.107.129:8000/predict"

while True:

    features = {

        # -------- Vibration Sensor 1 --------

        "vib1_mean": random.uniform(-0.01,0.01),
        "vib1_std": random.uniform(0.1,0.8),
        "vib1_rms": random.uniform(0.2,2.5),
        "vib1_max": random.uniform(1,5),
        "vib1_min": random.uniform(-5,-1),
        "vib1_peak_to_peak": random.uniform(2,10),
        "vib1_skewness": random.uniform(-1,1),
        "vib1_kurtosis": random.uniform(2,6),
        "vib1_crest_factor": random.uniform(2,5),
        "vib1_dominant_freq": random.uniform(20,500),
        "vib1_band_energy_0_500": random.uniform(0,20),
        "vib1_band_energy_500_2000": random.uniform(0,10),
        "vib1_band_energy_2000_5000": random.uniform(0,5),

        # -------- Vibration Sensor 2 --------

        "vib2_mean": random.uniform(-0.01,0.01),
        "vib2_std": random.uniform(0.1,0.8),
        "vib2_rms": random.uniform(0.2,2.5),
        "vib2_max": random.uniform(1,5),
        "vib2_min": random.uniform(-5,-1),
        "vib2_peak_to_peak": random.uniform(2,10),
        "vib2_skewness": random.uniform(-1,1),
        "vib2_kurtosis": random.uniform(2,6),
        "vib2_crest_factor": random.uniform(2,5),
        "vib2_dominant_freq": random.uniform(20,500),
        "vib2_band_energy_0_500": random.uniform(0,20),
        "vib2_band_energy_500_2000": random.uniform(0,10),
        "vib2_band_energy_2000_5000": random.uniform(0,5),

        # -------- Vibration Sensor 3 --------

        "vib3_mean": random.uniform(-0.01,0.01),
        "vib3_std": random.uniform(0.1,0.8),
        "vib3_rms": random.uniform(0.2,2.5),
        "vib3_max": random.uniform(1,5),
        "vib3_min": random.uniform(-5,-1),
        "vib3_peak_to_peak": random.uniform(2,10),
        "vib3_skewness": random.uniform(-1,1),
        "vib3_kurtosis": random.uniform(2,6),
        "vib3_crest_factor": random.uniform(2,5),
        "vib3_dominant_freq": random.uniform(20,500),
        "vib3_band_energy_0_500": random.uniform(0,20),
        "vib3_band_energy_500_2000": random.uniform(0,10),
        "vib3_band_energy_2000_5000": random.uniform(0,5),

        # Temperature

        "temperature_mean": random.uniform(35,70),
        "temperature_std": random.uniform(0.5,2),
        "temperature_max": random.uniform(50,80),
        "temperature_min": random.uniform(30,50),

        # Operating Conditions

        "speed_code": random.randint(1,8),
        "load_code": random.randint(0,1)

    }

    response = requests.post(
        API,
        json={
            "features": features
        }
    )

    print(response.json())

    time.sleep(3)