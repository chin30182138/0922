// /api/sex-template.js —— 修正版
// 功能：性愛情境分析模板（避免 output_text 抓不到內容）

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // 確認有 API KEY
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "missing_env",
        detail: "OPENAI_API_KEY not set in Vercel Project Settings → Environment Variables",
      });
    }

    const { aBeast, aKin, aBranch, bBeast, bKin, bBranch, modules } = req.body ?? {};

    // 系統提示
    const systemPrompt = `你是性愛分析專家，根據六獸、六親、地支，輸出一份完整性愛模板。
輸出排版請清晰，每一段分行，用「•」或小標題。`;

    // 使用者輸入
    const userPrompt = `
配對：
我方：${aBeast || "未填"} × ${aKin || "未填"} × ${aBranch || "未填"}
對方：${bBeast || "未填"} × ${bKin || "未填"} × ${bBranch || "未填"}
分析模組：${modules?.join("、") || "全部"}

請輸出包含：
• 情愛指數
• 互動模式
• 雷點分析
• 劇本推薦（至少 2 條）
• 推薦體位（至少 2 條）
• 推薦玩具（至少 2 條）
• 推薦場景（至少 2 條）
`;

    // 呼叫 OpenAI Responses API
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.9,
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      return res.status(500).json({ error: "openai_failed", detail: errText });
    }

    const data = await r.json();

    // 嘗試抽取文字內容
    let text = data.output_text;
    if (!text && Array.isArray(data.output)) {
      text = data.output
        .map(o =>
          Array.isArray(o.content)
            ? o.content.map(c => c.text || "").join("\n")
            : ""
        )
        .join("\n")
        .trim();
    }
    if (!text) {
      text = "⚠️ AI 沒有回傳內容，請檢查輸入或重新嘗試。\n\nDEBUG:\n" + JSON.stringify(data, null, 2);
    }

    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: "server_error", detail: String(e) });
  }
}
