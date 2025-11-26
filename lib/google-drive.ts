import { SignJWT, importPKCS8 } from 'jose'

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

// Cache the token
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken() {
    // Return cached token if valid (with 1 minute buffer)
    if (cachedToken && Date.now() < tokenExpiry - 60000) {
        return cachedToken;
    }

    let credentials
    try {
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            if (process.env.GOOGLE_APPLICATION_CREDENTIALS.trim().startsWith('{')) {
                credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
            }
        }

        if (!credentials) {
            throw new Error('No Google credentials found in env')
        }

        // Fix private key newlines if they are escaped
        if (credentials.private_key) {
            credentials.private_key = credentials.private_key.replace(/\\n/g, '\n')
        }
    } catch (error) {
        console.error('Error loading Google credentials:', error)
        throw new Error('Failed to load service account credentials')
    }

    try {
        const privateKey = await importPKCS8(credentials.private_key, 'RS256')

        const jwt = await new SignJWT({
            scope: SCOPES.join(' '),
        })
            .setProtectedHeader({ alg: 'RS256' })
            .setIssuer(credentials.client_email)
            .setAudience('https://oauth2.googleapis.com/token')
            .setExpirationTime('1h')
            .setIssuedAt()
            .sign(privateKey)

        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: jwt,
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Failed to get access token: ${response.status} ${errorText}`)
        }

        const data = await response.json()
        cachedToken = data.access_token
        // Set expiry based on response (usually 3600 seconds)
        tokenExpiry = Date.now() + (data.expires_in * 1000)

        return cachedToken
    } catch (error) {
        console.error('Error getting access token:', error)
        throw error
    }
}

export async function listFilesInFolder(folderId: string) {
    try {
        const accessToken = await getAccessToken()
        const query = `'${folderId}' in parents and (mimeType = 'application/pdf' or mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') and trashed = false`

        const url = new URL('https://www.googleapis.com/drive/v3/files')
        url.searchParams.append('q', query)
        url.searchParams.append('fields', 'files(id, name, mimeType, createdTime, modifiedTime)')

        const response = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })

        if (!response.ok) {
            throw new Error(`Google Drive API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        return data.files || []
    } catch (error) {
        console.error('Error listing files in Google Drive:', error)
        throw error
    }
}

export async function getFileContent(fileId: string): Promise<ReadableStream> {
    try {
        const accessToken = await getAccessToken()
        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })

        if (!response.ok) {
            throw new Error(`Google Drive API error: ${response.status} ${response.statusText}`)
        }

        if (!response.body) {
            throw new Error('No body in response')
        }

        return response.body
    } catch (error) {
        console.error(`Error getting file content for ${fileId}:`, error)
        throw error
    }
}
