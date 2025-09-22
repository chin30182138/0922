// ==========================
// 文件：api/analyze.js
// ==========================
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "missing_env", detail: "OPENAI_API_KEY not set" });
    }

    const { context, mode, singleBeast, singleKin, singleBranch,
      aBeast, aKin, aBranch, bBeast, bKin, bBranch } = req.body ?? {};

    // 個性資料庫
    const beastTraits = {
      "青龍": "靈活變通，聰慧多謀，喜歡挑戰與展現領導力。",
      "朱雀": "善於表達，外向活躍，熱情洋溢但也容易衝動。",
      "勾陳": "穩重謹慎，重視秩序與安全，內心有強烈責任感。",
      "螣蛇": "多疑機巧，思緒靈動，擅長應變但心性較敏感。",
      "白虎": "果斷剛烈，衝勁十足，有威嚴但可能帶有攻擊性。",
      "玄武": "隱忍深沉，懂得觀察與等待，城府深厚，注重長遠。"
    };

    const kinTraits = {
      "父母": "重視責任與傳承，偏向守護與規範。",
      "兄弟": "注重平等與合作，重視義氣與群體支持。",
      "子孫": "活潑天真，帶來希望與創新，也象徵放鬆與享樂。",
      "妻財": "追求實際利益與安全感，關注物質與人際的互惠。",
      "官鬼": "壓力與挑戰的來源，亦象徵事業、責任與考驗。"
    };

    const branchTraits = {
      "子": "水能量，聰明冷靜，善於隱藏。",
      "丑": "厚實務實，善於積累，做事踏實。",
      "寅": "木之開端，有野心與冒險精神。",
      "卯": "木氣盛，外向活躍，充滿創造力。",
      "辰": "帶有權謀，能量複雜，象徵轉折。",
      "巳": "火氣上升，外放而精明，具魅力。",
      "午": "火之極旺，熱情奔放，領導欲強。",
      "未": "土氣和緩，追求穩定與人情味。",
      "申": "金之開端，果斷靈活，善交際。",
      "酉": "金氣純粹，果決冷靜，精於計算。",
      "戌": "忠誠守護，剛正不阿，講原則。",
      "亥": "水氣盛，感性直覺，心思細膩。"
    };

    function buildPerson(beast, kin, branch) {
      return `${beast}（${beastTraits[beast]}） × ${kin}（${kinTraits[kin]}） × ${branch}（${branchTraits[branch]}）`;
    }

    let prompt = "";
    if (mode === "single") {
      const person = buildPerson(singleBeast, singleKin, singleBranch);
      prompt = `請針對以下角色進行${context}分析：
角色：${person}

請輸出格式為 JSON：
{
  "profile": "角色的完整個性描述",
  "analysis": "<用 HTML 格式撰寫的分析文字>",
  "scores": {
    "情感": 1-10,
    "事業": 1-10,
    "健康": 1-10,
    "財運": 1-10,
    "智慧": 1-10
  }
}`;
    } else {
      const personA = buildPerson(aBeast, aKin, aBranch);
      const personB = buildPerson(bBeast, bKin, bBranch);
      prompt = `請針對以下兩個角色進行${context}分析：
甲方：${personA}
乙方：${personB}

請輸出格式為 JSON：
{
  "profile": "雙方角色的完整個性描述",
  "analysis": "<用 HTML 格式撰寫的分析文字>",
  "scores": {
    "情感": 1-10,
    "事業": 1-10,
    "健康": 1-10,
    "財運": 1-10,
    "智慧": 1-10
  }
}`;
    }

    // 呼叫 OpenAI
    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "你是專業的金錢卦與六獸分析師，請輸出繁體中文。" },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    const result = await completion.json();
    const content = result.choices?.[0]?.message?.content ?? "{}";
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { profile: "", analysis: "（無分析結果）", scores: {} };
    }

    return res.status(200).json(parsed);

  } catch (err) {
    console.error("Analyze error:", err);
    return res.status(500).json({ error: "internal_error", detail: err.message });
  }
}
