// api/analyze.js - V25.0 最終穩定版 (指令修復：要求輸出純 JSON，不再使用 Markdown)

// 獲取 Vercel 環境變數中設置的 Gemini API Key (兼容舊的 OPENAI_API_KEY 名稱)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY; 
const GEMINI_API_ENDPOINT = '[https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent](https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent)';

// V25.0 核心：分離 Prompt
const REPORT_PROMPT_HEADER = "你是一位精通中國古代《神獸七十二型人格》理論的資深分析師。你的任務是根據用戶提供的『六獸-六親-地支』組合和情境，輸出深度且具體的分析報告。報告必須專業、嚴謹，並且字數至少 800 字。";

const JSON_STRUCTURE_PROMPT = `
**請絕對、嚴格、立即遵守以下格式規範：**
1.  你必須且只能輸出**報告的 Markdown 文本內容**，在報告文本的**結尾處**，緊接著輸出**一個嚴格符合 JSON 格式的文本**。
2.  **JSON 區塊前後，不能有任何 Markdown 程式碼包裹符號 (如 \`\`\` ) 或額外的文字。**
3.  JSON 區塊必須嚴格包含以下結構：
{
  "scores": {
    "fit": [0-100的整數，代表契合度分數],
    "comm": [0-100的整數，代表溝通度分數],
    "pace": [0-100的整數，代表節奏度分數],
    "account": [0-100的整數，代表權責度分數],
    "trust": [0-100的整數，代表信任度分數],
    "innov": [0-100的整數，代表創新度分數]
  },
  "tags": ["關鍵詞1", "關鍵詞2", "關鍵詞3"]
}
`;


export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end('Method Not Allowed');
    }

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: GEMINI_API_KEY is not set.' });
    }

    try {
        const { prompt } = req.body;
        const fullPrompt = prompt + REPORT_PROMPT_HEADER + JSON_STRUCTURE_PROMPT;

        // V25.0 核心：直接呼叫 Gemini 2.5 Pro
        const response = await fetch(GEMINI_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GEMINI_API_KEY
            },
            body: JSON.stringify({
                model: 'gemini-2.5-pro',
                contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
                config: {
                    temperature: 0.7,
                    maxOutputTokens: 3000,
                    // 移除 responseMimeType，讓模型可以輸出 Markdown 和 JSON 混合文本
                }
            })
        });

        if (!response.ok) {
            // ... (錯誤處理不變) ...
            const errorData = await response.json().catch(() => ({}));
            const status = response.status;
            return res.status(status).json({
                error: `Gemini API 請求失敗 (HTTP ${status})`,
                detail: errorData.error ? errorData.error.message : response.statusText
            });
        }

        const data = await response.json();
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
