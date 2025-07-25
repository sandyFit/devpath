
const patterns = {
    functions: {
        javascript: /function\s+\w+\s*\(|const\s+\w+\s*=\s*\(.*?\)\s*=>/g,
        python: /def\s+\w+\s*\(/g,
        java: /(public|private|protected)?\s*(static)?\s*\w+\s+\w+\s*\(/g
    },

    complexity: {
        ifStatements: /\bif\s*\(/g,
        forLoops: /\bfor\s*\(/g,
        whileLoops: /\bwhile\s*\(/g,
        switchCases: /\bcase\s+/g
    }
};

export function runComplexityAnalysis(fileContent, language) {
    const functions = extractFunctions(fileContent, language);
    const functionsCount = functions.length;
    const averageFunctionLength = calculateAverageLenght(functions);
    const maxFunctionLength = Math.max(...functions.map(fn => fn.length));
    const ciclomaticComplexity = calculateCiclomaticComplexity(fileContent);

}

export function extractFunctions(fileContent, language) {
    if (language === 'javascript') {
        const jsPattern = /function\s+\w+\s*\(|const\s+\w+\s*=\s*\(.*?\)\s*=>/g
    }
}
