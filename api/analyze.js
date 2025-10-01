// api/analyze.js - V29.2 最終穩定版 (使用 OpenAI 官方 SDK)

// 導入 OpenAI SDK (依賴 package.json 安裝)
const OpenAI = require('openai'); 

// 確保 Vercel 環境變數中 OPENAI_API_KEY 已設定
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY; // 優先使用 OpenAI Key
const FINAL_MODEL = 'gpt-3.5-turbo'; // 鎖定速度最快，避免 Vercel 超時

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY, 
});

// JSON 結構提示 (V13.5 最終嚴格版)
const JSON_STRUCTURE_PROMPT = `
**請絕對、嚴格、立即遵守以下格式規範：**

1.  報告主體必須是專業、深入的繁體中文 Markdown 格式。
2.  **在報告結束後，你必須立即輸出一個獨立的 '```json' 程式碼區塊。**
3.  **此 '```json' 區塊的前後，絕對禁止出現任何多餘的解釋文字或標題。**
4.  JSON 區塊必須嚴格包含以下結構：

{
  "scores": {
    "fit": [0-100的整數，代表契合度分數],
    "comm": [0-100的整數，代表溝通度分數],
    "pace": [0-100的整數，代表節奏度分數],
    "account": [0-100的整數，代表權責度分數],
    "trust": [0-100的整數，代表信任度分數],
    "innov": [0-100的整數，代表創新度分數]
  },
  "tags": [
    "性格或情境的關鍵詞1",
    "性格或情境的關鍵詞2",
    "性格或情境的關鍵詞3"
  ]
}
`;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Missing required parameter: prompt.' });
    }

    try {
        const fullPrompt = prompt + JSON_STRUCTURE_PROMPT;
        
        // 呼叫 OpenAI API
        const completion = await openai.chat.completions.create({
            model: FINAL_MODEL,
            messages: [
                {
                    role: "system",
                    content: "你是一位精通易學、心理學和企業管理的專業顧問，專門提供仙人指路神獸七十二型人格的分析報告。你必須使用繁體中文和 Markdown 格式輸出專業報告，並在結尾嚴格遵守使用者提供的 JSON 結構來輸出六維度分數和標籤。",
                },
                {
                    role: "user",
                    content: fullPrompt,
                }
            ],
            temperature: 0.7,
            max_tokens: 3000,
        });

        res.status(200).json(completion);

    } catch (error) {
        console.error("OpenAI API Error:", error.message || error);
        
        // 處理 API 請求失敗
        res.status(500).json({ 
            error: '分析服務器錯誤', 
            detail: error.message || '無法連線到 AI 服務。' 
        });
    }
}
