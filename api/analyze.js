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

    // 固定格式模板
    const prompts = {
      career: `
請生成「職場篇」的完整分析，並用 JSON 回傳：
{
  "analysis": "<h2>職場篇報告</h2>...(完整 HTML 內容)...",
  "scores": {
    "情感": 數字0-100,
    "事業": 數字0-100,
    "人際": 數字0-100,
    "健康": 數字0-100,
    "靈性": 數字0-100
  }
}

分析的 HTML 報告格式請固定為：
🐉 {上司六獸}{上司地支}{上司六親} VS {下屬六獸}{下屬地支}{下屬六親}

<h3>雙層角色設定</h3>
<ul>
<li>{上司六獸}特質：依照六獸特質補充</li>
<li>{上司地支}特質：依照地支特質補充</li>
<li>{下屬六獸}特質：依照六獸特質補充</li>
<li>{下屬地支}特質：依照地支特質補充</li>
</ul>

<h3>互動模式分析</h3>
<ul><li>上司的行事風格</li><li>下屬的行事風格</li><li>互動模式總結</li></ul>

<h3>高危衝突點</h3>
<ul><li>誰的戰術優先</li><li>功勞歸屬</li><li>未來發展猜忌</li></ul>

<h3>雙向應對策略</h3>
✅ 上司版：三條具體建議  
✅ 下屬版：三條具體建議  

<h3>情境對話</h3>
<p>上司：「...」<br>下屬：「...」</p>

<h3>經典避坑提醒</h3>
<ul><li>提醒1</li><li>提醒2</li><li>提醒3</li></ul>
      `,
      love: `
請生成「愛情篇」的完整分析，並用 JSON 回傳：
{
  "analysis": "<h2>愛情篇報告</h2>...(完整 HTML 內容)...",
  "scores": {...同上...}
}

HTML 格式：
💞 {甲方六獸}{甲地方}{甲六親} X {乙方六獸}{乙地方}{乙六親}

<h3>愛情互動特色</h3>
<ul><li>甲方</li><li>乙方</li></ul>

<h3>甜蜜加分點</h3>
<ul><li>加分1</li><li>加分2</li></ul>

<h3>隱藏危機</h3>
<ul><li>危機1</li><li>危機2</li></ul>

<h3>最佳相處建議</h3>
<ul><li>建議1</li><li>建議2</li></ul>
      `,
      sex: `
請生成「性愛篇」的完整分析，並用 JSON 回傳：
{
  "analysis": "<h2>性愛篇報告</h2>...(完整 HTML 內容)...",
  "scores": {...同上...}
}

HTML 格式：
🔥 {甲方六獸}{甲地方}{甲六親} X {乙方六獸}{乙地方}{乙六親}

<h3>情愛指數</h3>
<p>數字0-10＋一句描述</p>

<h3>互動模式</h3><p>描述</p>
<h3>雷點分析</h3><p>描述</p>

<h3>最佳性愛劇本推薦</h3>
<ul><li>劇本1</li><li>劇本2</li></ul>

<h3>推薦體位</h3>
<ul><li>體位1</li><li>體位2</li></ul>

<h3>推薦情趣元素</h3>
<ul><li>內衣/服裝</li><li>玩具</li><li>場景</li></ul>
      `,
      personality: `
請生成「個性篇」的完整分析，並用 JSON 回傳：
{
  "analysis": "<h2>個性篇報告</h2>...(完整 HTML 內容)...",
  "scores": {...同上...}
}

HTML 格式：
🌟 {單人六獸}{單人地支}{單人六親}

<h3>六獸個性</h3><p>描述</p>
<h3>六親傾向</h3><p>描述</p>
<h3>地支能量</h3><p>描述</p>
<h3>綜合評語</h3><p>描述</p>
      `
    };

    const prompt = prompts[context] || "請產生分析內容";

    // 呼叫 OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "system",
          content: "你是專業六獸金錢卦占卜分析師，請用繁體中文回覆，並且務必輸出 JSON 格式。"
        }, {
          role: "user",
          content: prompt
            .replace(/{上司六獸}/g, aBeast || "")
            .replace(/{上司地支}/g, aBranch || "")
            .replace(/{上司六親}/g, aKin || "")
            .replace(/{下屬六獸}/g, bBeast || "")
            .replace(/{下屬地支}/g, bBranch || "")
            .replace(/{下屬六親}/g, bKin || "")
            .replace(/{甲方六獸}/g, aBeast || "")
            .replace(/{甲地方}/g, aBranch || "")
            .replace(/{甲六親}/g, aKin || "")
            .replace(/{乙方六獸}/g, bBeast || "")
            .replace(/{乙地方}/g, bBranch || "")
            .replace(/{乙六親}/g, bKin || "")
            .replace(/{單人六獸}/g, aBeast || "")
            .replace(/{單人地支}/g, aBranch || "")
            .replace(/{單人六親}/g, aKin || "")
        }]
      })
    });

    const data = await response.json();

    let parsed;
    try {
      parsed = JSON.parse(data.choices?.[0]?.message?.content);
    } catch (e) {
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
