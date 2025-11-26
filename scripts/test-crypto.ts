import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const KEY_FILE_PATH = path.join(process.cwd(), 'service-account.json')

try {
    const keyFileContent = fs.readFileSync(KEY_FILE_PATH, 'utf-8')
    const credentials = JSON.parse(keyFileContent)

    let privateKey = credentials.private_key
    if (privateKey) {
        privateKey = privateKey.replace(/\\n/g, '\n')
    }

    console.log('Private Key loaded.')
    console.log('Key length:', privateKey.length)

    try {
        const keyObject = crypto.createPrivateKey(privateKey)
        console.log('Key imported successfully!')
        console.log('Key type:', keyObject.type)
        console.log('Key asymmetricKeyType:', keyObject.asymmetricKeyType)

        console.log('Attempting to sign data with RSA-SHA256...')
        const sign = crypto.createSign('RSA-SHA256')
        sign.update('test data')
        const signature = sign.sign(keyObject, 'hex')

        console.log('Signature generated successfully!')
        console.log('Signature:', signature.substring(0, 50) + '...')
    } catch (importError) {
        console.error('Key Import Failed:', importError)
        // Print first and last lines to check for formatting
        const lines = privateKey.split('\n')
        console.log('First line:', lines[0])
        console.log('Last line:', lines[lines.length - 1])
    }

} catch (error) {
    console.error('Crypto Test Failed:', error)
}
