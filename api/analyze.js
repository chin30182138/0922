export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { mode, kin, beast, branch, userName, interpreter, qrUrl } = req.body;

  let prompt = "";

  if (mode === "career") {
    prompt = `
請依以下格式輸出「職場篇」分析：
🐉 ${beast}${branch} 上司 VS ${kin} 下屬
雙層角色設定
• 六獸特質
• 地支特質
互動模式分析
高危衝突點
雙向應對策略
情境對話
經典避坑提醒
最後請根據分析，補上一句適合的正向金句。
    `;
  } else if (mode === "sex") {
    prompt = `
請依以下格式輸出「性愛篇」分析：
${beast}${branch} X ${kin}
• 情愛指數
• 互動模式
• 雷點分析
• 劇本推薦
• 體位
• 技巧
• 情趣道具
• 場景
最後請根據分析，補上一句適合的正向金句。
    `;
  } else if (mode === "love") {
    prompt = `
請依以下格式輸出「愛情篇」分析：
${beast}${branch} X ${kin}
• 戀愛氛圍
• 情感互動
• 默契養成
• 長期發展
最後請根據分析，補上一句適合的正向金句。
    `;
  } else if (mode === "personality") {
    prompt = `
請描述 ${beast}${kin}${branch} 的完整個性：
• 六獸特質
• 六親特質
• 地支特質
• 綜合優勢與挑戰
• 人際互動風格
最後請根據分析，補上一句適合的正向金句。
    `;
  }

  // ⚠️ 模擬 AI 回傳（你可替換成 OpenAI API）
  const mockText = `
這裡是 ${mode} 的分析結果，針對 ${beast}${branch} 與 ${kin} 的詳細說明。
**正向金句：** 「信念是你最強大的武器。」
  `;
  const mockJson = { 情感: 8, 事業: 7, 健康: 6, 財運: 9, 智慧: 8 };

  res.status(200).json({
    text: mockText,
    scores: mockJson,
    userName,
    interpreter,
    qrUrl: qrUrl || "https://www.facebook.com/chin168888/"
  });
}
