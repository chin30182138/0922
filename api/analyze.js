// ==========================
//    文件：api/analyze.js
// ==========================
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "missing_env", detail: "OPENAI_API_KEY not set" });
    }

    const { mode, aBeast, aKin, aBranch, bBeast, bKin, bBranch, context, multi } = req.body ?? {};

    // 📦 Prompt 範本庫（同之前）
    const templates = {
      "職場": `...職場篇格式...`,
      "人際關係": `...人際關係篇格式...`,
      "愛情": `...愛情篇格式...`,
      "性愛": `...性愛篇格式...`,
      "綜合": `...綜合篇格式...`
    };

    // ⏩ 如果是「批次模式」 → 直接跑三種情境
    const contexts = multi ? ["職場", "愛情", "性愛"] : [context || "綜合"];

    let results = [];

    for (const ctx of contexts) {
      const prompt = templates[ctx];

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.85,
        }),
      });

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content || "（未生成內容）";

      // 預設分數
      let scores = { "情感": 5, "事業": 5, "健康": 5, "財運": 5, "智慧": 5 };
      try {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
          scores = JSON.parse(match[0]);
        }
      } catch (e) {
        console.error("JSON 解析錯誤", e);
      }

      results.push({ context: ctx, text: content, scores });
    }

    res.status(200).json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", detail: err.message });
  }
}
