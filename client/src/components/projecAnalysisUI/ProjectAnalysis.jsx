import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

const ProjectAnalysis = ({ projectId }) => {
    const [analyses, setAnalyses] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchAnalysis = useCallback(async () => {
        if (!projectId) return;

        setLoading(true);
        try {
            const response = await api.getAnalysisByProjectId(projectId);
            console.log('[Full API response]', response); 

            const data = response.analysis;
            console.log('[Fetched]', data);
            setAnalyses(data ? [data] : []);
            setError(null);
            return data;
        } catch (error) {
            console.error('[Fetch Error]', error);
            setError('Failed to fetch analysis');
        } finally {
            setLoading(false); // ✅ No need to pass a string here
        }
    }, [projectId]);


    useEffect(() => {
        fetchAnalysis().then(data => console.log('[Fetched]', data));
    }, [fetchAnalysis]);

    return (
        <section>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            {analyses && analyses.length > 0 ? (
                <pre>{JSON.stringify(analyses, null, 2)}</pre>
            ) : (
                !loading && <p>No analyses available</p>
            )}
        </section>
    );
};

export default ProjectAnalysis;
