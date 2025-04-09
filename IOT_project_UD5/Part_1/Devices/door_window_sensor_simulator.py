import paho.mqtt.client as mqtt
import time
import random

broker = "localhost"
topic = "home/door_sensor"
client = mqtt.Client("DoorSensor")
client.connect(broker)

states = ["OPEN", "CLOSED"]

try:
    while True:
        state = random.choice(states)
        client.publish(topic, state)
        print(f"[Door Sensor] State: {state}")
        time.sleep(random.randint(5, 10))
except KeyboardInterrupt:
    print("Door sensor simulation stopped.")
