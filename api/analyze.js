// api/analyze.js - V24.0 (最終 Gemini Pro 專用版)

// 獲取 Vercel 環境變數中設置的 Gemini API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 檢查 Key 是否存在
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: GEMINI_API_KEY is missing.' });
    }

    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Missing prompt in request body' });
        }
        
        // V24.0 核心：直接呼叫 Gemini 2.5 Pro
        const response = await fetch(GEMINI_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Gemini API 專用 Key Header
                'X-Goog-Api-Key': GEMINI_API_KEY 
            },
            body: JSON.stringify({
                model: 'gemini-2.5-pro', // ⭐ 鎖定 Gemini 2.5 Pro
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: {
                    temperature: 0.7,
                    maxOutputTokens: 3000,
                    // 強制要求 Gemini 輸出 JSON 格式
                    responseMimeType: "application/json" 
                }
            })
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
        
        // 返回給前端 index.html 期望的格式 (choices 陣列)
        const finalResponse = {
            choices: [{ message: { content: geminiContent } }]
        };

        res.status(200).json(finalResponse);

    } catch (error) {
        console.error("Serverless Function Internal Error:", error);
        res.status(500).json({ error: 'Internal Server Error', detail: error.message });
    }
}
