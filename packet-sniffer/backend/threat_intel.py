import requests
import logging
import threading
import time
from datetime import datetime

logger = logging.getLogger(__name__)

class ThreatIntel:
    def __init__(self):
        self.malicious_ips = set()
        self.last_update = None
        self.update_interval = 86400  # 24 hours
        # FireHOL Level 1: The most reliable IP lists (CyberCrime, Botnets, etc.)
        self.blocklist_url = "https://raw.githubusercontent.com/firehol/blocklist-ipsets/master/firehol_level1.netset"
        self.lock = threading.Lock()
        
        # Start background update
        self.update_thread = threading.Thread(target=self._periodic_update, daemon=True)
        self.update_thread.start()

    def _periodic_update(self):
        while True:
            self._update_blocklist()
            time.sleep(self.update_interval)

    def _update_blocklist(self):
        try:
            logger.info("Downloading Threat Intel blocklist...")
            response = requests.get(self.blocklist_url, timeout=10)
            if response.status_code == 200:
                new_ips = set()
                for line in response.text.splitlines():
                    line = line.strip()
                    # Skip comments and empty lines
                    if not line or line.startswith('#'):
                        continue
                    
                    # Handle CIDR notation (simplified: just take the IP part for exact matching for now)
                    # A proper implementation would use ipaddress module for CIDR checks, 
                    # but for performance in Python without a specialized trie, exact match is faster.
                    # We'll strip the CIDR suffix for the base IP.
                    ip = line.split('/')[0]
                    new_ips.add(ip)
                
                with self.lock:
                    self.malicious_ips = new_ips
                    self.last_update = datetime.now()
                
                logger.info(f"Threat Intel updated. Loaded {len(new_ips)} malicious IPs.")
            else:
                logger.error(f"Failed to download blocklist: {response.status_code}")
        except Exception as e:
            logger.error(f"Error updating threat intel: {e}")

    def check_ip(self, ip):
        """
        Check if an IP is in the blocklist.
        Returns a dict with threat details or None.
        """
        # Skip local IPs
        if ip.startswith('192.168.') or ip.startswith('10.') or ip.startswith('127.'):
            return None

        with self.lock:
            if ip in self.malicious_ips:
                return {
                    "type": "KNOWN_MALICIOUS_IP",
                    "message": f"Destination {ip} is on a known blocklist (FireHOL L1).",
                    "level": "CRITICAL",
                    "source": "ThreatIntel Feed"
                }
        return None
