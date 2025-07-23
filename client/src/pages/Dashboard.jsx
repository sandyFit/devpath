import {useState} from 'react'
import Header from '../layouts/Header';
import ProjectAnalysis from '../components/ProjectAnalysis';
import { Code, Brain } from 'lucide-react';

const Dashboard = () => {
    const [currentProjectId, setCurrentProjectId] = useState('1');
    return (
        <section className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
            text-white p-6">
            <div className="max-w-7xl mx-auto">
                <Header />
                
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Code className="w-5 h-5 text-purple-400" />
                            Project Analysis
                    </h2>
                    <ProjectAnalysis
                        projectId={currentProjectId}
                        onDataUpdate={''}
                    />
                </div>
            </div>

        </section>
    )
}

export default Dashboard;

