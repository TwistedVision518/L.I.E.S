# L.I.E.S. (Layered Intrusion & Extraction System)

![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-active-brightgreen)
![Python](https://img.shields.io/badge/python-3.8%2B-blue)
![React](https://img.shields.io/badge/react-18-blue)

**L.I.E.S.** is an advanced, real-time network traffic analyzer and threat detection system designed with a premium "cyber-security" aesthetic. It combines powerful packet sniffing capabilities with a stunning, interactive dashboard to visualize network activity, detect potential threats, and map connections globally.

---

## 🚀 Features

### 🛡️ **AI Sentinel Threat Detection**
- Real-time analysis of packet headers to detect suspicious patterns.
- Alerts for potential port scans, clear-text credentials, and high-frequency traffic.
- Visual threat level indicators (Safe, High, Critical).

### 🌍 **Live Cyber Attack Map**
- Interactive 3D-style world map visualizing active network connections.
- Real-time geolocation of destination IP addresses.
- Dynamic connection lines and pulsing nodes indicating traffic intensity.

### 📦 **Deep Packet Inspection**
- Detailed breakdown of every captured packet.
- **Hex Dump & ASCII View**: Inspect the raw payload of TCP/UDP packets.
- Filter traffic by protocol (TCP, UDP, ICMP), source, or destination.

### 📊 **Traffic Analytics**
- Live traffic rate charts showing data throughput over time.
- Protocol distribution statistics (TCP vs UDP vs Other).
- Real-time packet buffering and infinite scroll management.

### 💾 **PCAP Export**
- Record your session and export captured traffic to `.pcap` format.
- Compatible with Wireshark for further analysis.

---

## 🛠️ Technology Stack

### **Frontend**
- **React 18** (Vite)
- **TailwindCSS** (Styling & Design System)
- **Recharts** (Data Visualization)
- **React Simple Maps** (Geospatial Visualization)
- **Socket.IO Client** (Real-time WebSocket communication)
- **Framer Motion** (Animations)

### **Backend**
- **Python 3.8+**
- **Flask** (Web Server)
- **Flask-SocketIO** (WebSocket Server)
- **Scapy** (Packet Sniffing & Manipulation)
- **Eventlet** (Async Networking)

---

## ⚙️ Installation

### Prerequisites
- **Python 3.8+**
- **Node.js 16+**
- **Npcap** (Windows only): **REQUIRED** for packet capturing.
  - [Download Npcap](https://npcap.com/#download)
  - **IMPORTANT:** Check "Install Npcap in WinPcap API-compatible Mode" during installation.

### 1. Clone the Repository
```bash
git clone https://github.com/TwistedVision518/L.I.E.S.git
cd L.I.E.S
```

### 2. Backend Setup
```bash
cd packet-sniffer/backend
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

---

## 🖥️ Usage

### 1. Start the Backend (Administrator Required)
Packet sniffing requires raw socket access, which needs Administrator/Root privileges.

**Windows (PowerShell as Admin):**
```powershell
cd packet-sniffer/backend
python main.py
```

**Linux/Mac:**
```bash
cd packet-sniffer/backend
sudo python main.py
```
*The server will start on `http://localhost:5001`*

### 2. Start the Frontend
Open a new terminal (normal privileges):
```bash
cd packet-sniffer/frontend
npm run dev
```
*Open your browser to `http://localhost:5173`*

---

## ⚠️ Disclaimer
**L.I.E.S.** is intended for **educational and defensive purposes only**.
- Do not use this tool on networks you do not own or have explicit permission to audit.
- The authors are not responsible for any misuse or damage caused by this software.

---

## 🤝 Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
