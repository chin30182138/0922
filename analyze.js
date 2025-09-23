export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { mode, aKin, aBeast, aBranch, bKin, bBeast, bBranch, scene } = req.body;

  // 🔹 模擬 AI 回傳格式
  const textTemplates = {
    work: `🐉 ${aBeast}${aBranch} 上司 VS ${bBeast || "—"}${bBranch || "—"} 下屬
雙層角色設定
• ${aBeast}特質：強勢果斷，重視效率。
• ${aBranch}特質：有野心，重視長遠規劃。
互動模式分析：...（AI 生成的詳細描述）
高危衝突點：...  
✅ 雙向應對策略：...`,
    love: `${aBeast}${aBranch} 與 ${bBeast || "—"}${bBranch || "—"} 愛情互動分析
• 情感指數：8.5/10
• 互動模式：浪漫 vs 理性
• 愛情陷阱：過度依賴 / 冷淡矛盾
• 最佳相處：保持儀式感 + 溝通`,
    sex: `${aBeast}${aBranch} X ${bBeast || "—"}${bBranch || "—"} 性愛分析
• 情愛指數：9/10
• 互動模式：挑逗與掌控的遊戲
• 推薦體位：交錯後入 / 翻轉騎乘
• 情趣推薦：語音控制玩具 + 蕾絲馬甲
• 最佳場景：私人遊戲室`,
    social: `${aBeast}${aBranch} 與 ${bBeast || "—"}${bBranch || "—"} 人際互動
• 人際關鍵：信任、誠懇、合作
• 容易摩擦：誰主導溝通
• 建議：多讚美對方，減少競爭心`,
    personality: `${aBeast}${aBranch}（${aKin}）個性分析
• 優點：有領導力、執行力
• 缺點：易衝動、耐性不足
• 適合發揮：需要速度與行動的場合`
  };

  // 🔹 模擬雷達分數
  const scores = [7, 8, 6, 9, 7];

  return res.status(200).json({
    text: textTemplates[scene] || "分析結果",
    scores
  });
}
