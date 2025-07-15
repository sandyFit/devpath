/*
to run the code, you can use the following command in your terminal:
npx prisma db seed
*/

-- USERS
INSERT INTO users (username, email, password_hash, user_status, created_at, updated_at)
VALUES ('devpath_user', 'user@example.com', 'hashed_password_123', 'active', NOW(), NOW());

-- PROJECT STATUSES
INSERT INTO project_statuses (status_code, description) VALUES
('draft', 'Project created but no files uploaded yet'),
('pending', 'Files uploaded but not yet analyzed'),
('uploading', 'Files are being uploaded'),
('analyzing', 'AI agents are currently analyzing code'),
('analyzed', 'Analysis completed successfully'),
('reviewing', 'Results under review'),
('learning-path-created', 'A personalized learning path has been generated'),
('in-progress', 'The user is working on the project'),
('paused', 'The user paused their progress'),
('completed', 'The project has been completed'),
('archived', 'Project archived for reference'),
('error', 'There was an issue during upload or analysis'),
('cancelled', 'The user cancelled the project');


-- PROJECTS
INSERT INTO projects (user_id, status_code, project_name, total_files, created_at, updated_at, uploaded_at)
VALUES (1, 'draft', 'Mock Project', 1, NOW(), NOW(), NOW());

-- CODE FILES
INSERT INTO code_files (project_id, file_name, programming_lang, content, file_size, file_path, created_at, updated_at)
VALUES (
  1,
  'index.js',
  'JavaScript',
  'function greet() {\n  console.log("Hello World");\n}',
  45,
  '/files/index.js',
  NOW(),
  NOW()
);

-- ANALYSES
INSERT INTO analyses (
  project_id, file_id, analysis_type, analysis_result, issues_found,
  issues_count, suggestions, quality_score, security_score,
  complexity_score, best_practices_score, learning_gaps, strengths,
  learning_recommendations, skill_level_assessments, improvement_priority,
  recommended_resources, analysis_model, processing_time_ms, created_at, updated_at
)
VALUES (
  1, 1, 'CODE_QUALITY',
  '✔ Code Analysis Complete\n✔ No critical issues detected\n\n🧠 Tips:\n- Consider using "const" over "var"\n- Add comments for clarity\n',
  'No major issues.\nConsider renaming variables for readability.',
  2,
  '🛠️ Suggestions:\n1. Rename "greet" to "sayHello"\n2. Add function documentation',
  85, 90, 80, 88,
  'Understanding variable scope\nImproving naming conventions',
  'Consistent indentation\nClear structure',
  'Focus on function documentation and async patterns',
  'intermediate',
  'medium',
  'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions',
  'llama3-70b-8192',
  1340,
  NOW(),
  NOW()
);

-- LEARNING PATHS
INSERT INTO learning_paths (
  user_id, project_id, recommended_topics, difficulty_level, estimated_hours,
  progress_percentage, learning_status, learning_objectives, prerequisites,
  resources, created_at, updated_at
)
VALUES (
  1, 1,
  'Functions, Async/Await, Scope',
  2,
  8,
  25,
  'in_progress',
  'Build mastery in async JavaScript patterns',
  'JS basics, control flow',
  'freeCodeCamp, JavaScript.info, MDN',
  NOW(), NOW()
);

-- USER PROGRESS
INSERT INTO user_progress (
  user_id, path_id, topic_completed, completion_date, skill_level,
  streak_days, time_spent_minutes, achievement_earned, notes,
  created_at, updated_at
)
VALUES (
  1, 1,
  'Async/Await and Promises',
  NOW(),
  'intermediate',
  5,
  90,
  'Async Explorer Badge',
  'Mastered async/await basics — needs deeper testing practice',
  NOW(), NOW()
);

-- PROJECT STATISTICS
INSERT INTO project_statistics (
  project_id, total_lines_of_code, total_functions, total_classes,
  total_tests, cyclomatic_complexity, language_distribution,
  average_quality_score, average_complexity_score, average_security_score,
  created_at, updated_at
)
VALUES (
  1, 12, 1, 0, 0, 3,
  '{"JavaScript": 100}',
  85, 82, 90,
  NOW(), NOW()
);

-- AGENT ACTION TYPES
INSERT INTO agent_action_types (action_type, description) VALUES
('generate_path', 'Generate a personalized learning path'),
('update_score', 'Update analysis or learning scores'),
('suggest_topic', 'Suggest learning topics based on gaps'),
('analyze_project', 'Run analysis on a project'),
('send_reminder', 'Notify user of pending actions'),
('log_progress', 'Record user progress on learning path'),
('adjust_difficulty', 'Tune learning path difficulty'),
('recommend_resource', 'Suggest external learning material'),
('evaluate_skills', 'Assess skill level based on code or progress'),
('summarize_project', 'Generate project-level summary');

-- AGENT ACTIONS
INSERT INTO agent_actions (
  user_id, project_id, path_id, agent_name, action_type,
  action_details, outcome, confidence_score, triggered_by, created_at
)
VALUES (
  1, 1, 1,
  'path-bot',
  'generate_path',
  '🧠 Action:\nSuggested topics: Async/Await, Scope\nEstimated hours: 8\nReason: Skill gap detected in function structure\n',
  'success',
  0.92,
  'system',
  NOW()
);


