from flask import Flask, send_file
from flask_socketio import SocketIO
from flask_cors import CORS
from scapy.all import sniff, IP, TCP, UDP, conf, Raw
from scapy.utils import PcapWriter
import threading
import json
import time
import logging
from collections import defaultdict
import re
import requests
import ipaddress
import os

# Force Scapy to use Layer 3 socket (works better without full Npcap driver)
conf.L3socket = conf.L3socket

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

is_capturing = False
pcap_writer = None

class GeoLocator:
    def __init__(self):
        self.cache = {} # IP -> Location String
        self.pending = set()
        self.last_request_time = 0
        self.MIN_INTERVAL = 1.5 # Seconds between API calls (45/min limit)

    def is_public_ip(self, ip):
        try:
            ip_obj = ipaddress.ip_address(ip)
            return not ip_obj.is_private and not ip_obj.is_loopback and not ip_obj.is_link_local
        except ValueError:
            return False

    def resolve(self, ip):
        if ip in self.cache:
            return self.cache[ip]
        
        if not self.is_public_ip(ip):
            return "Local Network"
            
        if ip in self.pending:
            return "Resolving..."

        # Start background lookup
        self.pending.add(ip)
        threading.Thread(target=self._fetch_location, args=(ip,)).start()
        return "Resolving..."

    def _fetch_location(self, ip):
        # Simple rate limiting
        time_since_last = time.time() - self.last_request_time
        if time_since_last < self.MIN_INTERVAL:
            time.sleep(self.MIN_INTERVAL - time_since_last)
        
        try:
            self.last_request_time = time.time()
            response = requests.get(f"http://ip-api.com/json/{ip}", timeout=5)
            if response.status_code == 200:
                data = response.json()
                if data['status'] == 'success':
                    location_str = f"{data.get('countryCode', '')} {data.get('city', '')}"
                    geo_info = {
                        "lat": data.get('lat'),
                        "lon": data.get('lon'),
                        "location": location_str
                    }
                    self.cache[ip] = geo_info
                    # Emit update immediately
                    socketio.emit('geo_update', {'ip': ip, 'geo_info': geo_info})
                else:
                    self.cache[ip] = None
            else:
                self.cache[ip] = None
        except Exception as e:
            logger.error(f"Geo lookup failed for {ip}: {e}")
            self.cache[ip] = None
        finally:
            if ip in self.pending:
                self.pending.remove(ip)

class ThreatDetector:
    def __init__(self):
        self.port_scan_tracker = defaultdict(set) # IP -> Set of ports
        self.byte_tracker = defaultdict(int)      # IP -> Total bytes
        self.start_time = time.time()
        self.WINDOW_SIZE = 10 # seconds

    def analyze(self, packet_data, raw_payload=None):
        alerts = []
        src_ip = packet_data.get('src')
        dst_port = packet_data.get('dst_port')
        length = packet_data.get('len', 0)
        
        current_time = time.time()
        
        # Reset window if needed
        if current_time - self.start_time > self.WINDOW_SIZE:
            self.port_scan_tracker.clear()
            self.byte_tracker.clear()
            self.start_time = current_time

        if src_ip and src_ip != "N/A":
            # 1. Port Scan Detection
            if dst_port:
                self.port_scan_tracker[src_ip].add(dst_port)
                if len(self.port_scan_tracker[src_ip]) > 10:
                    alerts.append({
                        "type": "PORT_SCAN",
                        "level": "HIGH",
                        "message": f"Port scan detected from {src_ip} (targets: {len(self.port_scan_tracker[src_ip])} ports)"
                    })
                    self.port_scan_tracker[src_ip].clear() # Prevent spamming

            # 2. High Volume (Exfiltration)
            self.byte_tracker[src_ip] += length
            if self.byte_tracker[src_ip] > 1000000: # 1MB in 10s
                alerts.append({
                    "type": "HIGH_VOLUME",
                    "level": "MEDIUM",
                    "message": f"High traffic volume from {src_ip} (>1MB/10s)"
                })
                self.byte_tracker[src_ip] = 0 # Reset

        # 3. Cleartext Secrets (Basic Regex)
        if raw_payload:
            payload_str = str(raw_payload)
            if re.search(r'(password|passwd|api_key|secret)=', payload_str, re.IGNORECASE):
                alerts.append({
                    "type": "SENSITIVE_DATA",
                    "level": "CRITICAL",
                    "message": f"Potential cleartext secret found in packet from {src_ip}"
                })

        return alerts

detector = ThreatDetector()
geo_locator = GeoLocator()

def packet_callback(packet):
    global pcap_writer
    if not is_capturing:
        return

    try:
        # Write to PCAP
        if pcap_writer:
            pcap_writer.write(packet)

        # Basic parsing
        packet_data = {
            "timestamp": time.time(),
            "len": len(packet),
            "summary": packet.summary(),
            "src": "N/A",
            "dst": "N/A",
            "proto": "Other",
            "dst_port": None,
            "geo": "Resolving...", # Display string
            "lat": None,
            "lon": None,
            "payload_hex": "",
            "payload_ascii": ""
        }

        raw_payload = None

        if IP in packet:
            packet_data["src"] = packet[IP].src
            packet_data["dst"] = packet[IP].dst
            packet_data["proto"] = "IP"
            
            # Resolve Location for Destination
            geo_data = geo_locator.resolve(packet_data["dst"])
            if isinstance(geo_data, dict):
                packet_data["geo"] = geo_data.get("location", "Unknown")
                packet_data["lat"] = geo_data.get("lat")
                packet_data["lon"] = geo_data.get("lon")
            elif isinstance(geo_data, str):
                packet_data["geo"] = geo_data
        
        if TCP in packet:
            packet_data["proto"] = "TCP"
            packet_data["dst_port"] = packet[TCP].dport
            if Raw in packet:
                raw_payload = packet[Raw].load
        elif UDP in packet:
            packet_data["proto"] = "UDP"
            packet_data["dst_port"] = packet[UDP].dport
        elif "ICMP" in packet:
             packet_data["proto"] = "ICMP"

        # Extract Payload
        if raw_payload:
            packet_data["payload_hex"] = raw_payload.hex()
            # Create safe ASCII representation
            packet_data["payload_ascii"] = ''.join(chr(b) if 32 <= b < 127 else '.' for b in raw_payload)

        # Emit packet
        socketio.emit('packet', packet_data)

        # Analyze for threats
        alerts = detector.analyze(packet_data, raw_payload)
        for alert in alerts:
            logger.warning(f"THREAT DETECTED: {alert['message']}")
            socketio.emit('threat', alert)
        
    except Exception as e:
        logger.error(f"Error parsing packet: {e}")

def start_sniffing():
    global is_capturing
    logger.info("Starting packet capture...")
    
    # Debug: List interfaces
    from scapy.all import get_if_list
    logger.info(f"Available interfaces: {get_if_list()}")

    try:
        # Use a simple filter to avoid capturing our own traffic if possible, though tricky without knowing IP
        sniff(prn=packet_callback, store=False, stop_filter=lambda x: not is_capturing)
    except Exception as e:
        logger.error(f"Sniffing error: {e}")
    finally:
        is_capturing = False
        if pcap_writer:
            pcap_writer.close()
            pcap_writer = None
        socketio.emit('status', {'is_capturing': False})
        logger.info("Packet capture stopped.")

@app.route('/api/download_pcap')
def download_pcap():
    try:
        if os.path.exists('capture.pcap'):
            return send_file('capture.pcap', as_attachment=True, download_name='capture.pcap')
        else:
            return "No capture file found", 404
    except Exception as e:
        return str(e), 500

@socketio.on('connect')
def handle_connect():
    logger.info("Client connected")

@socketio.on('disconnect')
def handle_disconnect():
    logger.info("Client disconnected")

@socketio.on('start_capture')
def handle_start_capture():
    global is_capturing, pcap_writer
    if not is_capturing:
        is_capturing = True
        
        # Initialize PCAP writer (overwrite existing)
        try:
            pcap_writer = PcapWriter("capture.pcap", append=True, sync=True)
        except Exception as e:
            logger.error(f"Failed to initialize PcapWriter: {e}")

        socketio.start_background_task(start_sniffing)
        socketio.emit('status', {'is_capturing': True})
        logger.info("Capture started by client request")

@socketio.on('stop_capture')
def handle_stop_capture():
    global is_capturing, pcap_writer
    if is_capturing:
        is_capturing = False
        if pcap_writer:
            pcap_writer.close()
            pcap_writer = None
        socketio.emit('status', {'is_capturing': False})
        logger.info("Capture stopped by client request")

if __name__ == '__main__':
    logger.info("Starting server on port 5001...")
    socketio.run(app, host='0.0.0.0', port=5001, allow_unsafe_werkzeug=True)
