// ==========================
// analyze.js
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

    // 個性特徵庫
    const beastTraits = {
      "青龍": "靈活多變、反應迅速，喜歡挑戰與創新。",
      "朱雀": "表達力強、情感外放，容易感染周圍的人。",
      "勾陳": "穩重踏實、權威感強，重視秩序與規範。",
      "螣蛇": "多疑機巧、善於隱藏，能洞悉隱微之處。",
      "白虎": "剛烈果決、行動迅速，帶有壓迫與震懾感。",
      "玄武": "隱忍深沉、謀略過人，偏向被動觀察與防禦。"
    };

    const kinTraits = {
      "父母": "依靠、支持與知識來源，注重責任與傳承。",
      "兄弟": "競爭與合作並存，象徵平等與衝突。",
      "子孫": "創意與發展，代表未來希望與保護。",
      "妻財": "資源與利益，與人際交換密切相關。",
      "官鬼": "壓力、責任與挑戰，同時也是權力的象徵。"
    };

    const branchTraits = {
      "子": "聰明靈巧，善於隱忍，但心思複雜。",
      "丑": "務實固執，偏向穩健，少有冒險。",
      "寅": "勇敢果斷，充滿衝勁，略顯急躁。",
      "卯": "靈活柔軟，擅交際，感性多思。",
      "辰": "神祕中庸，能調和矛盾，亦有執拗。",
      "巳": "思維縝密，善於判斷，情緒內斂。",
      "午": "熱情外放，充滿活力，但易衝動。",
      "未": "隨和耐心，樂於協助，卻缺乏主見。",
      "申": "機敏多謀，善於隨機應變，思路靈活。",
      "酉": "注重細節，擅於規劃，但易過於挑剔。",
      "戌": "重情重義，講究誠信，但固執不化。",
      "亥": "心性溫和，富於同理，但意志不夠堅定。"
    };

    // 組合角色個性描述
    function getPersonality(beast, kin, branch) {
      return `${beast}：${beastTraits[beast]}\n${kin}：${kinTraits[kin]}\n${branch}：${branchTraits[branch]}`;
    }

    // 分析格式
    let output = "";
    if (context === "職場") {
      output = `
📊【職場分析】
角色特質：
${getPersonality(aBeast, aKin, aBranch)}

${mode === "dual" ? `➤ 對手特質：\n${getPersonality(bBeast, bKin, bBranch)}` : ""}

互動模式解析：
- 上司傾向：權威／規劃／決斷
- 下屬傾向：執行／應變／服從

📌 建議：
1. 避免正面衝突，善用互補優勢。
2. 建立清晰的責任分工。
      `;
    } else if (context === "愛情") {
      output = `
💖【愛情分析】
角色特質：
${getPersonality(aBeast, aKin, aBranch)}

${mode === "dual" ? `➤ 對象特質：\n${getPersonality(bBeast, bKin, bBranch)}` : ""}

情感互動：
- 情愛指數：${Math.floor(Math.random()*3)+7}/10
- 默契指數：${Math.floor(Math.random()*3)+6}/10

📌 建議：
1. 多用真誠溝通化解誤會。
2. 情感中避免猜忌與冷漠。
      `;
    } else if (context === "性愛") {
      output = `
🔥【性愛分析】
角色特質：
${getPersonality(aBeast, aKin, aBranch)}

${mode === "dual" ? `➤ 對象特質：\n${getPersonality(bBeast, bKin, bBranch)}` : ""}

互動模式：
- 激情指數：${Math.floor(Math.random()*3)+7}/10
- 和諧指數：${Math.floor(Math.random()*3)+6}/10

推薦體位：
- ${["女上位","後入式","側身交纏","坐姿交疊"][Math.floor(Math.random()*4)]}
- ${["站立擁抱","反向騎乘","交錯並腿","床邊支撐"][Math.floor(Math.random()*4)]}
      `;
    } else if (context === "個性") {
      output = `
🧩【個性分析】
角色特質：
${getPersonality(aBeast, aKin, aBranch)}

🔑 核心性格：
- 優點：堅毅 / 創意 / 感性
- 弱點：固執 / 過度情緒化

📌 建議：
- 在適合的領域發揮長處。
- 學會情緒管理，避免消耗過多能量。
      `;
    }

    // 回傳 JSON + 雷達圖數據
    const radarData = {
      "情感": Math.floor(Math.random() * 10) + 1,
      "事業": Math.floor(Math.random() * 10) + 1,
      "健康": Math.floor(Math.random() * 10) + 1,
      "財運": Math.floor(Math.random() * 10) + 1,
      "智慧": Math.floor(Math.random() * 10) + 1
    };

    res.status(200).json({
      text: output,
      radar: radarData
    });

  } catch (err) {
    res.status(500).json({ error: "Server error", detail: err.message });
  }
}
