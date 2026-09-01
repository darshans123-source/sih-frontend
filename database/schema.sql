-- SIH26084 PostgreSQL / PostGIS Convective Nowcasting Schema

CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Locations and Sessions
CREATE TABLE IF NOT EXISTS location_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy_m DOUBLE PRECISION,
    altitude_m DOUBLE PRECISION,
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_loc_geom ON location_sessions USING GIST (geom);

-- 2. Convective Nowcast Snapshots
CREATE TABLE IF NOT EXISTS nowcast_snapshots (
    id SERIAL PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    provider VARCHAR(32) DEFAULT 'demo',
    scenario VARCHAR(64),
    hazard_summary JSONB NOT NULL,
    atmospheric_metrics JSONB NOT NULL,
    timeline_data JSONB NOT NULL,
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_nowcast_geom ON nowcast_snapshots USING GIST (geom);

-- 3. Identified Radar Storm Cells
CREATE TABLE IF NOT EXISTS storm_cells (
    id SERIAL PRIMARY KEY,
    cell_identifier VARCHAR(32) NOT NULL,
    centroid_lat DOUBLE PRECISION NOT NULL,
    centroid_lon DOUBLE PRECISION NOT NULL,
    max_dbz DOUBLE PRECISION NOT NULL,
    speed_kmh DOUBLE PRECISION NOT NULL,
    bearing_deg DOUBLE PRECISION NOT NULL,
    echo_top_km DOUBLE PRECISION NOT NULL,
    vil_kg_m2 DOUBLE PRECISION,
    cell_polygon GEOMETRY(Polygon, 4326),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cells_polygon ON storm_cells USING GIST (cell_polygon);

-- 4. Alerts History
CREATE TABLE IF NOT EXISTS alerts_log (
    id SERIAL PRIMARY KEY,
    alert_uid VARCHAR(64) UNIQUE NOT NULL,
    hazard_type VARCHAR(32) NOT NULL,
    priority VARCHAR(16) NOT NULL,
    title VARCHAR(128) NOT NULL,
    message TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    affected_radius_km DOUBLE PRECISION DEFAULT 25.0,
    acknowledged BOOLEAN DEFAULT FALSE,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);
