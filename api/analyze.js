// api/analyze.js - V23.2 最終修復版 (修正 Gemini API JSON 結構錯誤)

// 獲取 Vercel 環境變數中設置的 Gemini API Key (兼容舊的 OPENAI_API_KEY 名稱)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY; 
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';

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
        
        // V23.2 核心修正：將所有配置參數正確包裹在 generationConfig 內
        const requestBody = {
            model: 'gemini-2.5-pro', // 鎖定為 Gemini 2.5 Pro
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            
            // ⭐ V23.2 關鍵修正：將參數移動到 generationConfig 物件中
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 3000,
                responseMimeType: "application/json" // 告訴 Gemini 輸出 JSON
            }
            // 移除 'config' 區塊，解決 Unknown name "config" 錯誤
        };

        // 呼叫 Gemini API
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
