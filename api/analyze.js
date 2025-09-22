// ==========================
// 強化版 analyze.js
// ==========================
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { mode, aBeast, aKin, aBranch, bBeast, bKin, bBranch, context } = req.body ?? {};

    // ===== 特徵庫 =====
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

    function getPersonality(beast, kin, branch) {
      return `${beast}：${beastTraits[beast] ?? ""}\n${kin}：${kinTraits[kin] ?? ""}\n${branch}：${branchTraits[branch] ?? ""}`;
    }

    // ===== 分析模板 =====
    let output = "";

    if (context === "職場") {
      output = `
🐉 ${aBeast}${aBranch}${aKin} ${mode==="dual" ? `VS ${bBeast}${bBranch}${bKin}` : ""}

雙層角色設定
• ${aBeast}特質：${beastTraits[aBeast]}
• ${aBranch}特質：${branchTraits[aBranch]}

${mode==="dual" ? `• ${bBeast}特質：${beastTraits[bBeast]}\n• ${bBranch}特質：${branchTraits[bBranch]}` : ""}

互動模式分析
• 上司${aBeast}${aBranch}：偏向 ${kinTraits[aKin]}
${mode==="dual" ? `• 下屬${bBeast}${bBranch}：偏向 ${kinTraits[bKin]}` : ""}

高危衝突點
• **誰的戰術優先？** ${aBeast}常想直接推進，但${mode==="dual" ? bBeast : "對手"}更重佈局。
• 功勞歸屬戰：${mode==="dual" ? bBeast : "對手"}容易強調個人貢獻。
• 未來發展猜忌：${aBeast}怕被取代，${mode==="dual" ? bBeast : "下屬"}怕被卡位。

雙向應對策略
✅ 上司版
1. 設「戰術聯席會議」，給下屬空間，但拍板權在上司。
2. 建立「功勞分層表」，避免搶功。
3. 提前談升遷，降低下屬焦慮。

✅ 下屬版
1. 策略建議先掛名上司，保全面子。
2. 公開表揚上司慧眼，爭取雙贏。
3. 定期回報未來打算，減少疑慮。

情境對話
${aBeast}上司：「你又改流程了？」  
${mode==="dual" ? bBeast : "下屬"}：「這是依照您的戰略思路優化的。」  
${aBeast}上司：「下次要先報，不然很難信你。」  
（OS：這傢伙腦子好，但心機深）

經典避坑提醒
• ${aBeast}最討厭被架空，${mode==="dual" ? bBeast : "對手"}最愛偷偷加戲。
• 野心擋不住，但方向可引導。
• 一旦覺得前途被鎖死，翻臉在即。
      `;
    }

    else if (context === "性愛") {
      output = `
🔥 ${aBeast}${aBranch}${aKin} ${mode==="dual" ? `X ${bBeast}${bBranch}${bKin}` : ""}

情愛指數：${(Math.random()*2+8).toFixed(1)}/10  
互動模式：${aBeast}帶有 ${beastTraits[aBeast]}，${mode==="dual" ? bBeast+"則 "+beastTraits[bBeast] : "伴侶則需要配合"}。

雷點分析
• 雙方都愛主導，可能變成權力遊戲。

最佳性愛劇本推薦
• 權力挑戰：誰能掌控節奏？  
• 調情遊戲：利用前戲誘惑，增加樂趣。

推薦體位
• ${["交錯後入","翻轉騎乘","側身交纏"][Math.floor(Math.random()*3)]}  
• ${["女上位","反向騎乘","站立擁抱"][Math.floor(Math.random()*3)]}

推薦情趣元素
• 服裝：${["黑色鏤空蕾絲馬甲","絲質高衩旗袍"][Math.floor(Math.random()*2)]}  
• 玩具：${["震動指環","語音控制震動器"][Math.floor(Math.random()*2)]}  
• 場景：${["私人遊戲室","隱密酒吧VIP區"][Math.floor(Math.random()*2)]}
      `;
    }

    else if (context === "愛情") {
      output = `
💖 愛情分析
角色特質：
${getPersonality(aBeast, aKin, aBranch)}
${mode==="dual" ? `➤ 對象特質：\n${getPersonality(bBeast, bKin, bBranch)}` : ""}

情感互動
• 情愛指數：${(Math.random()*3+6).toFixed(1)}/10  
• 默契指數：${(Math.random()*3+6).toFixed(1)}/10

📌 建議：多點耐心與真誠溝通。
      `;
    }

    else if (context === "個性") {
      output = `
🧩 個性分析
${getPersonality(aBeast, aKin, aBranch)}

🔑 優點：堅毅、創新、感性  
❗ 缺點：固執、情緒化  
📌 建議：在適合的領域發揮長處，避免過度消耗能量。
      `;
    }

    // ===== 雷達圖數據 =====
    const radarData = {
      "情感": Math.floor(Math.random()*10)+1,
      "事業": Math.floor(Math.random()*10)+1,
      "健康": Math.floor(Math.random()*10)+1,
      "財運": Math.floor(Math.random()*10)+1,
      "智慧": Math.floor(Math.random()*10)+1
    };

    res.status(200).json({
      text: output,
      radar: radarData,
      meta: {
        mode,
        aBeast, aKin, aBranch,
        bBeast, bKin, bBranch,
        context,
        timestamp: new Date().toISOString()
      }
    });

  } catch (err) {
    res.status(500).json({ error: "Server error", detail: err.message });
  }
}
