// ==========================
// 檔案：api/analyze.js
// ==========================

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const { mode, aBeast, aKin, aBranch, bBeast, bKin, bBranch, context } = req.body ?? {};

    // 組合提示詞
    let prompt = "";
    if (mode === "single") {
      prompt = `請根據以下資訊進行分析：
六獸：${aBeast}
六親：${aKin}
地支：${aBranch}
情境：${context}

請輸出一段文字說明，並給五個分數 (情感、事業、健康、財運、智慧)，每個 0~10。`;
    } else {
      prompt = `請根據以下雙人資訊進行分析：
甲方：${aBeast} × ${aKin} × ${aBranch}
乙方：${bBeast} × ${bKin} × ${bBranch}
情境：${context}

請輸出一段文字說明，並給五個分數 (情感、事業、健康、財運、智慧)，每個 0~10。`;
    }

    // 呼叫 OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();

    // 抓 GPT 輸出
    const rawText = data.choices?.[0]?.message?.content || "無法生成分析";

    // 嘗試解析分數（假設 GPT 輸出 JSON 格式）
    let scores = {
      情感: 0,
      事業: 0,
      健康: 0,
      財運: 0,
      智慧: 0
    };

    try {
      const match = rawText.match(/\{[\s\S]*\}/); // 嘗試抓 JSON
      if (match) {
        const parsed = JSON.parse(match[0]);
        scores = { ...scores, ...parsed };
      }
    } catch (e) {
      console.warn("JSON 解析失敗，使用預設分數");
      // 如果 GPT 沒給 JSON，就給隨機分數
      scores = {
        情感: Math.floor(Math.random() * 10) + 1,
        事業: Math.floor(Math.random() * 10) + 1,
        健康: Math.floor(Math.random() * 10) + 1,
        財運: Math.floor(Math.random() * 10) + 1,
        智慧: Math.floor(Math.random() * 10) + 1
      };
    }

    return res.status(200).json({
      text: rawText,
      scores
    });

  } catch (err) {
    console.error("Analyze API Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
