import {
    detectLanguage,
    getLanguageSpecificMetrics,
    getBasicMetrics
} from "./staticMetrics.js";

/**
 * Run comprehensive static analysis on given code content
 * @param {string} filename - Name of the file being analyzed
 * @param {string} fileContent - Content of the file
 * @param {Object} options - Analysis options
 * @returns {Object} Comprehensive metrics result
 */
export function runStaticAnalysis(filename, fileContent, options = {}) {
    // Input validation
    if (!filename) {
        throw new Error('Filename is required');
    }

    if (fileContent === null || fileContent === undefined) {
        throw new Error('File content is required');
    }

    // Handle empty files
    if (typeof fileContent !== 'string') {
        throw new Error('File content must be a string');
    }

    try {
        const language = detectLanguage(filename);
        
        // get basic metrics
        const basicMetrics = getBasicMetrics(fileContent);

        // Get language-specific metrics
        const languageMetrics = getLanguageSpecificMetrics(language, fileContent);

        // Calculate complexity indicators
        const complexityMetrics = calculateComplexity(fileContent, language);

        // File size metrics
        const fileSize = Buffer.byteLength(fileContent, 'utf-8');
        const avgLineLength = codeLines > 0 ? fileSize / codeLines : 0;

        // Quality indicators
        const qualityMetrics = calculateQualityMetrics({
            language,
            ...languageMetrics,
            ...complexityMetrics
        });

        return {
            // Basic metrics
            language,
            ...basicMetrics,

            // Ratios
            commentsRatio: Math.round(commentsRatio * 100) / 100,
            codeRatio: Math.round(codeRatio * 100) / 100,
            blankRatio: Math.round(blankRatio * 100) / 100,

            // File metrics
            fileSize,
            avgLineLength: Math.round(avgLineLength * 100) / 100,

            // Language-specific metrics
            ...languageMetrics,

            // Complexity metrics
            ...complexityMetrics,

            // Quality score
            ...qualityMetrics,

            // Analysis metadata
            analyzedAt: new Date().toISOString(),
            analysisVersion: '1.0.0'
        };

    } catch (error) {
        throw new Error(`Static analysis failed for ${filename}: ${error.message}`);
    }
}

/**
 * Calculate complexity metrics for the code
 * @param {string} content - File content
 * @param {string} language - Programming language
 * @returns {Object} Complexity metrics
 */
function calculateComplexity(content, language) {
    const metrics = {
        cyclomaticComplexity: 0,
        nesting_depth: 0,
        conditionalStatements: 0,
        loops: 0
    };

    switch (language) {
        case 'javascript':
        case 'typescript':
            return calculateJSComplexity(content);
        case 'python':
            return calculatePythonComplexity(content);
        default:
            return calculateGenericComplexity(content);
    }
}

/**
 * Calculate JavaScript/TypeScript specific complexity
 * @param {string} content - File content
 * @returns {Object} Complexity metrics
 */
function calculateJSComplexity(content) {
    // Patterns for complexity calculation
    const conditionalPatterns = [
        /\bif\s*\(/g,           // if statements
        /\belse\s+if\s*\(/g,    // else if
        /\bswitch\s*\(/g,       // switch statements
        /\bcase\s+/g,           // case statements
        /\?\s*.*\s*:/g,         // ternary operators
        /\&\&/g,                // logical AND
        /\|\|/g                 // logical OR
    ];

    const loopPatterns = [
        /\bfor\s*\(/g,          // for loops
        /\bwhile\s*\(/g,        // while loops
        /\bdo\s*\{/g,           // do-while loops
        /\.forEach\s*\(/g,      // forEach
        /\.map\s*\(/g,          // map
        /\.filter\s*\(/g,       // filter
        /\.reduce\s*\(/g        // reduce
    ];

    let conditionalCount = 0;
    let loopCount = 0;

    conditionalPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) conditionalCount += matches.length;
    });

    loopPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) loopCount += matches.length;
    });

    // Calculate nesting depth by counting maximum brace depth
    const nestingDepth = calculateNestingDepth(content, '{', '}');

    // Cyclomatic complexity = 1 + number of decision points
    const cyclomaticComplexity = 1 + conditionalCount + loopCount;

    return {
        cyclomaticComplexity,
        nesting_depth: nestingDepth,
        conditionalStatements: conditionalCount,
        loops: loopCount
    };
}

/**
 * Calculate Python specific complexity
 * @param {string} content - File content
 * @returns {Object} Complexity metrics
 */
function calculatePythonComplexity(content) {
    const conditionalPatterns = [
        /\bif\s+/g,             // if statements
        /\belif\s+/g,           // elif statements
        /\bexcept\s+/g,         // except blocks
        /\band\b/g,             // logical and
        /\bor\b/g               // logical or
    ];

    const loopPatterns = [
        /\bfor\s+.*\bin\s+/g,   // for loops
        /\bwhile\s+/g           // while loops
    ];

    let conditionalCount = 0;
    let loopCount = 0;

    conditionalPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) conditionalCount += matches.length;
    });

    loopPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) loopCount += matches.length;
    });

    // Python uses indentation for nesting
    const nestingDepth = calculatePythonNestingDepth(content);
    const cyclomaticComplexity = 1 + conditionalCount + loopCount;

    return {
        cyclomaticComplexity,
        nesting_depth: nestingDepth,
        conditionalStatements: conditionalCount,
        loops: loopCount
    };
}

/**
 * Calculate generic complexity for unknown languages
 * @param {string} content - File content
 * @returns {Object} Basic complexity metrics
 */
function calculateGenericComplexity(content) {
    // Basic patterns that might exist in many languages
    const conditionalCount = (content.match(/\bif\b/g) || []).length;
    const loopCount = (content.match(/\b(for|while)\b/g) || []).length;

    return {
        cyclomaticComplexity: 1 + conditionalCount + loopCount,
        nesting_depth: 0,
        conditionalStatements: conditionalCount,
        loops: loopCount
    };
}

/**
 * Calculate nesting depth using brace counting
 * @param {string} content - File content
 * @param {string} openChar - Opening character
 * @param {string} closeChar - Closing character
 * @returns {number} Maximum nesting depth
 */
function calculateNestingDepth(content, openChar, closeChar) {
    let maxDepth = 0;
    let currentDepth = 0;

    for (const char of content) {
        if (char === openChar) {
            currentDepth++;
            maxDepth = Math.max(maxDepth, currentDepth);
        } else if (char === closeChar) {
            currentDepth = Math.max(0, currentDepth - 1);
        }
    }

    return maxDepth;
}

/**
 * Calculate Python nesting depth using indentation
 * @param {string} content - File content
 * @returns {number} Maximum nesting depth
 */
function calculatePythonNestingDepth(content) {
    const lines = content.split('\n');
    let maxDepth = 0;

    for (const line of lines) {
        if (line.trim() === '') continue;

        const leadingSpaces = line.length - line.trimStart().length;
        const indentLevel = Math.floor(leadingSpaces / 4); // 4-space indentation
        maxDepth = Math.max(maxDepth, indentLevel);
    }

    return maxDepth;
}

/**
 * Calculate quality metrics based on various factors
 * @param {Object} metrics - All calculated metrics
 * @returns {Object} Quality assessment
 */
function calculateQualityMetrics(metrics) {
    let qualityScore = 100; // Start with perfect score
    const issues = [];
    const suggestions = [];

    // Comment coverage assessment
    if (metrics.commentsRatio < 10) {
        qualityScore -= 20;
        issues.push('Low comment coverage');
        suggestions.push('Add more comments to improve code documentation');
    } else if (metrics.commentsRatio > 50) {
        qualityScore -= 10;
        issues.push('Excessive comments');
        suggestions.push('Consider if all comments are necessary');
    }

    // Complexity assessment
    if (metrics.cyclomaticComplexity > 10) {
        qualityScore -= 25;
        issues.push('High cyclomatic complexity');
        suggestions.push('Consider breaking down complex functions');
    }

    // Nesting depth assessment
    if (metrics.nesting_depth > 4) {
        qualityScore -= 15;
        issues.push('Deep nesting detected');
        suggestions.push('Reduce nesting depth by extracting functions or using early returns');
    }

    // File size assessment
    if (metrics.codeLines > 500) {
        qualityScore -= 10;
        issues.push('Large file size');
        suggestions.push('Consider splitting large files into smaller modules');
    }

    // Average line length assessment
    if (metrics.avgLineLength > 120) {
        qualityScore -= 5;
        issues.push('Long average line length');
        suggestions.push('Consider breaking long lines for better readability');
    }

    // Ensure quality score doesn't go below 0
    qualityScore = Math.max(0, qualityScore);

    return {
        qualityScore: Math.round(qualityScore),
        issues,
        suggestions,
        maintainabilityIndex: calculateMaintainabilityIndex(metrics)
    };
}

/**
 * Calculate maintainability index based on Halstead metrics and complexity
 * @param {Object} metrics - Code metrics
 * @returns {number} Maintainability index (0-100)
 */
function calculateMaintainabilityIndex(metrics) {
    // Simplified maintainability index calculation
    // Real calculation would use Halstead volume and effort metrics
    const complexityPenalty = Math.min(50, metrics.cyclomaticComplexity * 5);
    const sizePenalty = Math.min(30, Math.max(0, (metrics.codeLines - 100) / 20));
    const commentBonus = Math.min(20, metrics.commentsRatio);

    const index = 100 - complexityPenalty - sizePenalty + commentBonus;
    return Math.max(0, Math.min(100, Math.round(index)));
}

/**
 * Analyze multiple files and provide aggregated metrics
 * @param {Array} files - Array of {filename, content} objects
 * @param {Object} options - Analysis options
 * @returns {Object} Aggregated analysis results
 */
export function analyzeMultipleFiles(files, options = {}) {
    if (!Array.isArray(files) || files.length === 0) {
        throw new Error('Files array is required and must not be empty');
    }

    const results = [];
    const aggregatedMetrics = {
        totalFiles: files.length,
        totalLines: 0,
        totalCodeLines: 0,
        totalCommentLines: 0,
        languages: {},
        avgQualityScore: 0,
        avgComplexity: 0,
        issuesSummary: {}
    };

    for (const file of files) {
        try {
            const analysis = runStaticAnalysis(file.filename, file.content, options);
            results.push(analysis);

            // Aggregate metrics
            aggregatedMetrics.totalLines += analysis.totalLines;
            aggregatedMetrics.totalCodeLines += analysis.codeLines;
            aggregatedMetrics.totalCommentLines += analysis.commentLines;

            // Language distribution
            aggregatedMetrics.languages[analysis.language] =
                (aggregatedMetrics.languages[analysis.language] || 0) + 1;

            // Quality metrics
            aggregatedMetrics.avgQualityScore += analysis.qualityScore;
            aggregatedMetrics.avgComplexity += analysis.cyclomaticComplexity;

            // Issues summary
            analysis.issues.forEach(issue => {
                aggregatedMetrics.issuesSummary[issue] =
                    (aggregatedMetrics.issuesSummary[issue] || 0) + 1;
            });

        } catch (error) {
            console.error(`Failed to analyze ${file.filename}: ${error.message}`);
            results.push({
                filename: file.filename,
                error: error.message,
                success: false
            });
        }
    }

    // Calculate averages
    const successfulAnalyses = results.filter(r => !r.error).length;
    if (successfulAnalyses > 0) {
        aggregatedMetrics.avgQualityScore = Math.round(aggregatedMetrics.avgQualityScore / successfulAnalyses);
        aggregatedMetrics.avgComplexity = Math.round((aggregatedMetrics.avgComplexity / successfulAnalyses) * 100) / 100;
    }

    return {
        individual: results,
        aggregated: aggregatedMetrics,
        analyzedAt: new Date().toISOString()
    };
}
