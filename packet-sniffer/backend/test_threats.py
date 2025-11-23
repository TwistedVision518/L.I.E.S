from scapy.all import IP, TCP, UDP, send, Raw
import time
import random
import sys

def simulate_port_scan():
    print("[*] Simulating PORT SCAN...")
    target = "8.8.8.8" # Google DNS as dummy target
    # Send to 20 different ports
    for i in range(20):
        port = random.randint(1000, 9000)
        packet = IP(dst=target)/TCP(dport=port)
        send(packet, verbose=0)
        time.sleep(0.05)
    print("[+] Sent 20 packets to different ports. Check for 'PORT_SCAN' alert.")

def simulate_high_volume():
    print("[*] Simulating HIGH TRAFFIC VOLUME...")
    target = "8.8.8.8"
    # Send 1.5MB of data
    payload = "X" * 1400 # Max standard MTU is around 1500
    count = 800 # 800 * 1400 bytes approx 1.1MB
    
    print(f"Sending {count} large packets...")
    for i in range(count):
        packet = IP(dst=target)/UDP(dport=53)/Raw(load=payload)
        send(packet, verbose=0)
        if i % 100 == 0: print(f"Sent {i}...")
    print("[+] Data spike complete. Check for 'HIGH_VOLUME' alert.")

def simulate_secret_leak():
    print("[*] Simulating CREDENTIAL LEAK...")
    target = "8.8.8.8"
    # Simulate an unencrypted HTTP POST
    payload = "POST /login HTTP/1.1\r\nHost: example.com\r\n\r\nusername=admin&password=SuperSecret123&submit=Login"
    packet = IP(dst=target)/TCP(dport=80)/Raw(load=payload)
    send(packet, verbose=0)
    print("[+] Sent cleartext password. Check for 'SENSITIVE_DATA' alert.")

if __name__ == "__main__":
    print("=== AI SENTINEL TESTER ===")
    print("1. Simulate Port Scan")
    print("2. Simulate High Volume Traffic")
    print("3. Simulate Credential Leak")
    
    choice = input("Select test (1-3): ")
    
    if choice == '1':
        simulate_port_scan()
    elif choice == '2':
        simulate_high_volume()
    elif choice == '3':
        simulate_secret_leak()
    else:
        print("Invalid choice")
