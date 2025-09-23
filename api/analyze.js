// ===============================
// 後端 API: analyze.js
// 路徑： /api/analyze.js
// 功能：接收前端送來的 JSON，呼叫 OpenAI API，回傳格式化分析結果
// ===============================

import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { type, mode, aKin, aBeast, aBranch, bKin, bBeast, bBranch } = req.body ?? {};

    // 分析場景的提示詞
    const prompts = {
      personality: `
你是一位專業卜卦與人格分析師，根據輸入的六親、六獸、地支，產出完整的「個性分析」。
請依下列格式輸出：

【個性特徵】
- 六親：${aKin}
- 六獸：${aBeast}
- 地支：${aBranch}
【詳細描述】
請描述此組合的個性特徵、優點、缺點，以及在生活與人際上的表現。
`,

      career: `
你是一位職場管理顧問，根據上下屬的六親、六獸、地支，產出「職場互動分析」。
請依以下格式輸出：

🐉 ${aBeast}${aBranch}上司 VS ${bBeast}${bBranch}下屬
雙層角色設定
• 上司特質：
• 下屬特質：
互動模式分析
• ...
高危衝突點
• ...
雙向應對策略
✅ 上司版：
1.
2.
✅ 下屬版：
1.
2.
情境對話
上司：「...」
下屬：「...」
經典避坑提醒
• ...
`,

      love: `
你是一位情感顧問，根據雙方六親、六獸、地支，產出「愛情互動分析」。
請依以下格式輸出：

💖 ${aBeast}${aBranch} 與 ${bBeast}${bBranch}
愛情特質：
互動模式：
可能的挑戰：
維繫建議：
情感小劇場：
`,

      sex: `
你是一位性愛心理學顧問，根據雙方六親、六獸、地支，產出「性愛分析」。
請依以下格式輸出：

🔥 ${aBeast}${aBranch} X ${bBeast}${bBranch}
• 情愛指數：X/10
• 互動模式：
• 雷點分析：
• 最佳性愛劇本推薦：
• 推薦體位：
• 推薦口交技巧：
• 推薦情趣內衣與服裝：
• 推薦玩具：
• 推薦性愛場景：
`
    };

    // 選擇提示
    const prompt = prompts[type] || prompts["personality"];

    // 呼叫 OpenAI
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "你是專業卜卦分析與顧問，請依指定格式回覆。" },
        { role: "user", content: prompt }
      ]
    });

    const analysis = completion.choices[0].message.content;

    // 雷達圖數據（簡單模擬：5 個面向，隨機生成或未來可改由 AI 回傳）
    const radar = {
      智慧: Math.floor(Math.random() * 40) + 60,
      情感: Math.floor(Math.random() * 40) + 60,
      行動力: Math.floor(Math.random() * 40) + 60,
      合作: Math.floor(Math.random() * 40) + 60,
      領導: Math.floor(Math.random() * 40) + 60,
    };

    // 正向金句（AI 生成一條鼓勵話）
    const quoteResult = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "你是一位正向教練，請給一句鼓勵人心的金句。" },
        { role: "user", content: "請針對剛剛的分析，挑一個適合的正向鼓勵語。" }
      ]
    });

    const quote = quoteResult.choices[0].message.content;

    res.status(200).json({
      analysis,
      radar,
      quote
    });

  } catch (err) {
    console.error("分析失敗：", err);
    res.status(500).json({ error: "分析失敗", detail: err.message });
  }
}
