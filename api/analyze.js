// ==========================
// 檔案：api/analyze.js
// ==========================

// ===== 模板函數 =====

// 性愛篇
function buildSexAnalysis(aBeast, aBranch, bBeast, bBranch) {
  return {
    text: `
${aBeast}${aBranch} X ${bBeast}${bBranch} - 靈活變化與機智較量的極致碰撞 
• 情愛指數：9.5/10（挑逗遊戲與誘惑掌控的雙重樂趣） 
• 互動模式：${aBeast}${aBranch} 聰明且擅長調戲，${bBeast}${bBranch} 靈活多變。
• 雷點分析：雙方都喜歡主導，可能因為爭奪掌控權而過於競爭。
• 推薦體位：交錯後入、翻轉騎乘
• 推薦玩具：震動指環、語音控制震動器
    `,
    scores: { 情感: 9.5, 事業: 5, 健康: 7, 財運: 6, 智慧: 5 }
  };
}

// 職場篇
function buildWorkAnalysis(aBeast, aBranch, bBeast, bBranch) {
  return {
    text: `
🐉 ${aBeast}${aBranch}上司 VS ${bBeast}${bBranch}下屬

互動模式分析：上司強攻快打，下屬謀略算計，互信度低。
衝突：戰術優先權、功勞歸屬、未來發展。
應對策略：設「戰術會議」、公開感謝、提前談好升遷路徑。
    `,
    scores: { 情感: 5, 事業: 9, 健康: 6, 財運: 8, 智慧: 7 }
  };
}

// 人際篇
function buildRelationAnalysis(aBeast, aBranch, bBeast, bBranch) {
  return {
    text: `
🤝 ${aBeast}${aBranch} 與 ${bBeast}${bBranch} 的人際互動

互補特質：${aBeast}外向掌控氣氛，${bBeast}細膩善於觀察。
優勢：熱情 × 細膩，形成默契。
盲點：${aBeast}忽略細節，${bBeast}顧慮太多。
建議：${aBeast}多聽，${bBeast}多說。
    `,
    scores: { 情感: 8, 事業: 6, 健康: 7, 財運: 5, 智慧: 6 }
  };
}

// 愛情篇
function buildLoveAnalysis(aBeast, aBranch, bBeast, bBranch) {
  return {
    text: `
❤️ ${aBeast}${aBranch} 與 ${bBeast}${bBranch} 的愛情火花

互動模式：${aBeast}熱情直接，${bBeast}溫柔細膩。
挑戰：${aBeast}過急、${bBeast}過被動。
建議：放慢節奏 + 增加回應。
    `,
    scores: { 情感: 9, 事業: 4, 健康: 7, 財運: 5, 智慧: 6 }
  };
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { mode, aBeast, aBranch, bBeast, bBranch, context } = req.body ?? {};
    let result;

    if (mode === "double" && context === "性愛") {
      result = buildSexAnalysis(aBeast, aBranch, bBeast, bBranch);
    } else if (mode === "double" && context === "職場") {
      result = buildWorkAnalysis(aBeast, aBranch, bBeast, bBranch);
    } else if (mode === "double" && context === "人際關係") {
      result = buildRelationAnalysis(aBeast, aBranch, bBeast, bBranch);
    } else if (mode === "double" && context === "愛情") {
      result = buildLoveAnalysis(aBeast, aBranch, bBeast, bBranch);
    } else {
      result = {
        text: `【${context || "綜合"}分析】\n選項：${aBeast}${aBranch} × ${bBeast}${bBranch}`,
        scores: { 情感: 6, 事業: 6, 健康: 6, 財運: 6, 智慧: 6 }
      };
    }

    res.status(200).json(result);

  } catch (err) {
    console.error("Analyze API Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
