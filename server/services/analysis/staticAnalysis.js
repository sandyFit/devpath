import { extractComments, removeCommentsAndBlankLines, detectLanguage } from "./staticMetrics";

/**
 * Run static analysis on given code content
 * @param {string} fileContent 
 * @returns {Object} Metrics result
 */
export function runStaticAnalysis(filename, fileContent) {
    if (!fileContent) throw new Error('file content is required');

    const language = detectLanguage(filename);
    const totalLines = fileContent.split('\n').length;
    const blankLines = fileContent.split('\n').filter(line => line.trim() === '').length;

    const codeWithoutComments = removeCommentsAndBlankLines(fileContent);
    const codeLines = codeWithoutComments.split('\n').filter(line => line.trim() !== '').length;

    const commentLinesArray = extractComments(fileContent);
    const commentLines = commentLinesArray.length;
    const commentsRatio = codeLines > 0 ? (commentLines / codeLines) * 100 : 0;

    return {
        language,
        totalLines,
        codeLines,
        commentLines,
        blankLines,
        commentsRatio
    };
}
