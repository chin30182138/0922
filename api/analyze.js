export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { context } = req.body ?? {};
    let prompt = `你是一位六獸卜卦專家，請針對「${context}」生成完整分析。`;

    if (context === "職場") {
      prompt += `
請使用以下結構：
1. 雙層角色設定（六獸特質、地支特質）
2. 互動模式分析（上司版/下屬版）
3. 高危衝突點（三條）
4. 雙向應對策略（各三條）
5. 情境對話（2~3句）
6. 經典避坑提醒（三條）

最後附 JSON：{"情感":數字,"事業":數字,"健康":數字,"財運":數字,"智慧":數字}`;
    } else if (context === "性愛") {
      prompt += `
請以「情感研究與兩性互動建議」的角度生成，避免過度露骨。
請使用以下結構：
1. 情愛指數（0-10分）
2. 互動模式
3. 雷點分析
4. 最佳性愛劇本（兩種玩法）
5. 推薦體位（兩種）
6. 推薦互動技巧（兩種）
7. 推薦服裝或氛圍營造（兩種）
8. 推薦輔助道具（兩種）
9. 推薦場景（兩種）

最後附 JSON：{"情感":數字,"事業":數字,"健康":數字,"財運":數字,"智慧":數字}`;
    } else if (context === "愛情") {
      prompt += `
請使用以下結構：
1. 情感特質與吸引力來源
2. 相處模式（優勢與挑戰）
3. 可能衝突點（三條）
4. 維繫愛情的方法（三條）
5. 經典愛情箴言（1~2句）

最後附 JSON：{"情感":數字,"事業":數字,"健康":數字,"財運":數字,"智慧":數字}`;
    } else if (context === "個性") {
      prompt += `
請針對六獸與地支的組合，生成「個人性格分析」。
請使用以下結構：
1. 核心個性特質（2~3點）
2. 優勢表現（2~3條）
3. 潛在弱點（2~3條）
4. 人生建議（三條）
5. 經典性格箴言（1句）

最後附 JSON：{"情感":數字,"事業":數字,"健康":數字,"財運":數字,"智慧":數字}`;
    } else {
      // 預設人際篇
      prompt += `
請使用以下結構：
1. 人際互動特質
2. 合作優勢
3. 潛在矛盾（三條）
4. 化解之道（三條）
5. 友情或合作箴言（1句）

最後附 JSON：{"情感":數字,"事業":數字,"健康":數字,"財運":數字,"智慧":數字}`;
    }

    // === 呼叫 OpenAI ===
    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const result = await completion.json();
    let content = result.choices[0].message.content;

    // === JSON 過濾 ===
    let scores = { "情感": 5, "事業": 5, "健康": 5, "財運": 5, "智慧": 5 };
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        scores = JSON.parse(match[0]);
        content = content.replace(match[0], "");
      }
    } catch (e) {
      console.error("JSON parse error", e);
    }

    // === 清理 Markdown ===
    content = content.replace(/```json|```/g, ""); // 移除程式區塊
    content = content.replace(/^#+\s?/gm, "");     // 移除 # 符號
    content = content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-700">$1</strong>')
      .replace(/\n/g, "<br>");

    res.status(200).json({ text: content.trim(), scores });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
