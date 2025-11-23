import numpy as np
from sklearn.ensemble import IsolationForest
import threading
import logging

logger = logging.getLogger(__name__)

class AnomalyDetector:
    def __init__(self):
        # Isolation Forest is good for unsupervised anomaly detection
        self.model = IsolationForest(contamination=0.01, random_state=42)
        self.data_buffer = []
        self.buffer_size = 1000
        self.is_trained = False
        self.lock = threading.Lock()
        
        # Features: [Packet Length, Destination Port (normalized)]
        
    def train(self):
        with self.lock:
            if len(self.data_buffer) < 100:
                return
            
            X = np.array(self.data_buffer)
            self.model.fit(X)
            self.is_trained = True
            logger.info(f"ML Model retrained on {len(X)} packets.")

    def analyze(self, packet_data):
        """
        Returns an anomaly score (-1 for anomaly, 1 for normal)
        """
        try:
            length = packet_data.get('len', 0)
            port = packet_data.get('dst_port') or 0
            
            features = [length, port]
            
            with self.lock:
                self.data_buffer.append(features)
                if len(self.data_buffer) > self.buffer_size:
                    self.data_buffer.pop(0)
            
            # Train periodically (simplified: train if not trained, or every N packets)
            if not self.is_trained and len(self.data_buffer) >= 100:
                self.train()
            
            if self.is_trained:
                # Predict returns -1 for outlier, 1 for inlier
                prediction = self.model.predict([features])[0]
                if prediction == -1:
                    return {
                        "type": "ML_ANOMALY",
                        "level": "HIGH",
                        "message": f"ML detected anomalous packet (Len: {length}, Port: {port})",
                        "source": "AI Engine"
                    }
            
            return None
            
        except Exception as e:
            logger.error(f"ML Analysis failed: {e}")
            return None
