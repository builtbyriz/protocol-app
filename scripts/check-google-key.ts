import * as dotenv from 'dotenv'
dotenv.config()

if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.log('Google API Key is present.')
} else {
    console.log('Google API Key is MISSING.')
}
