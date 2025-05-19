import json
from flask import Flask, jsonify, render_template
import paho.mqtt.client as mqtt
import threading

latest_data = {}
# Add these at the top (global variables)
temperature_history = []
humidity_history = []

app = Flask(__name__)

@app.route('/')
def home():
    return render_template("dashboard.html")

@app.route('/api/sensor', methods=['GET'])
def get_sensor_data():
    if latest_data:
        return jsonify(latest_data)
    else:
        return jsonify({"error": "No data yet"}), 404
    
@app.route('/api/history')
def get_history():
    return jsonify({
        'temperature': temperature_history[-20:],  # last 20 samples
        'humidity': humidity_history[-20:]
    })

def on_connect(client, userdata, flags, rc):
    print("✅ Connected to MQTT with result code", rc)
    client.subscribe("zigbee2mqtt/#")  # Subscribe to all Zigbee2MQTT device topics


# Initialize with some default values
temperature_history = [0]  # Start with one zero value
humidity_history = [0]     # Start with one zero value

def on_message(client, userdata, msg):
    global latest_data, temperature_history, humidity_history
    try:
        payload = json.loads(msg.payload.decode())
        print(f"Raw MQTT payload: {payload}")  # Debug log
        
        if 'temperature' in payload or 'humidity' in payload:
            # Convert to float to ensure number format
            temperature = float(payload.get('temperature', 0))
            humidity = float(payload.get('humidity', 0))

            temperature_history.append(temperature)
            humidity_history.append(humidity)
            
            # Keep history to reasonable size
            if len(temperature_history) > 20:
                temperature_history = temperature_history[-20:]
            if len(humidity_history) > 20:
                humidity_history = humidity_history[-20:]

            latest_data = {
                'temperature': temperature,
                'humidity': humidity,
                'battery': payload.get('battery', 'N/A'),
                'voltage': payload.get('voltage', 'N/A'),
            }
            print(f"📥 Processed sensor data: {latest_data}")
    except Exception as e:
        print("⚠️ Failed to parse MQTT message:", e)

# def on_message(client, userdata, msg):
#     global latest_data, temperature_history, humidity_history
#     try:
#         payload = json.loads(msg.payload.decode())

#         # Extract and store history
#         temperature = payload.get('temperature')
#         humidity = payload.get('humidity')

#         if temperature is not None:
#             temperature_history.append(temperature)
#         if humidity is not None:
#             humidity_history.append(humidity)

#         latest_data = {
#             'temperature': temperature,
#             'humidity': humidity,
#             'battery': payload.get('battery', 'N/A'),
#             'voltage': payload.get('voltage', 'N/A'),
#         }

#         print(f"📥 New sensor data: {latest_data}")
#     except Exception as e:
#         print("⚠️ Failed to parse MQTT message:", e)



def start_mqtt():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect("localhost", 1883, 60)
    client.loop_forever()

if __name__ == '__main__':
    mqtt_thread = threading.Thread(target=start_mqtt)
    mqtt_thread.daemon = True
    mqtt_thread.start()

    app.run(host='0.0.0.0', port=5000)
