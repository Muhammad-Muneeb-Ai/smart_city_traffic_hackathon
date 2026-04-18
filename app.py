import streamlit as st
import cv2
import torch
import numpy as np
import pandas as pd
import time
import os
import sqlite3
from datetime import datetime
from PIL import Image
from ultralytics import YOLO
from deep_sort_realtime.deepsort_tracker import DeepSort
import easyocr

from database import db, init_db

# --- 2. Design & Styling (Recipe 8: Clean Utility) ---
def inject_custom_css():
    st.markdown("""
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap');
        
        html, body, [class*="css"] {
            font-family: 'Inter', sans-serif;
            background-color: #f5f5f5;
        }
        
        .stApp {
            background-color: #f5f5f5;
        }
        
        /* Card Styling */
        .stat-card {
            background-color: white;
            padding: 1.5rem;
            border-radius: 24px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            border: 1px solid #eee;
            margin-bottom: 1rem;
        }
        
        .stat-label {
            color: #9e9e9e;
            font-size: 0.8rem;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.05em;
        }
        
        .stat-value {
            font-size: 2.2rem;
            font-weight: 300;
            color: #1a1a1a;
        }
        
        /* Header styling */
        .main-header {
            font-weight: 600;
            font-size: 2rem;
            letter-spacing: -0.02em;
            margin-bottom: 2rem;
        }
        </style>
    """, unsafe_allow_html=True)

def kpi_card(label, value):
    st.markdown(f"""
        <div class="stat-card">
            <div class="stat-label">{label}</div>
            <div class="stat-value">{value}</div>
        </div>
    """, unsafe_allow_html=True)

# --- 3. Model Loading & Analytics ---
@st.cache_resource
def load_models():
    # Load YOLOv8 Nano
    vehicle_model = YOLO('yolov8n.pt')
    
    # Try to load custom plate model if exists, else use standard for demo
    plate_model = None
    if os.path.exists('best.pt'):
        plate_model = YOLO('best.pt')
    
    # Initialize DeepSORT
    tracker = DeepSort(max_age=30, n_init=3, nms_max_overlap=1.0, max_cosine_distance=0.2)
    
    # Initialize EasyOCR
    reader = easyocr.Reader(['en'], gpu=torch.cuda.is_available())
    
    return vehicle_model, plate_model, tracker, reader

def perform_ocr(reader, image_crop):
    try:
        results = reader.readtext(image_crop)
        if results:
            # Get text with highest confidence
            text = results[0][1]
            conf = results[0][2]
            if conf > 0.5:
                # Basic cleanup
                return "".join(e for e in text if e.isalnum()).upper()
    except:
        pass
    return "NOT_DETECTED"

# --- 4. Main Application ---
def main():
    st.set_page_config(page_title="TrafficFlow AI", layout="wide")
    inject_custom_css()
    init_db()
    
    st.markdown('<div class="main-header">TrafficFlow AI / Monitoring Dashboard</div>', unsafe_allow_html=True)
    
    # Pre-load Models
    vehicle_model, plate_model, tracker, reader = load_models()
    
    # Sidebar
    st.sidebar.title("Configuration")
    confidence_threshold = st.sidebar.slider("Detection Confidence", 0.1, 1.0, 0.45)
    line_position_ratio = st.sidebar.slider("Virtual Line Position (Y)", 0.1, 0.9, 0.6)
    process_frame_skip = st.sidebar.selectbox("Frame Skip (for speed)", [1, 2, 3, 5], index=1)
    
    upload_file = st.sidebar.file_uploader("Upload Traffic Video", type=["mp4", "avi", "mov"])
    
    # Session State for stats and playback
    if 'processing' not in st.session_state:
        st.session_state.processing = False
    if 'playing' not in st.session_state:
        st.session_state.playing = True
    
    # Main Deck
    col_main, col_stats = st.columns([2, 1])
    
    with col_main:
        video_placeholder = st.empty()
        
        # --- NEW: Playback Controls UI ---
        st.markdown('<div style="margin-top: -30px;"></div>', unsafe_allow_html=True)
        c1, c2, c3, c4 = st.columns([0.5, 3, 0.8, 0.5])
        
        with c1:
            if st.button("⏯️"):
                st.session_state.playing = not st.session_state.playing
        
        with c2:
            # We'll initialize the slider with a dummy range first, then update it
            seek_bar = st.empty()
            
        with c3:
             st.selectbox("Speed", [0.5, 1.0, 1.5, 2.0], index=1, label_visibility="collapsed")
             
        with c4:
             st.button("🔊")
        
        st.subheader("Active Detection Logs")
        log_placeholder = st.empty()
    
    with col_stats:
        st.subheader("Fleet Overview")
        kpi_cols = st.columns(2)
        car_card = kpi_cols[0].empty()
        bike_card = kpi_cols[1].empty()
        bus_card = kpi_cols[0].empty()
        truck_card = kpi_cols[1].empty()
        
        st.subheader("Traffic Distribution")
        chart_placeholder = st.empty()

    # Function to update UI components from DB
    def update_ui():
        stats = db.get_stats()
        counts = {"car": 0, "motorcycle": 0, "bus": 0, "truck": 0}
        for vehicle_type, count in stats.items():
            if vehicle_type.lower() in counts:
                counts[vehicle_type.lower()] = count
        
        with col_stats:
            with kpi_cols[0]:
                car_card.markdown(f'<div class="stat-card"><div class="stat-label">Cars</div><div class="stat-value">{counts["car"]}</div></div>', unsafe_allow_html=True)
                bus_card.markdown(f'<div class="stat-card"><div class="stat-label">Buses</div><div class="stat-value">{counts["bus"]}</div></div>', unsafe_allow_html=True)
            with kpi_cols[1]:
                bike_card.markdown(f'<div class="stat-card"><div class="stat-label">Bikes</div><div class="stat-value">{counts["motorcycle"]}</div></div>', unsafe_allow_html=True)
                truck_card.markdown(f'<div class="stat-card"><div class="stat-label">Trucks</div><div class="stat-value">{counts["truck"]}</div></div>', unsafe_allow_html=True)
            
            if stats:
                df_stats = pd.DataFrame(list(stats.items()), columns=['vehicle_type', 'count'])
                chart_placeholder.bar_chart(df_stats.set_index('vehicle_type'))
        
        with col_main:
            logs = db.fetch_all_vehicles(10)
            log_placeholder.dataframe(pd.DataFrame(logs), use_container_width=True)

    update_ui()
    
    # Processing Logic
    if upload_file is not None or st.sidebar.button("Use Sample Video"):
        source = upload_file if upload_file else "data/sample_traffic.mp4"
        
        # If sample button used but file missing
        if source == "data/sample_traffic.mp4" and not os.path.exists(source):
            st.warning("Sample video missing. Please upload a file.")
            return

        if st.sidebar.button("Start Analysis"):
            st.session_state.processing = True
            
            # Temporary file save for OpenCV
            tfile = "temp_video.mp4"
            if upload_file:
                with open(tfile, "wb") as f:
                    f.write(upload_file.read())
                video_source = tfile
            else:
                video_source = source
            
            cap = cv2.VideoCapture(video_source)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            
            # Line pixel Y
            line_y = int(height * line_position_ratio)
            
            # Tracking state
            prev_positions = {} # track_id -> y_coord
            crossed_ids = set()
            
            frame_count = 0
            
            while cap.isOpened() and st.session_state.processing:
                curr_idx = int(cap.get(cv2.CAP_PROP_POS_FRAMES))
                
                # Update progress bar (non-interactive during auto-play to avoid reruns)
                seek_bar.progress(curr_idx / total_frames if total_frames > 0 else 0)

                if not st.session_state.playing:
                    time.sleep(0.1)
                    continue
                
                ret, frame = cap.read()
                if not ret:
                    break
                
                frame_count += 1
                if frame_count % process_frame_skip != 0:
                    continue
                
                # 1. Detection
                results = vehicle_model(frame, verbose=False)[0]
                detections = []
                for result in results.boxes.data.tolist():
                    x1, y1, x2, y2, conf, cls_id = result
                    if conf > confidence_threshold and int(cls_id) in [2, 3, 5, 7]:
                        detections.append([[x1, y1, x2 - x1, y2 - y1], conf, int(cls_id)])
                
                # 2. Tracking
                tracks = tracker.update_tracks(detections, frame=frame)
                
                # 3. Visualization & Line Crossing
                for track in tracks:
                    if not track.is_confirmed():
                        continue
                    
                    track_id = track.track_id
                    ltrb = track.to_ltrb() # Left, Top, Right, Bottom
                    cls_id = track.get_det_class()
                    cls_name = vehicle_model.names[cls_id]
                    
                    x1, y1, x2, y2 = map(int, ltrb)
                    centroid_y = (y1 + y2) // 2
                    centroid_x = (x1 + x2) // 2
                    
                    # Logic: Top to Bottom cross
                    if track_id in prev_positions:
                        if prev_positions[track_id] < line_y and centroid_y >= line_y and track_id not in crossed_ids:
                            # TRIGGER CROSSING
                            crossed_ids.add(track_id)
                            
                            # Perform Plate Detection and OCR
                            plate_text = "NOT_DETECTED"
                            # Crop vehicle to look for plate
                            vehicle_crop = frame[max(0, y1):min(height, y2), max(0, x1):min(width, x2)]
                            
                            if plate_model:
                                plate_results = plate_model(vehicle_crop, verbose=False)[0]
                                if len(plate_results.boxes) > 0:
                                    px1, py1, px2, py2 = map(int, plate_results.boxes[0].xyxy[0])
                                    plate_crop = vehicle_crop[py1:py2, px1:px2]
                                    plate_text = perform_ocr(reader, plate_crop)
                            else:
                                # Fallback: Try OCR on vehicle crop lower half (heuristic)
                                h_v = vehicle_crop.shape[0]
                                plate_text = perform_ocr(reader, vehicle_crop[h_v//2:, :])
                            
                            db.insert_vehicle(cls_name, plate_text)
                            update_ui()
                    
                    prev_positions[track_id] = centroid_y
                    
                    # Visuals
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 88, 188), 2)
                    cv2.putText(frame, f"#{track_id} {cls_name}", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 88, 188), 2)
                    cv2.circle(frame, (centroid_x, centroid_y), 4, (0, 255, 0), -1)
                
                # Draw the line
                cv2.line(frame, (0, line_y), (width, line_y), (255, 0, 0), 3)
                cv2.putText(frame, "VIRTUAL COUNTING LINE", (20, line_y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
                
                # Streamlit Display
                video_placeholder.image(frame, channels="BGR", use_container_width=True)
            
            cap.release()
            st.session_state.processing = False
            st.success("Analysis Complete.")

if __name__ == "__main__":
    main()
