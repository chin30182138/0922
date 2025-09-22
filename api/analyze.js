// ==========================
//   文件：api/analyze.js
// ==========================
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "missing_env", detail: "OPENAI_API_KEY not set" });
    }

    const { mode, aBeast, aKin, aBranch, bBeast, bKin, bBranch, context } = req.body ?? {};

    const prompts = {
      career: `
請生成「職場篇」分析，務必回傳 JSON，格式如下：
{
  "analysis": "<h2>職場篇報告</h2>...(完整 HTML 內容)...",
  "scores": { "情感": 70, "事業": 85, "人際": 75, "健康": 80, "靈性": 65 }
}
內容必須結合六獸(${aBeast}/${bBeast})、六親(${aKin}/${bKin})、地支(${aBranch}/${bBranch}) 的性格差異。
      `,
      love: `
請生成「愛情篇」分析，務必回傳 JSON，格式如下：
{
  "analysis": "<h2>愛情篇報告</h2>...(完整 HTML 內容)...",
  "scores": { "情感": 80, "事業": 65, "人際": 70, "健康": 75, "靈性": 68 }
}
必須包含雙方互動特色、甜蜜加分點、隱藏危機、最佳相處建議。
      `,
      sex: `
請生成「性愛篇」分析，務必回傳 JSON，格式如下：
{
  "analysis": "<h2>性愛篇報告</h2>...(完整 HTML 內容)...",
  "scores": { "情感": 85, "事業": 60, "人際": 72, "健康": 70, "靈性": 66 }
}
必須包含：情愛指數、互動模式、雷點分析、最佳性愛劇本、推薦體位、情趣元素。
      `,
      personality: `
請生成「個性篇」分析，務必回傳 JSON，格式如下：
{
  "analysis": "<h2>個性篇報告</h2>...(完整 HTML 內容)...",
  "scores": { "情感": 65, "事業": 70, "人際": 75, "健康": 80, "靈性": 72 }
}
必須包含：六獸個性、六親傾向、地支能量、綜合評語。
      `
    };

    const prompt = prompts[context] || "請產生分析內容";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" }, // 強制 JSON
        messages: [
          {
            role: "system",
            content: "你是專業六獸占卜分析師，請只回傳 JSON，不要額外文字。"
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";

    // 正則擷取 JSON
    const match = content.match(/\{[\s\S]*\}/);
    let parsed;
    try {
      parsed = match ? JSON.parse(match[0]) : null;
    } catch (e) {
      parsed = null;
    }

    if (!parsed) {
      parsed = {
        analysis: "<p>⚠ JSON 解析失敗，請再試一次。</p>",
        scores: { 情感: 60, 事業: 60, 人際: 60, 健康: 60, 靈性: 60 }
      };
    }

    res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error", detail: err.message });
  }
}
