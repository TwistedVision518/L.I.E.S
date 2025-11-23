# Network Packet Sniffer (Wireshark Lite)

A real-time network traffic analyzer built with Python (Scapy) and React.

## Features
- **Real-time Packet Capture**: Sniffs TCP, UDP, and ICMP packets.
- **Live Visualization**: See traffic rates and protocol distribution charts.
- **Detailed Inspection**: View source, destination, and protocol details for every packet.
- **Hacker UI**: Dark mode, monospace font, and cyber-security aesthetic.

## Prerequisites
- **Python 3.8+**
- **Node.js 16+**
- **Npcap** (Windows only): Required for packet capturing. [Download Npcap](https://npcap.com/#download) (Install with "WinPcap API-compatible Mode").

## Installation

1.  **Backend Setup**
    ```bash
    cd backend
    pip install -r requirements.txt
    ```

2.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    ```

## Running the Project

### 1. Start the Backend (Must be run as Administrator)
Open a terminal as **Administrator** (Right-click -> Run as Administrator) and run:
```bash
cd backend
python main.py
```
The server will start on `http://localhost:5000`.

### 2. Start the Frontend
Open a new terminal (normal privileges is fine) and run:
```bash
cd frontend
npm run dev
```
Open your browser to `http://localhost:5173`.

## Troubleshooting
- **No packets showing?** Ensure you installed Npcap and are running the Python script as Administrator.
- **"Dll load failed"?** You might be missing Npcap.
