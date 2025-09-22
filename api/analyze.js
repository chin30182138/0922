// ==========================
//   檔案：api/analyze.js
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

    // 組合角色資訊
    let roleInfo = "";
    if (mode === "single") {
      roleInfo = `${aBeast} - ${aKin} - ${aBranch}`;
    } else {
      roleInfo = `甲方：${aBeast} - ${aKin} - ${aBranch}\n乙方：${bBeast} - ${bKin} - ${bBranch}`;
    }

    // 根據情境建立專屬 Prompt
    function buildPrompt(scene) {
      let prompt = `請根據六獸金錢卦的理論，生成分析內容。
角色設定：${roleInfo}
情境：${scene}

請依照下列結構完整輸出分析（用繁體中文）：`;

      if (scene === "職場") {
        prompt += `
1. 雙層角色設定（六獸特質、地支特質）
2. 互動模式分析（上司版/下屬版）
3. 高危衝突點（三條，重點加粗）
4. 雙向應對策略（上司版三條，下屬版三條）
5. 情境對話（模擬上司與下屬互動，2-3句）
6. 經典避坑提醒（三條）

最後請附上一份 JSON，格式如下：
{"情感": 0-10, "事業": 0-10, "健康": 0-10, "財運": 0-10, "智慧": 0-10}`;
      }

      if (scene === "人際關係") {
        prompt += `
1. 人格互補與衝突點
2. 合作默契與誤解來源
3. 沟通建議（三條）
4. 經典相處場景描述（一段）

最後附 JSON：{"情感": x, "事業": x, "健康": x, "財運": x, "智慧": x}`;
      }

      if (scene === "愛情") {
        prompt += `
1. 愛情契合度指數（0-10分）
2. 情感互動模式
3. 潛在矛盾點（三條）
4. 建議相處方式（三條）
5. 浪漫加分行為（兩條）

最後附 JSON：{"情感": x, "事業": x, "健康": x, "財運": x, "智慧": x}`;
      }

      if (scene === "性愛") {
        prompt += `
1. 情愛指數（0-10分）
2. 互動模式（詳細描寫）
3. 雷點分析（潛在衝突）
4. 最佳性愛劇本（兩種玩法）
5. 推薦體位（兩種）
6. 推薦口交技巧（兩種）
7. 推薦情趣服裝（兩種）
8. 推薦玩具（兩種）
9. 推薦性愛場景（兩種）

最後附 JSON：{"情感": x, "事業": x, "健康": x, "財運": x, "智慧": x}`;
      }

      if (scene === "綜合") {
        prompt += `
1. 六獸與地支綜合特質分析
2. 在職場、人際、愛情三方面的表現（各一段）
3. 提升運勢的建議（三條）

最後附 JSON：{"情感": x, "事業": x, "健康": x, "財運": x, "智慧": x}`;
      }

      return prompt;
    }

    // 批次模式 → 多情境
    if (multi) {
      const scenes = ["職場", "愛情", "性愛"];
      const results = [];

      for (const sc of scenes) {
        const prompt = buildPrompt(sc);
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.9,
          }),
        });
        const result = await response.json();
        const content = result.choices?.[0]?.message?.content || "（未生成內容）";

        // 嘗試擷取 JSON
        let scores = { "情感": 5, "事業": 5, "健康": 5, "財運": 5, "智慧": 5 };
        try {
          const match = content.match(/\{[\s\S]*\}/);
          if (match) scores = JSON.parse(match[0]);
        } catch (e) {
          console.error("JSON 解析錯誤", e);
        }

        results.push({ context: sc, text: content, scores });
      }

      return res.status(200).json({ results });
    }

    // 單次模式
    const prompt = buildPrompt(context);
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
      }),
    });

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "（未生成內容）";

    // 嘗試擷取 JSON
    let scores = { "情感": 5, "事業": 5, "健康": 5, "財運": 5, "智慧": 5 };
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) scores = JSON.parse(match[0]);
    } catch (e) {
      console.error("JSON 解析錯誤", e);
    }

    return res.status(200).json({ text: content, scores });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error", detail: err.message });
  }
}
