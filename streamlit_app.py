import streamlit as st
import cv2
import pandas as pd
import requests

st.set_page_config(page_title="TrafficFlow AI", layout="wide")

st.title("TrafficFlow AI Dashboard")
st.write("Welcome to your ANPR monitoring console.")

# Placeholder for real-time video and logs
col1, col2 = st.columns([2, 1])

with col1:
    st.subheader("Live Feed")
    # Your cv2 + st.image logic here

with col2:
    st.subheader("System Stats")
    # Fetch from FastAPI: GET /stats
