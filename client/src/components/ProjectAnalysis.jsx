import React, { useState, useEffect, useCallback, useMemo } from 'react';

import LoadingSpinner from './common/LoadingSpinner';
import ErrorDisplay from './common/ErrorDisplay';
import NavigationTabs from './projecAnalysisUI/NavigationTabs';
import { getStatusColor, getPriorityColor } from '../utils/functions';
import { AlertTriangle, PlayCircle, RefreshCw } from 'lucide-react';
import ProjectSummary from './projecAnalysisUI/ProjectSummary';
import ProjectAnalysisTab from './projecAnalysisUI/ProjectAnalysisTab';

const ProjectAnalysis = ({ projectId: propProjectId, data, onDataUpdate }) => {
    const projectId = propProjectId;
    const [activeTab, setActiveTab] = useState('summary');
    const [expandedItems, setExpandedItems] = useState(new Set());

    const [loadingState, setLoadingState] = useState({ project: false });
    const [error, setError] = useState(null);


    // Enhanced toggle function
    const toggleExpanded = useCallback((id) => {
        setExpandedItems(prev => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(id)) {
                newExpanded.delete(id);
            } else {
                newExpanded.add(id);
            }
            return newExpanded;
        });
    }, []);

    const loading =
        loadingState.project ||
        loadingState.analyses ||
        loadingState.summary ||
        loadingState.learningPaths;

    // Loading state
    if (loading) {
        return <LoadingSpinner text="Loading project analysis..." />;
    }

    // Error state
    if (error && !projectData) {
        return <ErrorDisplay error={error} onRetry={refreshData} />;
    }

    return (
        <div className="space-y-6">
            {/* Navigation Tabs */}
            <NavigationTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                loadingState={loadingState}
            />

            {/* Project Summary Tab */}
            {activeTab === 'summary' && (
                <ProjectSummary projectId={1}/>
            )}

            {/* Code Analysis Tab */}
            {activeTab === 'analysis' && (
                <ProjectAnalysisTab projectId={1}/>
            )}

            {/* Learning Paths Tab */}
            {/* {activeTab === 'learning' && (
                <LearningPathsTab
                    learningPaths={learningPaths}
                    loading={loadingState.learningPaths}
                    fetchLearningPaths={fetchLearningPaths}
                    getPriorityColor={getPriorityColor}
                />
            )} */}
        </div>
    );
};

export default ProjectAnalysis;
