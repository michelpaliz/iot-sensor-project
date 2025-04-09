import paho.mqtt.client as mqtt
import time

broker = "localhost"
topic = "home/switch1"
client = mqtt.Client("SmartSwitch1")
client.connect(broker)

state = False  # Initial OFF

try:
    while True:
        state = not state
        payload = "ON" if state else "OFF"
        client.publish(topic, payload)
        print(f"[Smart Switch 1] State: {payload}")
        time.sleep(5)
except KeyboardInterrupt:
    print("Smart Switch 1 simulation stopped.")
