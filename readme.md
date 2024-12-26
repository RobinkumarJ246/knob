# Retrofitting Smart Knob for Cooktops

## 🌟 Overview
Elevate your cooking experience with the **Retrofitting Smart Knob**, a revolutionary solution designed to enhance safety, precision, and convenience for traditional cooktops. This smart knob integrates seamlessly with a mobile app built on **React Native (Expo SDK 51)** and leverages **MQTT** for local communication, ensuring functionality even in offline mode.

---

## 🏆 AtomQuest Challenge
This project is developed as part of the prestigious **AtomQuest Challenge**, an initiative by **Atomberg** to inspire smart and energy-efficient innovations. Atomberg, known for its revolutionary appliances, motivates young innovators to create impactful solutions. The Retrofitting Smart Knob embodies this vision, combining technology and user-centric design to redefine modern cooking.

---

## ✨ Features

### 🛠️ **Smart Functionality**
- **Offline Connectivity:**
  - Operates without internet access using MQTT.
- **Real-Time Monitoring:**
  - Keep track of your cooktop's status effortlessly.

### ⚠️ **Advanced Safety Features**
- **Knob Left On Alerts:**
  - Get notified if the knob is left on for too long.
- **Gas Leakage Detection:**
  - Instant alerts for gas leaks to ensure a safer environment.

### 🍳 **Intelligent Cooking Modes**
- **Precision Cooking:**
  - Automate tasks like boiling milk without the risk of overboiling.
- **Recipe Modes:**
  - Access preset modes for a variety of recipes.
- **Future Enhancements:**
  - Upcoming updates will bring smarter, autonomous actions for cooking.

### 📱 **User-Friendly App**
- **Seamless Control:**
  - Turn the knob on/off, adjust settings, and monitor real-time status from the app.
- **Customizable Alerts and Modes:**
  - Tailor alerts and cooking modes to suit your needs.

---

## 🛠️ Hardware Specifications

### **Key Components**
- **Microcontroller:** ESP32
- **Gas Sensor:** MQ5
- **Temperature Sensor:** DS18B20
- **Rotary Encoder:** KY-040
- **Stepper Motor:** 28BYJ-48 (ULN2003 Driver)
- **Battery:** Li-Po 3.7V (2000mAh)
- **Wireless Charger Module:** Qi
- **LDO Voltage Regulator:** AMS1117

### **Hardware Setup**
1. **Fit the Knob:** Install the smart knob on your cooktop.
2. **Power On:** Switch on the knob to host an access point.
3. **Connect to the Knob:**
   - Use your phone to connect to the access point.
   - Enter the SSID and password of your network or hotspot.
4. **App Configuration:**
   - Open the app, configure the connected knob, add it to the dashboard, and start using it!

---

## 🧠 Firmware
- **Programming Language:** C/C++
- **Communication Protocol:** MQTT
- **Real-Time OS:** FreeRTOS
- **Security:** AES and TLS
- **MQTT Libraries:** MQTT.js, PubSubClient, Async MQTT (Broker)

---

## 📲 Mobile App
- **Framework:** React Native
- **Platform Compatibility:** Android and iOS
- **Features:**
  - Configure and control the knob.
  - Monitor cooking status and receive alerts.

---

## 🚀 Installation and Usage

### **Knob Integration**
1. Install the knob on your cooktop.
2. Power on the knob to initiate the access point.
3. Connect to the knob's access point using your phone.
4. Configure the knob with your network credentials.
5. Use the app to monitor, control, and customize settings for the knob.

---

## 🌐 Cloud and Future Developments
- **Cloud Connectivity (In Development):**
  - Cloud functionality will enable alerts from the knob to users remotely.
  - Due to the sensitive nature of the project, cloud integration is limited to essential alerts.
- **Enhanced Cooking Modes:**
  - More recipe options and intelligent modes are coming soon.
- **Autonomous Features:**
  - Smarter actions powered by AI will be integrated in future updates.
- **Product Refinement:**
  - Current components are for prototyping; the final product will feature a professionally designed PCB.

---

## 🌟 Technologies Used

### **Hardware**
- ESP32, MQ5, DS18B20, KY-040 Rotary Encoder, 28BYJ-48 Stepper Motor, Li-Po Battery, Qi Wireless Charger, AMS1117 Regulator

### **Firmware**
- **Languages:** C/C++
- **Communication:** MQTT
- **Real-Time OS:** FreeRTOS
- **Security:** AES, TLS

### **Software**
- **Mobile App Framework:** React Native (Expo SDK 51)
- **MQTT Libraries:** MQTT.js, PubSubClient, Async MQTT

---

## 💡 Future Enhancements
- **Smarter Cooking Modes:**
  - Automate more complex recipes with precision.
- **Predictive Insights:**
  - Machine learning for personalized cooking recommendations.
- **Cloud Expansion:**
  - Enable advanced remote monitoring and control.

---

## 🤝 Contributors
- Kiran Sekar S
- Koushika Devi S
- Lathikaa Shri S
- Robinkumar J

---

## 📜 License
This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more details.

---

## 🙌 Acknowledgments
Special thanks to the open-source community and the developers of **React Native**, **MQTT**, and **FreeRTOS** for providing tools that made this project possible.