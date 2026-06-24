-- PostgreSQL Schema for Smart Decision Support System (SDSS)
-- This file can be run in the Supabase SQL Editor or standard PostgreSQL CLI.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS calculations CASCADE;
DROP TABLE IF EXISTS scores CASCADE;
DROP TABLE IF EXISTS alternatives CASCADE;
DROP TABLE IF EXISTS criteria CASCADE;
DROP TABLE IF EXISTS studies CASCADE;

-- 1. Studies Table
CREATE TABLE studies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Criteria Table
CREATE TABLE criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    study_id UUID REFERENCES studies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    weight DECIMAL(5,4) NOT NULL CHECK (weight >= 0 AND weight <= 1),
    type VARCHAR(10) NOT NULL CHECK (type IN ('benefit', 'cost')),
    target_value DECIMAL(5,2) DEFAULT 3.00, -- Used for Profile Matching (ideal target, e.g. 1-5 scale)
    is_core_factor BOOLEAN DEFAULT TRUE     -- Used for Profile Matching (Core vs Secondary factor)
);

-- 3. Alternatives Table
CREATE TABLE alternatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    study_id UUID REFERENCES studies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) -- Optional, e.g. Brand, Department, etc.
);

-- 4. Scores Table (Dynamic Matrix Cell)
CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alternative_id UUID REFERENCES alternatives(id) ON DELETE CASCADE,
    criteria_id UUID REFERENCES criteria(id) ON DELETE CASCADE,
    value DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
    CONSTRAINT unique_alt_crit UNIQUE (alternative_id, criteria_id)
);

-- 5. Calculations / Logs Table
CREATE TABLE calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    study_id UUID REFERENCES studies(id) ON DELETE CASCADE,
    method VARCHAR(50) NOT NULL, -- SAW, WP, TOPSIS, SMART, PROFILE_MATCHING, AHP
    result JSONB NOT NULL,       -- Stores full step calculations and ranking results
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX idx_criteria_study ON criteria(study_id);
CREATE INDEX idx_alternatives_study ON alternatives(study_id);
CREATE INDEX idx_scores_alternative ON scores(alternative_id);
CREATE INDEX idx_scores_criteria ON scores(criteria_id);
CREATE INDEX idx_calculations_study ON calculations(study_id);
