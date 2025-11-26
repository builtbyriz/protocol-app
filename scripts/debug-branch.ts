import * as fs from 'fs';
import * as path from 'path';

const TOKEN = "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";
const REPO_NAME = "protocol-app";
const BRANCH = "fresh-start";

async function githubRequest(endpoint: string) {
    const url = `https://api.github.com${endpoint}`;
    const headers: any = {
        'Authorization': `token ${TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Debug-Branch-Script',
    };

    const response = await fetch(url, { headers });
    if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

async function main() {
    console.log(`🔍 Checking content of branch '${BRANCH}'...`);
    try {
        const ref = await githubRequest(`/repos/builtbyriz/${REPO_NAME}/git/ref/heads/${BRANCH}`);
        const commitSha = ref.object.sha;
        console.log(`📍 Commit SHA: ${commitSha}`);

        const commit = await githubRequest(`/repos/builtbyriz/${REPO_NAME}/git/commits/${commitSha}`);
        const treeSha = commit.tree.sha;
        console.log(`Tb Tree SHA: ${treeSha}`);

        const tree = await githubRequest(`/repos/builtbyriz/${REPO_NAME}/git/trees/${treeSha}?recursive=1`);

        console.log("\n📂 Files in branch:");
        tree.tree.forEach((item: any) => {
            console.log(` - ${item.path} (${item.type})`);
        });

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

main();
