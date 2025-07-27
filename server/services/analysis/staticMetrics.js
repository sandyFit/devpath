import fs from 'fs';
import path from 'path';
import util from 'util'


const readdir = util.promisify(fs.readdir);

/**
 * Recursively counts directories inside a project directory
 * Skip hidden directories and node modules
 * @param {string} dir - Path to the project root directory 
 * @returns {Promise<number>} Number of subdirectories found
 */
export async function countDirectories(dir) {
    let count = 0;

    async function scanDir(currentPath) {
        // Read directory contents and return Dirent objects to identify files vs. subdirectories
        const entries = await readdir(currentPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);

            if (entry.isDirectory()) {
                // Skip special or hidden directories
                if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;

                count++;
                await scanDir(fullPath); // Recursively count directories
            }
        }
    }
    try {
        await scanDir(dir)
    } catch (error) {
        console.error(`❌ Error counting directories in ${dir}: ${error.message}`);
    }
    return count;
}


/**
 * Recursively gets all file paths in a directory 
 * Skips node_modules and hidden folders.
 * @param {string} dir - Directory to start scanning
 * @returns {Promise<string[]>} - List of absollute file paths
 */
export async function getAllFiles(dir) {
    let results = [];

    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;

            const subFiles = await getAllFiles(fullPath);
            results = results.concat(subFiles);
        } else {
            results.push(fullPath);
        }
    }

    return results;
}

// ****************************************************

export function removeCommentsAndBlankLines(content) {
    // Remove block comments
    let processed = content.replace(/\/\*[\s\S]*?\*\//g, '');

    // Remove single-line comments but preserve strings
    const lines = processed.split('\n');
    const codeLines = lines.filter(line => {
        const trimmed = line.trim();
        if (trimmed === '') return false;

        // Simple check for single-line comments 
        if (trimmed.startsWith('//')) return false;

        return true;
    });

    return codeLines.join('\n');
}

// ****************************************************

export function extractComments(content) {
    const single = content.split('\n').filter(line => line.trim().startsWith('//'));
    const block = content.match(/\/\*[\s\S]*?\*\//g) || [];
    return [...single, ...block];
}

// ****************************************************

export function countTests(files) {
    const testFiles = files.filter(file => {
        const filename = path.basename(file).toLowerCase();
        const filePath = file.toLowerCase();

        return filename.includes('test') ||
            filename.includes('spec') ||
            filename.includes('.test.') ||
            filename.includes('.spec.') ||
            filePath.includes('/__tests__/') ||
            filePath.includes('/test/') ||
            filePath.includes('/spec/') ||
            filePath.includes('/tests/');
    });

    console.log(testFiles.length > 0
        ? `Project has ${testFiles.length} test files`
        : 'No tests found'
    );

    return testFiles.length;
}

// ****************************************************

// Basic metrics that work for all languages
export function getBasicMetrics(content) {
    const lines = content.split('\n');
    const totalLines = lines.length;
    const blankLines = lines.filter(line => line.trim() === '').length;

    // Comment analysis
    const commentLinesArray = extractComments(content);
    const commentLines = commentLinesArray.length;

    // Code lines (excluding comments and blank lines)
    const codeWithoutComments = removeCommentsAndBlankLines(content);
    const codeLines = codeWithoutComments.split('\n').filter(line => line.trim() !== '').length;

    // Calculate ratios
    const commentsRatio = totalLines > 0 ? (commentLines / totalLines) * 100 : 0;
    const codeRatio = totalLines > 0 ? (codeLines / totalLines) * 100 : 0;
    const blankRatio = totalLines > 0 ? (blankLines / totalLines) * 100 : 0;

    return {
        totalLines,
        codeLines,
        blankLines,
        commentsRatio,
        codeRatio,
        blankRatio
    };
}

// ****************************************************

export function detectLanguage(filename) {
    const ext = path.extname(filename).toLowerCase();
    const languageMap = {
        '.js': 'javascript',
        '.jsx': 'javascript',
        '.ts': 'typescript',
        '.tsx': 'typescript',
        '.py': 'python',
    };

    return languageMap[ext] || 'unknown';
}

// ****************************************************

// JavaScript/TypeScript specific functions
export function countFunctions(content) {
    // Match function declarations, expressions, and arrow functions
    const functionPatterns = [
        /function\s+\w+\s*\(/g,           // function name()
        /const\s+\w+\s*=\s*function/g,   // const name = function
        /const\s+\w+\s*=\s*\(/g,         // const name = (
        /\w+\s*:\s*function/g,           // method: function
        /\w+\s*\([^)]*\)\s*=>/g          // arrow functions
    ];

    let count = 0;
    functionPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) count += matches.length;
    });

    return count;
}

// ****************************************************

export function countClasses(content) {
    const classPattern = /class\s+\w+/g;
    const matches = content.match(classPattern);
    return matches ? matches.length : 0;
}

// ****************************************************

export function countImports(content) {
    const importPatterns = [
        /import\s+.*from/g,    // import ... from
        /import\s*\(/g,        // dynamic import()
        /require\s*\(/g        // require()
    ];

    let count = 0;
    importPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) count += matches.length;
    });

    return count;
}

// ****************************************************

// Python specific functions
export function countPythonFunctions(content) {
    const functionPattern = /def\s+\w+\s*\(/g;
    const matches = content.match(functionPattern);
    return matches ? matches.length : 0;
}

export function countPythonClasses(content) {
    const classPattern = /class\s+\w+/g;
    const matches = content.match(classPattern);
    return matches ? matches.length : 0;
}

// ****************************************************

export function getLanguageSpecificMetrics(language, content) {
    const basicMetrics = getBasicMetrics(content);

    switch (language) {
        case 'javascript':
        case 'typescript':
            return {
                ...basicMetrics,
                functions: countFunctions(content),
                classes: countClasses(content),
                imports: countImports(content),
            };
        case 'python':
            return {
                ...basicMetrics,
                functions: countPythonFunctions(content),
                classes: countPythonClasses(content)
            };
        default:
            return basicMetrics;
    }
}

// ****************************************************

export function validatePath(filePath, allowedRoot) {
    const resolved = path.resolve(filePath);
    const allowedResolved = path.resolve(allowedRoot);

    if (!resolved.startsWith(allowedResolved)) {
        throw new PathTraversalError(filePath);
    }
    return resolved;
}
