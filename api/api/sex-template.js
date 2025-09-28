export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: "missing_env" });

    const { aBeast, aKin, aBranch, bBeast, bKin, bBranch, modules } = req.body ?? {};

    const systemPrompt = `你是性愛分析專家，根據六獸、六親、地支，輸出一份完整性愛模板。
輸出排版請清晰，每一段分行，用「•」或小標題。`;

    const userPrompt = `
配對：
我方：${aBeast} × ${aKin} × ${aBranch}
對方：${bBeast} × ${bKin} × ${bBranch}
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

    const data = await r.json();
    let text = data.output_text || "（無內容）";
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: "server_error", detail: String(e) });
  }
}
