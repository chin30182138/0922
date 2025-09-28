export default async function handler(req,res){
  try{
    if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
    if(!process.env.OPENAI_API_KEY) return res.status(500).json({error:"missing_env"});

    const {aBeast,aKin,aBranch,bBeast,bKin,bBranch,sexDetail}=req.body??{};

    const systemPrompt=`你是性愛互動專家，根據六獸×六親×地支組合，生成詳細的性愛分析（情愛指數、互動模式、雷點、性愛劇本、體位、玩具、場景等）。請最後輸出 JSON（scores+tags）。scores 包含：fit, comm, pace, account, trust, innov，數值為 0-100。`;

    const userPrompt=`組合：
我方：${aBeast}×${aKin}×${aBranch}
對方：${bBeast}×${bKin}×${bBranch}
性愛細節：${sexDetail||"—"}`;

    // *** 關鍵修正點：API 網址與 Body 格式 ***
    const r=await fetch("https://api.openai.com/v1/chat/completions",{
      method:"POST",
      headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},
      body:JSON.stringify({
        model:"gpt-4o-mini",
        temperature:0.85,
        messages:[ // 正確的對話格式
          {role:"system",content:systemPrompt},
          {role:"user",content:userPrompt}
        ]
      })
    });

    const data=await r.json();
    
    // 取得正確的回應文本
    let text = data.choices?.[0]?.message?.content || JSON.stringify(data,null,2);
    
    res.status(200).json({text});
  }catch(e){res.status(500).json({error:"server_error",detail:e.message});}
}
