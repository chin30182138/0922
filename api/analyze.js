export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { mode, kin, beast, branch, userName } = req.body;

  // 🔹 固定格式模板
  let prompt = "";
  if (mode === "career") {
    prompt = `
你是一位金錢卦與六爻占卜師，請依照以下格式輸出「職場篇」分析：
🐉 ${beast}${branch} 上司 VS ${kin} 下屬
雙層角色設定
• 六獸特質：請描述 ${beast} 的職場風格。
• 地支特質：請描述 ${branch} 的行為模式。
互動模式分析
• 上司角色行為、下屬角色行為。
高危衝突點
• 三個衝突點。
雙向應對策略
✅ 上司版：三條建議。
✅ 下屬版：三條建議。
情境對話
經典避坑提醒
    `;
  } else if (mode === "sex") {
    prompt = `
請依照以下格式輸出「性愛篇」分析：
${beast}${branch} X ${kin}
• 情愛指數（滿分10）
• 互動模式
• 雷點分析
• 最佳性愛劇本推薦
• 推薦體位
• 推薦口交技巧
• 推薦情趣內衣
• 推薦玩具
• 推薦性愛場景
    `;
  } else if (mode === "love") {
    prompt = `
請依照以下格式輸出「愛情篇」分析：
${beast}${branch} X ${kin}
• 戀愛氛圍
• 情感互動
• 默契養成
• 長期發展建議
    `;
  } else if (mode === "personality") {
    prompt = `
請描述 ${beast}${kin}${branch} 的完整個性分析：
• 六獸特質
• 六親特質
• 地支特質
• 綜合性格優勢與挑戰
• 人際互動風格
    `;
  }

  // 🔹 模擬 AI 回傳（你之後換成 OpenAI API）
  const mockText = `這裡是 ${mode} 的分析內容，包含 ${beast}${branch} 與 ${kin} 的完整格式化說明。`;
  const mockJson = { 情感: 7, 事業: 8, 健康: 6, 財運: 7, 智慧: 9 };

  res.status(200).json({ text: mockText, scores: mockJson });
}
