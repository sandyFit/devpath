import React from 'react'
import ProjectAnalysis from './components/projecAnalysisUI/ProjectAnalysis'
import ProjectSummary from './components/projecAnalysisUI/ProjectSummary';

const App = () => {
    return (
        <div>
            <ProjectAnalysis projectId={1} />
            <ProjectSummary projectId={1} />
        </div>
    )
}

export default App;

