// api/analyze.js - V29.0 最終穩定版 (修復 Gemini API 網址)

// 獲取 Vercel 環境變數中設置的 Gemini API Key (兼容舊的 OPENAI_API_KEY 名稱)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY; 
// ⭐ V29.0 核心修正：使用最新的穩定且通用 API 網址
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end('Method Not Allowed');
    }

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: GEMINI_API_KEY is missing.' });
    }

    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Missing required parameter: prompt.' });
        }
        
        // V29.0 核心修正：確保 body 結構符合 Gemini 要求
        const requestBody = {
            model: 'gemini-2.5-pro', 
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 3000,
                responseMimeType: "application/json" 
            }
        };

        // 使用 Vercel/Node.js 的原生 fetch 呼叫 Gemini API
        const response = await fetch(GEMINI_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GEMINI_API_KEY 
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const status = response.status;
            
            console.error("Gemini API Error:", errorData.error ? errorData.error.message : response.statusText);

            // 處理 404 錯誤 (可能是 API Key 權限不足或 URL 仍然失效)
            let detail = errorData.error ? errorData.error.message : response.statusText;
            if (status === 404) {
                 detail = "API 網址 (Endpoint) 無效或已被移除。請檢查 API Key 權限。";
            }

            return res.status(status).json({
                error: `Gemini API 請求失敗 (HTTP ${status})`,
                detail: detail
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
