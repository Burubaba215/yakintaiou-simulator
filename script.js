const residents = [
  {
    name: "Aさん",
    note: "最終排便が4日前です。本人は腹痛なし。夜勤帯で記録と指示を確認してください。",
    answer: "未排便確認・ピコスルファート服用対応",
    explanation: "未排便が続く場合は、記録・本人状態・看護師や医師の指示を確認し、指示がある場合にピコスルファート服用対応を行います。"
  },
  {
    name: "Bさん",
    note: "本日の水分摂取量が少なめです。夕食後までで650mlです。声かけをお願いします。",
    answer: "水分強化",
    explanation: "水分摂取量が目標より少ないため、無理のない範囲で好みの飲み物やタイミングを工夫して水分強化を行います。"
  },
  {
    name: "Cさん",
    note: "昨夜トイレ歩行時にふらつきがありました。夜間帯は特に見守りをお願いします。",
    answer: "転倒注意・見守り強化",
    explanation: "ふらつきや夜間トイレ頻回がある場合、動線確認・履物確認・コール対応・見守りなどで転倒リスクを下げます。"
  },
  {
    name: "Dさん",
    note: "義歯の違和感があり、夕食は半量でした。明日の申し送りに残してください。",
    answer: "食事観察・義歯確認",
    explanation: "食事量低下の背景に義歯不具合がある可能性があるため、食事観察と義歯状態の確認、継続した申し送りが必要です。"
  },
  {
    name: "Eさん",
    note: "明日ご家族の面会予定があります。本人は楽しみにされています。",
    answer: "家族面会の申し送り",
    explanation: "面会予定は生活リズムや本人の安心につながる情報です。忘れずチームへ共有します。"
  }
];

const options = [
  "選択してください",
  "未排便確認・ピコスルファート服用対応",
  "水分強化",
  "転倒注意・見守り強化",
  "食事観察・義歯確認",
  "家族面会の申し送り"
];

const startPanel = document.getElementById("startPanel");
const handoverPanel = document.getElementById("handoverPanel");
const quizPanel = document.getElementById("quizPanel");
const resultPanel = document.getElementById("resultPanel");
const handoverText = document.getElementById("handoverText");
const quizForm = document.getElementById("quizForm");
const score = document.getElementById("score");
const feedback = document.getElementById("feedback");

function buildHandoverText() {
  return residents.map(r => `${r.name}。${r.note}`).join("\n\n");
}

function buildSpeechText() {
  return buildHandoverText()
    .replaceAll("夜間帯", "夜間たい")
    .replaceAll("夜勤帯", "やきんたい");
}

function shuffleOptions(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getPreferredJapaneseVoice() {
  const voices = speechSynthesis.getVoices();
  const japaneseVoices = voices.filter(voice => voice.lang === "ja-JP" || voice.lang.startsWith("ja"));
  const preferredNames = [
    "Nanami",
    "Haruka",
    "Kyoko",
    "Ayumi",
    "Sayaka",
    "Google 日本語",
    "Japanese"
  ];

  return preferredNames
    .map(name => japaneseVoices.find(voice => voice.name.includes(name)))
    .find(Boolean) || japaneseVoices[0] || null;
}

function show(panel) {
  [startPanel, handoverPanel, quizPanel, resultPanel].forEach(p => p.classList.add("hidden"));
  panel.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function speakHandover() {
  if (!('speechSynthesis' in window)) {
    alert("このブラウザは音声読み上げに対応していません。文章で確認してください。");
    return;
  }
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(buildSpeechText());
  utterance.lang = "ja-JP";
  utterance.rate = 0.92;
  utterance.pitch = 1.05;

  const voice = getPreferredJapaneseVoice();
  if (voice) utterance.voice = voice;

  speechSynthesis.speak(utterance);
}

function buildQuiz() {
  quizForm.innerHTML = "";
  residents.forEach((resident, index) => {
    const card = document.createElement("div");
    card.className = "residentCard";
    const randomizedOptions = [options[0], ...shuffleOptions(options.slice(1))];
    card.innerHTML = `
      <h3>${resident.name}</h3>
      <label for="q${index}">必要な対応</label>
      <select id="q${index}" name="q${index}">
        ${randomizedOptions.map(o => `<option value="${o}">${o}</option>`).join("")}
      </select>
    `;
    quizForm.appendChild(card);
  });
}

function gradeQuiz() {
  let correct = 0;
  feedback.innerHTML = "";

  residents.forEach((resident, index) => {
    const selected = document.getElementById(`q${index}`).value;
    const isCorrect = selected === resident.answer;
    if (isCorrect) correct++;

    const item = document.createElement("div");
    item.className = "feedbackItem";
    item.innerHTML = `
      <p><strong>${resident.name}</strong>：<span class="${isCorrect ? 'correct' : 'wrong'}">${isCorrect ? '正解' : '不正解'}</span></p>
      <p>あなたの選択：${selected}</p>
      <p>正解：${resident.answer}</p>
      <p>${resident.explanation}</p>
    `;
    feedback.appendChild(item);
  });

  score.textContent = `${correct} / ${residents.length} 問正解`;
  show(resultPanel);
}

document.getElementById("startBtn").addEventListener("click", () => {
  handoverText.textContent = buildHandoverText();
  show(handoverPanel);
});
document.getElementById("speakBtn").addEventListener("click", speakHandover);
document.getElementById("stopBtn").addEventListener("click", () => speechSynthesis.cancel());
document.getElementById("quizBtn").addEventListener("click", () => {
  speechSynthesis.cancel();
  buildQuiz();
  show(quizPanel);
});
document.getElementById("submitBtn").addEventListener("click", gradeQuiz);
document.getElementById("retryBtn").addEventListener("click", () => {
  speechSynthesis.cancel();
  show(startPanel);
});
