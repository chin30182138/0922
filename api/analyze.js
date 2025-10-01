// api/analyze.js - V31.0 最終穩定版 (使用 OpenAI API Key)

// V31.0 核心：優先使用 OPENAI_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY; 
const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

const FINAL_MODEL = 'gpt-3.5-turbo'; // 鎖定速度最快，解決超時問題

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!OPENAI_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: OPENAI_API_KEY is missing.' });
    }

    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Missing required parameter: prompt.' });
        }
        
        // 呼叫 OpenAI API
        const response = await fetch(OPENAI_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}` 
            },
            body: JSON.stringify({
                model: FINAL_MODEL,
                messages: [
                    {
                        role: "system",
                        content: "你是一位精通易學、心理學和企業管理的專業顧問，專門提供仙人指路神獸七十二型人格的分析報告。你必須使用繁體中文和 Markdown 格式輸出專業報告，並在結尾嚴格遵守使用者提供的 JSON 結構來輸出六維度分數和標籤。",
                    },
                    {
                        role: "user",
                        content: prompt,
                    }
                ],
                temperature: 0.7,
                max_tokens: 3000, 
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const status = response.status;
            
            console.error("OpenAI API Error:", errorData.error ? errorData.error.message : response.statusText);

            return res.status(status).json({
                error: `OpenAI API 請求失敗 (HTTP ${status})`,
                detail: errorData.error ? errorData.error.message : response.statusText
            });
        }

        const data = await response.json();
        
        // 返回給前端 index.html 期望的格式
        res.status(200).json(data);

    } catch (error) {
        console.error("Serverless Function Internal Error:", error);
        res.status(500).json({ error: 'Internal Server Error', detail: error.message });
    }
}
