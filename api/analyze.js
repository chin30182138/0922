// api/analyze.js - V22.0 最終穩定版 (Gemini Pro 驅動)
// 此版本使用 Node.js fetch 呼叫 Gemini API

// 獲取 Vercel 環境變數中設置的 Gemini API Key (兼容舊的 OPENAI_API_KEY 名稱)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY; 
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    // 檢查 API Key
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: GEMINI_API_KEY is not set.' });
    }

    try {
        // 從前端接收 prompt (您的 index.html 傳來的)
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Missing required parameter: prompt.' });
        }
        
        // 呼叫 Gemini API
        const response = await fetch(GEMINI_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GEMINI_API_KEY // Gemini API 使用 'X-Goog-Api-Key'
            },
            body: JSON.stringify({
                model: 'gemini-2.5-pro', // 鎖定為 Gemini 2.5 Pro
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: {
                    temperature: 0.7,
                    maxOutputTokens: 3000,
                    // 要求 Gemini 輸出 JSON
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

        // V22.0 關鍵：將 Gemini 的純文本輸出包裝成 OpenAI 格式
        const geminiContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!geminiContent) {
             return res.status(500).json({ error: 'AI 輸出內容錯誤', detail: 'Gemini 未返回預期內容。' });
        }
        
        // 將 Gemini 的輸出（純文本）轉換成前端 index.html 期望的 OpenAI 響應格式
        const finalResponse = {
            choices: [{ message: { content: geminiContent } }]
        };

        res.status(200).json(finalResponse);

    } catch (error) {
        console.error("Serverless Function Internal Error:", error);
        res.status(500).json({ error: 'Internal Server Error', detail: error.message });
    }
}
