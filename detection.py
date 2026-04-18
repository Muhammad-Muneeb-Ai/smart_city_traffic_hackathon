import cv2
from ultralytics import YOLO

def run_detection(video_source, model_path="models/yolov8n.pt"):
    """
    Main detection loop. Ensures resources are released after processing.
    """
    model = YOLO(model_path)
    cap = cv2.VideoCapture(video_source)
    
    try:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Inference logic...
            
            # Placeholder for display
            # cv2.imshow('Tracking', frame)
            # if cv2.waitKey(1) & 0xFF == ord('q'):
            #     break
    finally:
        # CRITICAL: Resource cleanup
        cap.release()
        cv2.destroyAllWindows()
        print("Video capture and windows released.")
