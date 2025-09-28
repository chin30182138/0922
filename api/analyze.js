export default async function handler(req,res){
  try{
    if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
    if(!process.env.OPENAI_API_KEY) return res.status(500).json({error:"missing_env"});

    const {aBeast,aKin,aBranch,bBeast,bKin,bBranch,context,mode}=req.body??{};

    const systemPrompt=`你是一位占卜心理顧問，專門分析六獸×六親×地支在職場、人際互動的關係。請輸出完整分析（個性、衝突、協調、策略），並附上 JSON（scores+tags）。`;

    const userPrompt=`我方：${aBeast}×${aKin}×${aBranch}
${mode==="dual"?`對方：${bBeast}×${bKin}×${bBranch}`:""}
情境：${context}`;

    const r=await fetch("https://api.openai.com/v1/responses",{
      method:"POST",
      headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},
      body:JSON.stringify({model:"gpt-4o-mini",temperature:0.7,
        input:[{role:"system",content:systemPrompt},{role:"user",content:userPrompt}]})
    });
    const data=await r.json();
    let text=data.output_text||JSON.stringify(data,null,2);
    res.status(200).json({text});
  }catch(e){res.status(500).json({error:"server_error",detail:e.message});}
}
