import React from 'react'
import ProjectAnalysis from './components/projecAnalysisUI/ProjectAnalysis'
import ProjectSummary from './components/projecAnalysisUI/ProjectSummary';
import Dashboard from './pages/Dashboard';

const App = () => {
    return (
        <div>
            <Dashboard/>
            <ProjectAnalysis projectId={1} />
            <ProjectSummary projectId={1} />
        </div>
    )
}

export default App;

