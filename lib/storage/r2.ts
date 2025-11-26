export async function uploadToR2(
    key: string,
    data: ArrayBuffer,
    contentType: string
): Promise<{ success: boolean; key?: string; error?: string }> {
    try {
        // R2 binding is available via env in Cloudflare Workers
        const bucket = (process.env as any).R2_BUCKET

        if (!bucket) {
            throw new Error('R2_BUCKET binding not configured')
        }

        await bucket.put(key, data, {
            httpMetadata: { contentType }
        })

        return { success: true, key }
    } catch (error) {
        console.error('R2 upload error:', error)
        return { success: false, error: String(error) }
    }
}

export async function getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const bucket = (process.env as any).R2_BUCKET

    if (!bucket) {
        throw new Error('R2_BUCKET binding not configured')
    }

    // For public bucket, construct URL directly
    // For private bucket, use presigned URL
    const accountId = process.env.CF_ACCOUNT_ID
    const bucketName = process.env.R2_BUCKET_NAME

    // If using public bucket with custom domain:
    if (process.env.R2_PUBLIC_URL) {
        return `${process.env.R2_PUBLIC_URL}/${key}`
    }

    // Otherwise return the R2 dev URL (for testing)
    return `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${key}`
}

export async function deleteFromR2(key: string): Promise<boolean> {
    try {
        const bucket = (process.env as any).R2_BUCKET
        await bucket.delete(key)
        return true
    } catch (error) {
        console.error('R2 delete error:', error)
        return false
    }
}
