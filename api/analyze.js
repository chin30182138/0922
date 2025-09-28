// 文件：/api/analyze.js
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "missing_env", detail: "OPENAI_API_KEY not set" });
    }

    const { aBeast, aKin, aBranch, bBeast, bKin, bBranch, context, mode } = req.body ?? {};

    const systemPrompt = `你是一位占卜與職場心理分析顧問。請根據六獸、六親、地支與情境，生成詳細的「人際 / 職場分析報告」。
必須同時輸出文字說明與 JSON（分數與標籤），格式如下：
文字區塊：分段描述人格互動、潛在問題、合作策略。
JSON 區塊：用 \`\`\`json 標記，內含 "scores" 與 "tags"。
scores 包含六個維度：fit, comm, pace, account, trust, innov，範圍 0~100。`;

    const userPrompt = `分析對象：
我方：${aBeast || "—"} × ${aKin || "—"} × ${aBranch || "—"}
${mode === "dual" ? `對方：${bBeast || "—"} × ${bKin || "—"} × ${bBranch || "—"}` : ""}
情境：${context || "—"}

請輸出分析內容（文字 + JSON）。`;

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_output_tokens: 900,
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    const data = await r.json();

    let text = data.output_text;
    if (!text && Array.isArray(data.output)) {
      text = data.output
        .map(o => (Array.isArray(o.content) ? o.content.map(c => c.text || "").join("\n") : ""))
        .join("\n")
        .trim();
    }
    if (!text) text = JSON.stringify(data, null, 2);

    res.status(200).json({ text });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error", detail: e.message });
  }
}
