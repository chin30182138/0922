
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { mode, aBeast, aKin, aBranch, bBeast, bKin, bBranch, context } = req.body;

  // 基本分析文字（你可以再加上卦理內容）
  let analysisText = `🔮 ${context} 分析：${aBeast}(${aKin}, ${aBranch})`;
  if (mode === "dual") {
    analysisText += ` 與 ${bBeast}(${bKin}, ${bBranch}) 的互動。`;
  }

  let healthTips = "";

  // 健康情境 → 湯藥建議
  if (context === "健康") {
    if (["子", "亥"].includes(aBranch)) {
      healthTips = "💡 健康湯藥建議：腎水偏弱，可考慮安迪湯、六味地黃丸、右歸飲、知柏地黃丸。";
    } else if (["寅", "卯"].includes(aBranch)) {
      healthTips = "💡 健康湯藥建議：肝木不足，可用逍遙散、加味逍遙散、四神湯、柴胡疏肝散。";
    } else if (["巳", "午"].includes(aBranch)) {
      healthTips = "💡 健康湯藥建議：心火過旺，可用酸棗仁湯、清心蓮子飲、天王補心丹、朱砂安神丸。";
    } else if (["申", "酉"].includes(aBranch)) {
      healthTips = "💡 健康湯藥建議：肺金偏弱，可用桑菊飲、銀翹散、百合固金湯、麥門冬湯。";
    } else if (["丑","辰","未","戌"].includes(aBranch)) {
      healthTips = "💡 健康湯藥建議：脾土不足，可用補中益氣湯、香砂六君子湯、四君子湯、參苓白朮散。";
    }
  }

  // 雙人模式 → 模擬互動分數
  let scores = null;
  if (mode === "dual") {
    scores = {
      fit: Math.floor(Math.random() * 10) + 1,
      comm: Math.floor(Math.random() * 10) + 1,
      pace: Math.floor(Math.random() * 10) + 1,
      account: Math.floor(Math.random() * 10) + 1,
      trust: Math.floor(Math.random() * 10) + 1,
      innov: Math.floor(Math.random() * 10) + 1,
    };
  }

  return res.status(200).json({
    text: analysisText,
    healthTips,
    scores
  });
}
