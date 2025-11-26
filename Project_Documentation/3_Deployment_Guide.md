# Deployment Workflow Guide
**Subject:** How updates work with Cloudflare / Vercel
**Date:** November 23, 2025

## The Short Answer
**Yes, you edit here.** But it doesn't happen "magically" in real-time. You use a process called **Continuous Deployment**.

## The Workflow (CI/CD)

1.  **Edit Locally**: You make changes to the code on your computer (just like we are doing now).
2.  **Push to Git**: You run a command to save these changes to a code repository (like GitHub).
    *   `git add .`
    *   `git commit -m "Added video analysis"`
    *   `git push`
3.  **Auto-Deploy**: Cloudflare (or Vercel) "watches" your GitHub repository.
    *   As soon as it sees a new "Push", it **automatically** downloads the new code.
    *   It runs `npm run build` to verify everything is correct.
    *   It updates the live website.

**Total Time:** Usually 1-2 minutes from "Push" to "Live".

## Why is this better?
*   **Safety**: If you make a mistake locally, you don't break the live site until you are ready to "Push".
*   **History**: You have a complete history of every change ever made.
*   **Stability**: The build process checks for errors before updating the live site.

## Setup Required
To make this work, we need to:
1.  Create a **GitHub Repository** for this project.
2.  Connect that repository to your **Cloudflare Pages** account.

Once connected, every time you save and push code here, your live app updates automatically.
