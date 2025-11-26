
const TOKEN = "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"; // User provided token
const REPO_NAME = "protocol-app";
const FILE_PATH = "package-lock.json";
const BRANCH = "main";

async function githubRequest(endpoint: string, method: string = 'GET', body: any = null) {
    const url = `https://api.github.com${endpoint}`;
    const headers: any = {
        'Authorization': `token ${TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Protocol-App-Deployer',
        'Content-Type': 'application/json',
    };

    const options: any = {
        method,
        headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    // 404 is fine for deletion (already gone)
    if (!response.ok && response.status !== 404 && response.status !== 422) {
        const errorText = await response.text();
        throw new Error(`GitHub API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.status === 404 ? null : response.json();
}

async function main() {
    console.log(`🗑️ Attempting to delete ${FILE_PATH} from remote repo...`);

    // 1. Get User Info
    const user = await githubRequest('/user');
    console.log(`👤 Authenticated as: ${user.login}`);

    // 2. Get file SHA
    try {
        const fileData = await githubRequest(`/repos/${user.login}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`);

        if (!fileData) {
            console.log(`✅ File ${FILE_PATH} does not exist in remote repo.`);
            return;
        }

        console.log(`📍 Found file SHA: ${fileData.sha}`);

        // 3. Delete file
        await githubRequest(`/repos/${user.login}/${REPO_NAME}/contents/${FILE_PATH}`, 'DELETE', {
            message: `Delete ${FILE_PATH} to force npm install`,
            sha: fileData.sha,
            branch: BRANCH
        });

        console.log(`✅ Successfully deleted ${FILE_PATH} from remote.`);

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

main();
