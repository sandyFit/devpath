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


export function removeCommentsAndBlankLines(content) {
    const lines = content.split('\n');
    const codeLines = lines.filter(line => {
        const trimmed = line.trim();
        return trimmed !== '' && !trimmed.startsWith('//')
            && !(trimmed.startsWith('/*') || trimmed.endsWith('*/'));
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

