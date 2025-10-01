// api/analyze.js - V25.0 最終穩定版 (修復 fetch URL 解析問題，確保 Gemini Pro 運行)

// 確保 Vercel 環境變數中 OPENAI_API_KEY 已設定
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY; 
const GEMINI_API_ENDPOINT = 'https://generative-ai.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent'; // 使用更標準的 API 網域

// Vercel Serverless Function 專用程式碼
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: GEMINI_API_KEY is not set.' });
    }

    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Missing required parameter: prompt.' });
        }
        
        // V25.0 核心修正：將參數全部包裹，使用更穩定的 API 網址
        const requestBody = {
            model: 'gemini-2.5-pro', 
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 3000,
                responseMimeType: "application/json" 
            }
        };

        // 呼叫 Gemini API (使用更穩定的 URL 和 Key 傳遞方式)
        const response = await fetch(GEMINI_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GEMINI_API_KEY // Gemini API 使用 'X-Goog-Api-Key'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const status = response.status;
            
            console.error("Gemini API Error:", errorData.error ? errorData.error.message : response.statusText);

            return res.status(status).json({
                error: `Gemini API 請求失敗 (HTTP ${status})`,
                detail: errorData.error ? errorData.error.message : response.statusText
            });
        }

        const data = await response.json();

        // 成功響應：將 Gemini 的純文本輸出包裝成前端兼容格式
        const geminiContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!geminiContent) {
             return res.status(500).json({ error: 'AI 輸出內容錯誤', detail: 'Gemini 未返回預期內容。' });
        }
        
        // 返回給前端 index.html 期望的格式
        const finalResponse = {
            choices: [{ message: { content: geminiContent } }]
        };

        res.status(200).json(finalResponse);

    } catch (error) {
        console.error("Serverless Function Internal Error:", error);
        res.status(500).json({ error: 'Internal Server Error', detail: error.message });
    }
}
