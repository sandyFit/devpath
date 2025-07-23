import React, { useCallback, useEffect, useState } from 'react'
import api from '../../services/api';

const ProjectSummary = ({projectId}) => {
    const [summary, setSummary] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchSummary = useCallback(async () => { 
        if (!projectId) return;
        
        setLoading(true);
        try {
            const response = await api.getProjectSummary(projectId);
            console.log('[Full API response]', response); 

            const data = response.data;
            console.log('[Fetched]', data);
            setSummary(data ? [data] : []);
            setError(null);

            console.error('[Fetch Error]', error);
            setError('Failed to fetch summary');
        } finally {
            setLoading(false); // ✅ No need to pass a string here
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
                <pre>{JSON.stringify(summary, null, 2)}</pre>
            ) : (
                    <p>No summary available.</p>
            )
        }
            
        </section>
    )
}

export default ProjectSummary;

