# Model Selection Rationale
**Subject:** AI Model Choice for Protocol App v1.0
**Date:** November 23, 2025

## 1. Current Architecture
The Protocol App uses a **Hybrid AI Strategy** to balance intelligence, speed, and cost.

| Feature | Model | Reasoning |
| :--- | :--- | :--- |
| **AI Coach (Chat)** | **GPT-4o** | Best-in-class reasoning, instruction following, and cultural adaptability (Singlish/Manglish nuances). Proven stability for user-facing interactions. |
| **Background Tasks** | **Gemini 2.0 Flash** | Extremely fast and cost-effective. Ideal for RAG context retrieval and summarization where low latency is critical. |

## 2. Why not newer models? (Gemini 3 / Claude 4.5 / ChatGPT 5.1)

You asked why we aren't using the absolute latest "bleeding edge" models. The decision is based on **Production Readiness**.

### 2.1 Stability vs. Novelty
*   **GPT-4o** is the current **Industry Standard** for production applications. It has:
    *   Stable API endpoints (no breaking changes).
    *   Predictable latency.
    *   Extensive testing in our "Persona Simulation" (Ahmad, Sarah, Uncle Tan).
*   **Newer Models are too recent for a stable launch:**
    *   **Gemini 3**: Released **5 days ago** (Nov 18, 2025). While promising, it is in "Public Preview" and lacks long-term stability data.
    *   **ChatGPT 5.1**: Released **11 days ago** (Nov 12, 2025). The API is currently rate-limited for Pro users and not yet fully optimized for high-concurrency SaaS apps.
    *   **Claude 4.5**: Released **Sept 29, 2025**. Although slightly older, it still suffers from higher latency compared to GPT-4o for real-time chat.

### 2.2 Integration Support
The **Vercel AI SDK** (`ai` package) has first-class, optimized support for OpenAI's GPT-4o. While it supports other providers, the integration with GPT-4o for features like `streamText` and function calling is the most mature. Support for Gemini 3's new multimodal features is still in beta.

### 2.3 Risk Management
For a **Phase 10 Launch**, our priority is **Reliability**. Introducing a brand new model (like ChatGPT 5.1) at this stage would invalidate our previous stress tests and require a full re-verification of the "AI Coach" personality.

## 3. Future Upgrade Path
The app is architected to be **Model Agnostic**.
*   We use the `ai` SDK, which abstracts the provider.
*   **Switching to Gemini 3 or Claude 4.5 is a 1-line code change.**
*   *Recommendation:* Launch with GPT-4o (Stable). A/B test newer models in v1.1 once they stabilize.
