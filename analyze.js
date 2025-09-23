export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { mode, aKin, aBeast, aBranch, bKin, bBeast, bBranch, scene } = req.body;

  const templates = {
    work: `🐉 ${aBeast}${aBranch} 上司 VS ${bBeast || "—"}${bBranch || "—"} 下屬
雙層角色設定
• ${aBeast}特質：強勢果斷，重視效率。
• ${aBranch}特質：有野心，重視長遠規劃。
互動模式分析：上司希望立即行動，下屬重視計劃。
高危衝突點：功勞歸屬 & 執行節奏。
✅ 雙向應對策略：上司給舞台，下屬給面子。
✨ 金句：團隊合作，不是削弱個人，而是放大彼此的力量。`,

    love: `${aBeast}${aBranch} 與 ${bBeast || "—"}${bBranch || "—"} 愛情互動
• 情感指數：8/10
• 互動模式：浪漫 vs 理性
• 陷阱：過度依賴 vs 冷淡
• 最佳相處：保持儀式感 + 溝通
✨ 金句：真正的愛情，是在平凡裡找到不凡。`,

    sex: `${aBeast}${aBranch} X ${bBeast || "—"}${bBranch || "—"} 性愛分析
• 情愛指數：9/10
• 互動模式：挑逗與掌控的遊戲
• 推薦體位：交錯後入 / 翻轉騎乘
• 情趣推薦：蕾絲馬甲 + 語音控制玩具
• 最佳場景：私人遊戲室
✨ 金句：愉悅不是目的，而是彼此信任的副產品。`,

    social: `${aBeast}${aBranch} 與 ${bBeast || "—"}${bBranch || "—"} 人際互動
• 關鍵：信任與誠懇
• 容易摩擦：誰主導對話
• 建議：先讚美再建議
✨ 金句：人脈的本質是互惠，而不是利用。`,

    personality: `${aBeast}${aBranch}（${aKin}）個性分析
• 優點：有領導力、執行力
• 缺點：易衝動、耐性不足
• 適合發揮：需要速度與行動的場合
✨ 金句：了解自己，是駕馭命運的第一步。`
  };

  const scores = [7, 8, 6, 9, 7]; // 模擬雷達分數

  return res.status(200).json({
    text: templates[scene] || "分析結果",
    scores
  });
}
