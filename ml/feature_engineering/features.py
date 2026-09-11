"""
PRAVAAH ML Pipeline - Feature Engineering
Derives scientifically grounded features from terrain and hydrometeorological data:
- elevation: Altitude in meters above MSL
- slope: Slope steepness in degrees
- aspect: Slope azimuth direction (0 - 360)
- curvature: Planform/profile curvature
- landcover: Land use / land cover category (1: Dense Forest, 2: Secondary Forest, 3: Open/Shrubland, 4: Built-up/Infrastructure)
- rain_24h: 1-day rainfall accumulation (mm)
- rain_72h: 3-day rainfall accumulation (mm)
- rain_7d: 7-day cumulative rainfall (mm)
- rainfall_intensity: rain_24h / max(rain_72h, 1.0)
- rain_antecedent_14d: 14-day antecedent moisture proxy
- historical_landslide_density: Count of prior failures within 5km radius
- terrain_ruggedness: Slope-elevation interaction factor
"""

import math
import numpy as np
import pandas as pd


def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def compute_historical_density(df: pd.DataFrame, radius_km: float = 5.0) -> list:
    """
    Compute strictly antecedent historical landslide density (failures within radius_km
    occurring prior to the event date). Eliminates temporal lookahead leakage.
    """
    pos_df = df[df["landslide"] == 1][["latitude", "longitude", "event_date"]].copy()
    pos_df["dt"] = pd.to_datetime(pos_df["event_date"], errors="coerce")

    densities = []
    for _, row in df.iterrows():
        lat, lon = row["latitude"], row["longitude"]
        cur_dt = pd.to_datetime(row["event_date"], errors="coerce")
        # Only count events strictly before cur_dt
        prior_pos = pos_df[pos_df["dt"] < cur_dt]
        count = sum(1 for plat, plon in zip(prior_pos["latitude"].values, prior_pos["longitude"].values)
                    if haversine_km(lat, lon, plat, plon) <= radius_km)
        densities.append(count)
    return densities



def assign_landcover(row) -> int:
    """Assign geomorphic LULC class based on elevation and slope."""
    slope = row["slope"]
    elev = row["elevation"]
    if elev > 2500:
        return 3  # High altitude alpine / rocky outcrop
    elif slope > 35:
        return 3  # Steep rocky slope / degraded scrub
    elif 15 <= slope <= 35:
        return 2  # Dense/moderate mountain forest
    elif elev < 800:
        return 4  # Valley settlement / road corridor
    else:
        return 1  # Forest reserve


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # Derived rainfall ratios
    df["rainfall_intensity"] = df["rain_24h"] / np.maximum(df["rain_72h"], 1.0)
    df["rain_ratio_72h_7d"] = df["rain_72h"] / np.maximum(df["rain_7d"], 1.0)

    # Topographic interactions
    df["terrain_ruggedness"] = (df["slope"] * (df["elevation"] / 1000.0)).round(2)
    df["aspect_sin"] = np.sin(np.radians(df["aspect"])).round(3)
    df["aspect_cos"] = np.cos(np.radians(df["aspect"])).round(3)

    # Historical spatial density
    df["historical_landslide_density"] = compute_historical_density(df, radius_km=5.0)

    # Land cover
    df["landcover"] = df.apply(assign_landcover, axis=1)

    return df


FEATURE_COLUMNS = [
    "elevation",
    "slope",
    "curvature",
    "aspect_sin",
    "aspect_cos",
    "landcover",
    "rain_24h",
    "rain_72h",
    "rain_7d",
    "rainfall_intensity",
    "historical_landslide_density",
    "terrain_ruggedness",
]
