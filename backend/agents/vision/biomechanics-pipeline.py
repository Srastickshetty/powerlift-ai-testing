"""
TITAN-AI Computer Vision Biomechanics Laboratory
YOLO-Pose integration for Mid-foot Deviation and Moment Arm Analysis
"""

import cv2
import numpy as np
import mediapipe as mp
from typing import Dict, List, Tuple, Optional
import json
from dataclasses import dataclass
from ultralytics import YOLO
import math

@dataclass
class BiomechanicsMetrics:
    """Data class for biomechanics analysis results"""
    mid_foot_deviation: float  # Horizontal distance bar-midfoot (cm)
    hip_angle: float  # Hip joint angle (degrees)
    knee_angle: float  # Knee joint angle (degrees)
    bar_path_deviation: float  # Bar path vertical deviation (cm)
    moment_arm_leakage: float  # Power leakage percentage
    phase: str  # "descent", "bottom", "ascent"
    timestamp: float  # Frame timestamp
    confidence: float  # Detection confidence

class BiomechanicsAnalyzer:
    """Advanced biomechanics analysis using YOLO-Pose and MediaPipe"""
    
    def __init__(self, model_path: str = "yolov8n-pose.pt"):
        # Initialize YOLO-Pose model
        self.pose_model = YOLO(model_path)
        
        # Initialize MediaPipe for additional analysis
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        
        # Biomechanics constants
        self.PIXELS_TO_CM = 0.1  # Calibration factor - should be dynamically set
        self.BAR_WIDTH_CM = 28.5  # Standard Olympic bar width
        self.MOMENT_ARM_THRESHOLDS = {
            'optimal': 5.0,  # cm
            'warning': 10.0,  # cm
            'critical': 15.0  # cm
        }
        
        # Joint angle thresholds
        self.JointAngles = {
            'squat_depth_threshold': 90,  # degrees
            'hip_flexion_optimal': 45,  # degrees
            'knee_flexion_optimal': 90  # degrees
        }
        
        # Tracking variables
        self.barbell_position_history = []
        self.moment_arm_history = []
        self.power_leakage_frames = []
        
    def analyze_frame(self, frame: np.ndarray, frame_number: int = 0) -> Optional[BiomechanicsMetrics]:
        """
        Analyze single frame for biomechanics metrics
        
        Args:
            frame: Input video frame
            frame_number: Frame index for tracking
            
        Returns:
            BiomechanicsMetrics object or None if detection fails
        """
        try:
            # Detect pose using YOLO-Pose
            results = self.pose_model(frame, verbose=False)
            
            if not results or len(results) == 0:
                return None
                
            pose_result = results[0]
            
            # Extract keypoints
            keypoints = self.extract_keypoints(pose_result)
            if not keypoints:
                return None
                
            # Calculate metrics
            metrics = self.calculate_biomechanics_metrics(keypoints, frame, frame_number)
            
            # Store for temporal analysis
            self.update_tracking_data(metrics)
            
            return metrics
            
        except Exception as e:
            print(f"Error analyzing frame {frame_number}: {e}")
            return None
    
    def extract_keypoints(self, pose_result) -> Optional[Dict]:
        """Extract and normalize keypoints from YOLO-Pose result"""
        if not pose_result.keypoints or len(pose_result.keypoints.xy) == 0:
            return None
            
        keypoints = pose_result.keypoints.xy[0].cpu().numpy()  # Get first person
        confidences = pose_result.keypoints.conf[0].cpu().numpy()
        
        # COCO pose format (17 keypoints)
        keypoint_names = [
            'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
            'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
            'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
            'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
        ]
        
        extracted = {}
        for i, name in enumerate(keypoint_names):
            if i < len(keypoints) and confidences[i] > 0.5:
                extracted[name] = {
                    'x': keypoints[i][0],
                    'y': keypoints[i][1],
                    'confidence': confidences[i]
                }
        
        return extracted if len(extracted) >= 10 else None  # Minimum keypoints for analysis
    
    def calculate_biomechanics_metrics(self, keypoints: Dict, frame: np.ndarray, frame_number: int) -> BiomechanicsMetrics:
        """Calculate comprehensive biomechanics metrics"""
        
        # Detect barbell position (assuming bar is visible and can be detected)
        barbell_center = self.detect_barbell_position(frame, keypoints)
        
        # Calculate mid-foot position
        mid_foot = self.calculate_mid_foot_position(keypoints)
        
        # Calculate mid-foot deviation (horizontal distance bar-midfoot)
        mid_foot_deviation = abs(barbell_center[0] - mid_foot[0]) * self.PIXELS_TO_CM
        
        # Calculate joint angles
        hip_angle = self.calculate_hip_angle(keypoints)
        knee_angle = self.calculate_knee_angle(keypoints)
        
        # Calculate bar path deviation
        bar_path_deviation = self.calculate_bar_path_deviation(barbell_center, frame_number)
        
        # Calculate moment arm leakage
        moment_arm_leakage = self.calculate_moment_arm_leakage(mid_foot_deviation, hip_angle)
        
        # Determine movement phase
        phase = self.determine_movement_phase(frame_number, hip_angle, knee_angle)
        
        # Calculate overall confidence
        confidence = self.calculate_detection_confidence(keypoints)
        
        return BiomechanicsMetrics(
            mid_foot_deviation=mid_foot_deviation,
            hip_angle=hip_angle,
            knee_angle=knee_angle,
            bar_path_deviation=bar_path_deviation,
            moment_arm_leakage=moment_arm_leakage,
            phase=phase,
            timestamp=frame_number / 30.0,  # Assuming 30 FPS
            confidence=confidence
        )
    
    def detect_barbell_position(self, frame: np.ndarray, keypoints: Dict) -> Tuple[float, float]:
        """
        Detect barbell position using computer vision techniques
        Combines keypoint analysis with edge detection
        """
        # Method 1: Estimate from hand positions (for squat/bench)
        if 'left_wrist' in keypoints and 'right_wrist' in keypoints:
            left_wrist = keypoints['left_wrist']
            right_wrist = keypoints['right_wrist']
            
            # Bar should be roughly centered between wrists
            bar_x = (left_wrist['x'] + right_wrist['x']) / 2
            bar_y = (left_wrist['y'] + right_wrist['y']) / 2
            
            return (bar_x, bar_y)
        
        # Method 2: Edge detection for barbell
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        
        # Find horizontal lines (barbell)
        lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=100, 
                               minLineLength=100, maxLineGap=10)
        
        if lines is not None and len(lines) > 0:
            # Filter for near-horizontal lines
            horizontal_lines = []
            for line in lines:
                x1, y1, x2, y2 = line[0]
                angle = abs(math.degrees(math.atan2(y2-y1, x2-x1)))
                if angle < 15 or angle > 165:  # Near horizontal
                    horizontal_lines.append(line[0])
            
            if horizontal_lines:
                # Use the longest horizontal line
                longest_line = max(horizontal_lines, key=lambda l: 
                                 math.sqrt((l[2]-l[0])**2 + (l[3]-l[1])**2))
                x1, y1, x2, y2 = longest_line
                return ((x1 + x2) / 2, (y1 + y2) / 2)
        
        # Fallback: Use shoulder position as rough estimate
        if 'left_shoulder' in keypoints and 'right_shoulder' in keypoints:
            left_shoulder = keypoints['left_shoulder']
            right_shoulder = keypoints['right_shoulder']
            return ((left_shoulder['x'] + right_shoulder['x']) / 2, 
                   (left_shoulder['y'] + right_shoulder['y']) / 2)
        
        return (frame.shape[1] / 2, frame.shape[0] / 2)  # Center of frame
    
    def calculate_mid_foot_position(self, keypoints: Dict) -> Tuple[float, float]:
        """Calculate mid-foot position from ankle keypoints"""
        if 'left_ankle' in keypoints and 'right_ankle' in keypoints:
            left_ankle = keypoints['left_ankle']
            right_ankle = keypoints['right_ankle']
            
            mid_foot_x = (left_ankle['x'] + right_ankle['x']) / 2
            mid_foot_y = (left_ankle['y'] + right_ankle['y']) / 2
            
            return (mid_foot_x, mid_foot_y)
        
        # Fallback: estimate from hip position
        if 'left_hip' in keypoints and 'right_hip' in keypoints:
            left_hip = keypoints['left_hip']
            right_hip = keypoints['right_hip']
            return ((left_hip['x'] + right_hip['x']) / 2,
                   (left_hip['y'] + right_hip['y']) / 2 + 200)  # Estimate foot position
        
        return (0, 0)
    
    def calculate_hip_angle(self, keypoints: Dict) -> float:
        """Calculate hip joint angle using shoulder, hip, knee positions"""
        required_points = ['left_shoulder', 'left_hip', 'left_knee']
        
        if all(point in keypoints for point in required_points):
            shoulder = keypoints['left_shoulder']
            hip = keypoints['left_hip']
            knee = keypoints['left_knee']
            
            # Calculate angle using vector mathematics
            angle = self.calculate_angle_3points(
                (shoulder['x'], shoulder['y']),
                (hip['x'], hip['y']),
                (knee['x'], knee['y'])
            )
            return angle
        
        return 180.0  # Default standing position
    
    def calculate_knee_angle(self, keypoints: Dict) -> float:
        """Calculate knee joint angle using hip, knee, ankle positions"""
        required_points = ['left_hip', 'left_knee', 'left_ankle']
        
        if all(point in keypoints for point in required_points):
            hip = keypoints['left_hip']
            knee = keypoints['left_knee']
            ankle = keypoints['left_ankle']
            
            angle = self.calculate_angle_3points(
                (hip['x'], hip['y']),
                (knee['x'], knee['y']),
                (ankle['x'], ankle['y'])
            )
            return angle
        
        return 180.0  # Default standing position
    
    def calculate_angle_3points(self, p1: Tuple, p2: Tuple, p3: Tuple) -> float:
        """Calculate angle between three points (p1-p2-p3)"""
        # Vectors from p2 to p1 and p2 to p3
        v1 = (p1[0] - p2[0], p1[1] - p2[1])
        v2 = (p3[0] - p2[0], p3[1] - p2[1])
        
        # Calculate angle using dot product
        dot_product = v1[0] * v2[0] + v1[1] * v2[1]
        magnitude1 = math.sqrt(v1[0]**2 + v1[1]**2)
        magnitude2 = math.sqrt(v2[0]**2 + v2[1]**2)
        
        if magnitude1 == 0 or magnitude2 == 0:
            return 180.0
        
        cos_angle = dot_product / (magnitude1 * magnitude2)
        cos_angle = max(-1, min(1, cos_angle))  # Clamp to [-1, 1]
        
        angle_rad = math.acos(cos_angle)
        angle_deg = math.degrees(angle_rad)
        
        return angle_deg
    
    def calculate_bar_path_deviation(self, current_position: Tuple[float, float], frame_number: int) -> float:
        """Calculate deviation from ideal vertical bar path"""
        if len(self.barbell_position_history) == 0:
            self.barbell_position_history.append(current_position)
            return 0.0
        
        # Get initial bar position (starting position)
        initial_position = self.barbell_position_history[0]
        
        # Calculate horizontal deviation from starting position
        horizontal_deviation = abs(current_position[0] - initial_position[0])
        
        # Convert to cm
        deviation_cm = horizontal_deviation * self.PIXELS_TO_CM
        
        # Update history
        self.barbell_position_history.append(current_position)
        
        return deviation_cm
    
    def calculate_moment_arm_leakage(self, mid_foot_deviation: float, hip_angle: float) -> float:
        """
        Calculate power leakage due to moment arm inefficiency
        Combines horizontal bar displacement with hip mechanics
        """
        # Optimal moment arm is close to zero (bar over mid-foot)
        optimal_deviation = self.MOMENT_ARM_THRESHOLDS['optimal']
        
        # Calculate leakage percentage based on deviation from optimal
        if mid_foot_deviation <= optimal_deviation:
            base_leakage = 0.0
        else:
            # Exponential increase in leakage as deviation increases
            excess_deviation = mid_foot_deviation - optimal_deviation
            base_leakage = min(50.0, excess_deviation * 2.0)  # Max 50% leakage
        
        # Adjust for hip angle (poor hip position increases leakage)
        hip_efficiency = 1.0
        if hip_angle < self.JointAngles['hip_flexion_optimal']:
            hip_efficiency = hip_angle / self.JointAngles['hip_flexion_optimal']
        
        total_leakage = base_leakage * (2.0 - hip_efficiency)  # Poor form amplifies leakage
        
        # Store for analysis
        self.moment_arm_history.append({
            'deviation': mid_foot_deviation,
            'leakage': total_leakage,
            'hip_angle': hip_angle
        })
        
        return min(100.0, total_leakage)  # Cap at 100%
    
    def determine_movement_phase(self, frame_number: int, hip_angle: float, knee_angle: float) -> str:
        """Determine current phase of movement based on joint angles and history"""
        if len(self.moment_arm_history) < 2:
            return "descent"  # Default to descent for initial frames
        
        # Check if we're at bottom position
        if hip_angle <= self.JointAngles['squat_depth_threshold']:
            return "bottom"
        
        # Determine direction based on angle trends
        recent_angles = [entry['hip_angle'] for entry in self.moment_arm_history[-5:]]
        if len(recent_angles) >= 2:
            angle_trend = recent_angles[-1] - recent_angles[-2]
            if angle_trend > 2:  # Hip angle increasing
                return "ascent"
            elif angle_trend < -2:  # Hip angle decreasing
                return "descent"
        
        return "transition"  # Between phases
    
    def calculate_detection_confidence(self, keypoints: Dict) -> float:
        """Calculate overall confidence in pose detection"""
        if not keypoints:
            return 0.0
        
        confidences = [kp['confidence'] for kp in keypoints.values()]
        return np.mean(confidences)
    
    def update_tracking_data(self, metrics: BiomechanicsMetrics):
        """Update tracking data for temporal analysis"""
        # Store frames with significant power leakage
        if metrics.moment_arm_leakage > 20.0:  # Threshold for significant leakage
            self.power_leakage_frames.append({
                'frame_number': int(metrics.timestamp * 30),
                'deviation': metrics.mid_foot_deviation,
                'leakage': metrics.moment_arm_leakage,
                'phase': metrics.phase
            })
    
    def generate_heatmap_data(self) -> Dict:
        """Generate heatmap data for moment arm leakage visualization"""
        if not self.moment_arm_history:
            return {'heatmap': [], 'max_leakage': 0, 'frames': []}
        
        # Create heatmap grid
        max_leakage = max(entry['leakage'] for entry in self.moment_arm_history)
        frames = len(self.moment_arm_history)
        
        heatmap_data = []
        for i, entry in enumerate(self.moment_arm_history):
            heatmap_data.append({
                'frame': i,
                'deviation': entry['deviation'],
                'leakage': entry['leakage'],
                'intensity': entry['leakage'] / max_leakage if max_leakage > 0 else 0
            })
        
        return {
            'heatmap': heatmap_data,
            'max_leakage': max_leakage,
            'frames': frames,
            'critical_frames': self.power_leakage_frames
        }
    
    def get_analysis_summary(self) -> Dict:
        """Generate comprehensive analysis summary"""
        if not self.moment_arm_history:
            return {'error': 'No data available for analysis'}
        
        # Calculate statistics
        deviations = [entry['deviation'] for entry in self.moment_arm_history]
        leakages = [entry['leakage'] for entry in self.moment_arm_history]
        
        summary = {
            'total_frames': len(self.moment_arm_history),
            'avg_deviation': np.mean(deviations),
            'max_deviation': np.max(deviations),
            'avg_leakage': np.mean(leakages),
            'max_leakage': np.max(leakages),
            'power_leakage_frames': len(self.power_leakage_frames),
            'leakage_percentage': (len(self.power_leakage_frames) / len(self.moment_arm_history)) * 100,
            'heatmap_data': self.generate_heatmap_data()
        }
        
        # Add recommendations
        summary['recommendations'] = self.generate_recommendations(summary)
        
        return summary
    
    def generate_recommendations(self, summary: Dict) -> List[str]:
        """Generate coaching recommendations based on analysis"""
        recommendations = []
        
        if summary['avg_deviation'] > self.MOMENT_ARM_THRESHOLDS['warning']:
            recommendations.append(
                f"Focus on keeping bar over mid-foot. Average deviation: {summary['avg_deviation']:.1f}cm"
            )
        
        if summary['leakage_percentage'] > 30:
            recommendations.append(
                f"Power leakage detected in {summary['leakage_percentage']:.1f}% of frames. Review bar path."
            )
        
        if summary['max_leakage'] > 40:
            recommendations.append(
                "Critical moment arm leakage detected. Consider deloading and technique work."
            )
        
        return recommendations

# Example usage and testing
if __name__ == "__main__":
    # Initialize analyzer
    analyzer = BiomechanicsAnalyzer()
    
    # Test with sample frame (would be replaced with actual video frame)
    print("TITAN-AI Biomechanics Laboratory initialized")
    print("Ready for video analysis...")
    print(f"Model loaded: yolov8n-pose.pt")
    print(f"Optimal moment arm threshold: {analyzer.MOMENT_ARM_THRESHOLDS['optimal']}cm")
