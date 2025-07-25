export function removeCommentsAndBlankLines(content) {
    const lines = content.split('\n');
    const codeLines = lines.filter(line => {
        const trimmed = line.trim();
        return trimmed !== '' && !trimmed.startsWith('//')
            && !(trimmed.startsWith('/*'))
            && trimmed.endsWith('*/');
    });
    // Join the remaining code lines into a single string,
    // then remove any block comments (/* ... */) using a non-greedy regex.
    return codeLines.join('\n').replace(/\/\*[\s\S]*?\*\//g, '');

}

export function extractComments(content) {
    const single = content.split('\n').filter(line => line.trim().startsWith('//'));
    const block = content.match(/\/\*[\s\S]*?\*\//g) || [];
    return [...single, ...block];
}

export function detectLanguage(filename) {
    const ext = path.extname(filename).toLowerCase();
    const languageMap = {
        '.js': 'javascript',
        '.jsx': 'javascript',
        '.ts': 'typescript',
        '.tsx': 'typescript',
        '.py': 'python',
        '.java': 'java',
        '.cpp': 'cpp',
        '.c': 'c',
        '.cs': 'csharp',
        '.php': 'php',
        '.rb': 'ruby',
        '.go': 'go',
        '.rs': 'rust',
        '.swift': 'swift',
        '.kt': 'kotlin',
        '.scala': 'scala'
    };

    return languageMap[ext] || 'unknown';
}

export const 
