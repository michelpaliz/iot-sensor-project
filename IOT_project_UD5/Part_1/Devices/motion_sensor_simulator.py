import paho.mqtt.client as mqtt
import time
import random

broker = "localhost"
topic = "home/motion_sensor"
client = mqtt.Client("MotionSensor")
client.connect(broker)

try:
    while True:
        motion = random.choice([True, False])
        payload = "MOTION DETECTED" if motion else "NO MOTION"
        client.publish(topic, payload)
        print(f"[Motion Sensor] Status: {payload}")
        time.sleep(random.randint(3, 8))
except KeyboardInterrupt:
    print("Motion sensor simulation stopped.")
