CREATE DATABASE IF NOT EXISTS DEVPATH;

-- USERS
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    user_status VARCHAR(50), -- e.g., "active", "inactive", "paused"
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- PROJECTS
DROP TABLE IF EXISTS projects;
CREATE TABLE projects (
    project_id SERIAL PRIMARY KEY,
    user_id INT,
    status_code INT,
    project_name VARCHAR(255),
    total_files SMALLINT,   
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    uploaded_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_projects_user 
        FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_project_status 
        FOREIGN KEY (status_code) REFERENCES project_statuses(status_code);
);

-- PROJECT STATUSES
CREATE TABLE project_statuses (
    status_code VARCHAR(50) PRIMARY KEY,
    description TEXT NOT NULL
);


-- CODE FILES
DROP TABLE IF EXISTS code_files;
CREATE TABLE code_files (
    file_id SERIAL PRIMARY KEY,
    project_id INT,
    file_name VARCHAR(30) NOT NULL UNIQUE,
    programming_lang VARCHAR(100) NOT NULL,
    content TEXT,
    file_size NUMERIC(38, 0),
    file_path VARCHAR(500),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_code_files_project 
        FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

-- ANALYSES
DROP TABLE IF EXISTS analyses;
CREATE TABLE analyses (
    analysis_id SERIAL PRIMARY KEY,
    project_id INT,
    file_id INT,
    analysis_type VARCHAR(100) NOT NULL,
    analysis_result TEXT,
    issues_found TEXT,
    issues_count INT,
    suggestions TEXT,
    quality_score INT,
    security_score INT,
    complexity_score INT,
    best_practices_score INT,
    learning_gaps TEXT,
    strengths TEXT,
    learning_recommendations TEXT,
    skill_level_assessments TEXT,
    improvement_priority VARCHAR(50),
    recommended_resources TEXT,
    analysis_model VARCHAR(100),
    processing_time_ms NUMERIC(38, 0),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_analyses_project 
        FOREIGN KEY (project_id) REFERENCES projects(project_id),
    CONSTRAINT fk_analyses_file 
        FOREIGN KEY (file_id) REFERENCES code_files(file_id)
);

-- LEARNING PATHS
DROP TABLE IF EXISTS learning_paths;
CREATE TABLE learning_paths (
    path_id SERIAL PRIMARY KEY,
    user_id INT,
    project_id INT,
    recommended_topics TEXT,
    difficulty_level INT,
    estimated_hours INT,
    progress_percentage INT,
    learning_status VARCHAR(50),
    learning_objectives TEXT,
    prerequisites TEXT,
    resources TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_learning_paths_user 
        FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_learning_paths_project 
        FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

-- USER PROGRESS
DROP TABLE IF EXISTS user_progress;
CREATE TABLE user_progress (
    progress_id SERIAL PRIMARY KEY,
    user_id INT,
    path_id INT,
    topic_completed TEXT,
    completion_date TIMESTAMP NOT NULL,
    skill_level VARCHAR(50),
    streak_days INT,
    time_spent_minutes NUMERIC(38, 0),
    achievement_earned VARCHAR(250),
    notes TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_user_progress_user 
        FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_user_progress_path 
        FOREIGN KEY (path_id) REFERENCES learning_paths(path_id)
);

-- PROJECT STATISTICS
DROP TABLE IF EXISTS project_statistics;
CREATE TABLE project_statistics (
    stats_id SERIAL PRIMARY KEY,
    project_id INT,
    total_lines_of_code INT,
    total_functions INT,
    total_classes INT,
    total_tests INT,
    cyclomatic_complexity INT,
    language_distribution TEXT,
    average_quality_score INT,
    average_complexity_score INT,
    average_security_score INT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_project_statistics_project 
        FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

DROP TABLE IF EXISTS agent_actions;
CREATE TABLE agent_actions (
    action_id SERIAL PRIMARY KEY,
    user_id INT,
    project_id INT,
    path_id INT,
    agent_name VARCHAR(100),
    action_type VARCHAR(100), 
    action_details TEXT,
    outcome VARCHAR(100),     -- e.g., "success", "failed", "ignored"
    confidence_score NUMERIC(5,2), -- 0.00 to 1.00
    triggered_by VARCHAR(100), -- "system", "user", "schedule"
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_agent_actions_user 
        FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_agent_actions_project 
        FOREIGN KEY (project_id) REFERENCES projects(project_id),
    CONSTRAINT fk_agent_actions_path 
        FOREIGN KEY (path_id) REFERENCES learning_paths(path_id),
    action_type VARCHAR(100),
    CONSTRAINT fk_agent_actions_type 
        FOREIGN KEY (action_type) REFERENCES agent_action_types(action_type),

);

DROP TABLE IF EXISTS agent_action_types;
CREATE TABLE agent_action_types (
    action_type VARCHAR(100) PRIMARY KEY,
    description TEXT NOT NULL
);
