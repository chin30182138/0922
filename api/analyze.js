// ===============================
// 後端 API: analyze.js (最終版)
// 放在 /api/analyze.js
// ===============================

import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { type, mode, aKin, aBeast, aBranch, bKin, bBeast, bBranch } = req.body ?? {};

    // 四大情境模板
    const prompts = {
      personality: `
你是一位專業卜卦與人格分析師，請依以下輸入進行完整分析：
六親：${aKin}
六獸：${aBeast}
地支：${aBranch}

請輸出 JSON 格式：
{
  "analysis": "【個性特徵】...【詳細描述】...",
  "radar": {
    "智慧": 整數0-100,
    "情感": 整數0-100,
    "行動力": 整數0-100,
    "合作": 整數0-100,
    "領導": 整數0-100
  },
  "quote": "一句正向金句"
}
`,

      career: `
你是一位職場顧問，請根據上下屬六親六獸地支進行「職場互動分析」：
上司：${aBeast}${aBranch} (${aKin})
下屬：${bBeast}${bBranch} (${bKin})

請輸出 JSON 格式：
{
  "analysis": "🐉 ${aBeast}${aBranch}上司 VS ${bBeast}${bBranch}下屬\n雙層角色設定...\n互動模式分析...\n高危衝突點...\n雙向應對策略...\n情境對話...\n經典避坑提醒...",
  "radar": {
    "智慧": 整數0-100,
    "情感": 整數0-100,
    "行動力": 整數0-100,
    "合作": 整數0-100,
    "領導": 整數0-100
  },
  "quote": "一句正向金句"
}
`,

      love: `
你是一位情感顧問，請根據雙方六親六獸地支進行「愛情互動分析」：
一方：${aBeast}${aBranch} (${aKin})
另一方：${bBeast}${bBranch} (${bKin})

請輸出 JSON 格式：
{
  "analysis": "💖 ${aBeast}${aBranch} 與 ${bBeast}${bBranch}\n愛情特質...\n互動模式...\n挑戰...\n維繫建議...\n情感小劇場...",
  "radar": {
    "智慧": 整數0-100,
    "情感": 整數0-100,
    "行動力": 整數0-100,
    "合作": 整數0-100,
    "領導": 整數0-100
  },
  "quote": "一句正向金句"
}
`,

      sex: `
你是一位性愛心理學顧問，請根據雙方六親六獸地支進行「性愛互動分析」：
一方：${aBeast}${aBranch} (${aKin})
另一方：${bBeast}${bBranch} (${bKin})

請輸出 JSON 格式：
{
  "analysis": "🔥 ${aBeast}${aBranch} X ${bBeast}${bBranch}\n情愛指數...\n互動模式...\n雷點分析...\n最佳性愛劇本推薦...\n推薦體位...\n推薦技巧...\n推薦服裝...\n推薦玩具...\n推薦場景...",
  "radar": {
    "智慧": 整數0-100,
    "情感": 整數0-100,
    "行動力": 整數0-100,
    "合作": 整數0-100,
    "領導": 整數0-100
  },
  "quote": "一句正向金句"
}
`
    };

    const prompt = prompts[type] || prompts["personality"];

    // 呼叫 OpenAI，要求直接回傳 JSON
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "你是專業卜卦顧問，請務必輸出符合 JSON 格式的內容。" },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    let data;
    try {
      data = JSON.parse(completion.choices[0].message.content);
    } catch (e) {
      console.error("JSON 解析失敗", completion.choices[0].message.content);
      return res.status(500).json({ error: "JSON 解析失敗", raw: completion.choices[0].message.content });
    }

    res.status(200).json(data);

  } catch (err) {
    console.error("分析失敗：", err);
    res.status(500).json({ error: "分析失敗", detail: err.message });
  }
}
