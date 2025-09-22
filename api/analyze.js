export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { mode, kin, beast, branch, userName, interpreter, qrUrl } = req.body;

  let prompt = "";

  if (mode === "career") {
    prompt = `
🐉 ${beast}${branch} 上司 VS ${kin} 下屬
雙層角色設定、互動模式、高危衝突點、應對策略、情境對話、避坑提醒。
最後請加一句正向金句。`;
  } else if (mode === "sex") {
    prompt = `
${beast}${branch} X ${kin} 的性愛分析：
情愛指數、互動模式、雷點、劇本、體位、技巧、道具、場景。
最後請加一句正向金句。`;
  } else if (mode === "love") {
    prompt = `
${beast}${branch} X ${kin} 的愛情分析：
戀愛氛圍、情感互動、默契養成、長期發展。
最後請加一句正向金句。`;
  } else {
    prompt = `
${beast}${kin}${branch} 的個性分析：
六獸特質、六親特質、地支特質、綜合優勢、挑戰、人際互動。
最後請加一句正向金句。`;
  }

  // ⚠️ 模擬回傳，請換成 OpenAI API
  const mockText = `
這是 ${mode} 的完整分析內容，針對 ${beast}${branch} 與 ${kin}。
**正向金句：**「堅定前行，你的智慧就是最強的指南針。」`;

  const mockJson = { 情感: 8, 事業: 7, 健康: 6, 財運: 9, 智慧: 8 };

  res.status(200).json({
    text: mockText,
    scores: mockJson,
    userName,
    interpreter,
    qrUrl
  });
}
