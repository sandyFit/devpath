import { useCallback, useEffect, useState } from 'react'
import api from '../../utils/api';
import { getStatusColor } from '../../utils/functions';
import ScoreBar from '../common/ScoreBar';
import { FileText, Code, CheckCircle, AlertTriangle, Layers } from 'lucide-react';

const ProjectSummary = ({ projectId }) => {
    const [summary, setSummary] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const projectData = summary[0] || {};

    const fetchSummary = useCallback(async () => {
        if (!projectId) return;

        setLoading(true);
        try {
            const response = await api.getProjectSummary(projectId);
            console.log('[Full API response]', response);

            const data = response;
            console.log('[Fetched]', data);

            setSummary(data ? [data] : []);
            setError(null); // ✅ Clear any previous error

        } catch (err) {
            console.error('[Fetch Error]', err);
            setError('Failed to fetch summary');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    return (
        <section>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {summary && summary.length > 0 ? (
                <div className="space-y-6">
                    {/* Project Overview */}
                    <div className="bg-slate-700/50 rounded-xl border border-slate-600 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                {/* <h2 className="text-xl font-semibold text-white mb-2">
                                    {'Project Summary'}
                                </h2> */}
                                <p className="text-slate-400">
                                    A concise breakdown of your project's architecture and analysis results —
                                    including quality scores, test count, files, and language usage.
                                </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium 
                                ${getStatusColor('PROCESSING')}`}>
                                {'PROCESSING'}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {[
                                {
                                    icon: FileText,
                                    label: 'Total Files',
                                    value: projectData?.total_files || 0,
                                    color: 'text-blue-400',
                                },
                                {
                                    icon: Code,
                                    label: 'Languages',
                                    value: projectData?.language_distribution || {},
                                    color: 'text-purple-400',
                                    isList: true,
                                },
                                {
                                    icon: CheckCircle,
                                    label: 'Tests',
                                    value: projectData?.total_tests || 0,
                                    color: 'text-green-400',
                                },
                                {
                                    icon: AlertTriangle,
                                    label: 'Issues',
                                    value: projectData?.total_issues || 0,
                                    color: 'text-red-400',
                                },
                            ].map(({ icon: Icon, label, value, color, isList }, i) => (
                                <div key={i} className="bg-slate-800/50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Icon className={`w-4 h-4 ${color}`} />
                                        <span className="text-xs text-slate-400">{label}</span>
                                    </div>
                                    <div className="text-sm font-semibold text-white">
                                        {isList && typeof value === 'object' ? (
                                            <ul className="list-disc list-inside space-y-1">
                                                {Object.entries(value).map(([lang, percent]) => (
                                                    <li key={lang}>
                                                        {lang}: {percent}%
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            value
                                        )}
                                    </div>
                                </div>
                            ))}

                        </div>

                        {/* Score Overview */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-white mb-3">Overall Scores</h3>
                            <ScoreBar score={projectData.average_quality_score || 0} label="Quality" color="bg-green-500" />
                            <ScoreBar score={projectData.average_complexity_score || 0} label="Complexity" color="bg-yellow-500" />
                            <ScoreBar score={projectData.average_security_score || 0} label="Security" color="bg-blue-500" />
                        </div>
                    </div>
                    
                </div>
            ) : (
                <p>No summary available.</p>
            )
            }

        </section>
    )
}

export default ProjectSummary;

