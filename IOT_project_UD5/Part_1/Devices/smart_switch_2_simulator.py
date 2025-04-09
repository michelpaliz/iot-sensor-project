import paho.mqtt.client as mqtt
import time

broker = "localhost"
topic = "home/switch2"
client = mqtt.Client("SmartSwitch2")
client.connect(broker)

state = False

try:
    while True:
        state = not state
        payload = "ON" if state else "OFF"
        client.publish(topic, payload)
        print(f"[Smart Switch 2] State: {payload}")
        time.sleep(7)
except KeyboardInterrupt:
    print("Smart Switch 2 simulation stopped.")
