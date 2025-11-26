import { chromium } from 'playwright'
import path from 'path'
import fs from 'fs'

async function main() {
    const browser = await chromium.launch()
    const page = await browser.newPage()

    // Set viewport size for consistent screenshots
    await page.setViewportSize({ width: 1280, height: 800 })

    const artifactsDir = 'C:\\Users\\irfan\\.gemini\\antigravity\\brain\\47b4aa98-0b69-4a93-9e82-80ea051b4664'

    console.log('Navigating to login...')
    await page.goto('http://localhost:3000/login')
    await page.screenshot({ path: path.join(artifactsDir, 'screenshot_login.png') })
    console.log('Captured login screenshot')

    console.log('Logging in...')
    await page.fill('input[type="email"]', 'admin@demo.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/demo-gym/member')
    await page.waitForTimeout(2000) // Wait for animations
    await page.screenshot({ path: path.join(artifactsDir, 'screenshot_dashboard.png') })
    console.log('Captured dashboard screenshot')

    console.log('Navigating to Chat...')
    await page.goto('http://localhost:3000/demo-gym/member/chat')
    await page.waitForSelector('input') // Wait for chat input
    await page.waitForTimeout(1000)
    await page.screenshot({ path: path.join(artifactsDir, 'screenshot_chat.png') })
    console.log('Captured chat screenshot')

    console.log('Navigating to Admin Workouts...')
    await page.goto('http://localhost:3000/demo-gym/admin/workouts')
    await page.waitForSelector('text=Workouts')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: path.join(artifactsDir, 'screenshot_admin_workouts.png') })
    console.log('Captured admin workouts screenshot')

    await browser.close()
}

main().catch(console.error)
