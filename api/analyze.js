let mode = "single";

function setMode(m) {
  mode = m;
  const inputArea = document.getElementById("inputArea");
  inputArea.innerHTML = "";
  if (m === "single") {
    inputArea.innerHTML = singleInput("A");
  } else {
    inputArea.innerHTML = singleInput("A") + "<hr class='my-3'>" + singleInput("B");
  }
}

function singleInput(label) {
  return `
  <div>
    <h3 class="font-bold">${label} 人資料</h3>
    <select id="kin${label}" class="border p-2 rounded">
      <option>父母</option><option>兄弟</option><option>子孫</option><option>妻財</option><option>官鬼</option>
    </select>
    <select id="beast${label}" class="border p-2 rounded ml-2">
      <option>青龍</option><option>朱雀</option><option>勾陳</option><option>螣蛇</option><option>白虎</option><option>玄武</option>
    </select>
    <select id="branch${label}" class="border p-2 rounded ml-2">
      <option>子</option><option>丑</option><option>寅</option><option>卯</option>
      <option>辰</option><option>巳</option><option>午</option><option>未</option>
      <option>申</option><option>酉</option><option>戌</option><option>亥</option>
    </select>
  </div>`;
}

async function startAnalysis(type) {
  document.getElementById("analysisOutput").innerText = "";
  updateProgress(0);

  const payload = { type, mode };
  if (mode === "single") {
    payload.aKin = document.getElementById("kinA").value;
    payload.aBeast = document.getElementById("beastA").value;
    payload.aBranch = document.getElementById("branchA").value;
  } else {
    payload.aKin = document.getElementById("kinA").value;
    payload.aBeast = document.getElementById("beastA").value;
    payload.aBranch = document.getElementById("branchA").value;
    payload.bKin = document.getElementById("kinB").value;
    payload.bBeast = document.getElementById("beastB").value;
    payload.bBranch = document.getElementById("branchB").value;
  }

  let percent = 0;
  const interval = setInterval(() => {
    percent += 10;
    if (percent > 100) { clearInterval(interval); return; }
    updateProgress(percent);
  }, 200);

  const result = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(r => r.json());

  clearInterval(interval);
  updateProgress(100);

  renderRadar(result.radar);
  document.getElementById("analysisOutput").innerHTML =
    result.analysis + "<br><br><b style='font-size:20px;'>" + result.quote + "</b>";
}

function updateProgress(p) {
  document.getElementById("progressBar").style.width = p + "%";
  document.getElementById("progressText").innerText = p + "%";
}

let radarChart;
function renderRadar(data) {
  const ctx = document.getElementById("radarChart").getContext("2d");
  if (radarChart) radarChart.destroy();
  radarChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels: Object.keys(data),
      datasets: [{
        label: "分析分數",
        data: Object.values(data),
        backgroundColor: "rgba(79,70,229,0.3)",
        borderColor: "rgba(79,70,229,1)",
        pointBackgroundColor: "rgba(79,70,229,1)"
      }]
    },
    options: { scales: { r: { suggestedMin: 0, suggestedMax: 100 } } }
  });
}

function saveUserInfo() {
  localStorage.setItem("userName", document.getElementById("userName").value);
  localStorage.setItem("userURL", document.getElementById("userURL").value);
  alert("已儲存，下次會自動載入。");
}
function loadUserInfo() {
  document.getElementById("userName").value = localStorage.getItem("userName") || "阿青師";
  document.getElementById("userURL").value = localStorage.getItem("userURL") || "https://www.facebook.com/chin168888/";
}
