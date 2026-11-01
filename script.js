// ===== الإعدادات =====
// الصق هنا رابط الاستقبال (مثلاً Formspree: https://formspree.io/f/xxxxxxx)
// إذا تركته فاضي، يشتغل الاستبيان بدون إرسال (للتجربة فقط).
const ENDPOINT = "";

const QUESTIONS = [
  "لو بتعرّف مقفّى لشخص ما جرّبها، كيف توصفها له؟",
  "تذكّر آخر مرة طلبت من مقفّى؛ وش اللي خلاك تختارها هالمرة؟",
  "من تجربتك معنا، وش أهم شيء تقدّمه لك مقفّى؟ وتقدر تذكر لي موقف أو تجربة توضّح قصدك؟",
  "هل مرّت عليك تجربة معنا ما كانت على توقعك؟ وش صار، وكيف تعاملت معها؟",
  "إذا بتختار شيئًا واحدًا نحسّنه في تجربتك مع مقفّى، وش بيكون؟ وليش؟",
  "مع تطوّر مقفّى، وش الشيء اللي تتمنى نظل محافظين عليه؟",
  "وش تتمنى تشوف من مقفّى مستقبلًا؟ وهل سبق احتجت منّا شيئًا وما لقيته؟"
];

const $ = (id) => document.getElementById(id);
const intro = $("intro"), form = $("surveyForm"), thanks = $("thanks");
const bar = $("bar"), stepLabel = $("stepLabel"), qText = $("questionText");
const answer = $("answer"), backBtn = $("backBtn"), nextBtn = $("nextBtn");
const errorMsg = $("errorMsg");

const answers = new Array(QUESTIONS.length).fill("");
let current = 0;

function show() {
  qText.textContent = QUESTIONS[current];
  answer.value = answers[current];
  stepLabel.textContent = `السؤال ${current + 1} من ${QUESTIONS.length}`;
  bar.style.width = `${((current + 1) / QUESTIONS.length) * 100}%`;
  backBtn.hidden = current === 0;
  nextBtn.textContent = current === QUESTIONS.length - 1 ? "إرسال" : "التالي";
  errorMsg.hidden = true;
  answer.focus({ preventScroll: true });
}

function save() { answers[current] = answer.value.trim(); }

$("startBtn").addEventListener("click", () => {
  intro.hidden = true;
  form.hidden = false;
  show();
  form.scrollIntoView({ behavior: "smooth", block: "start" });
});

backBtn.addEventListener("click", () => {
  save();
  if (current > 0) { current--; show(); }
});

nextBtn.addEventListener("click", async () => {
  save();
  if (current < QUESTIONS.length - 1) { current++; show(); return; }
  await submit();
});

async function submit() {
  if (!answers.some(Boolean)) {
    errorMsg.textContent = "جاوب على سؤال واحد على الأقل قبل الإرسال.";
    errorMsg.hidden = false;
    return;
  }

  const payload = { الوقت: new Date().toISOString() };
  QUESTIONS.forEach((q, i) => { payload[`س${i + 1}: ${q}`] = answers[i] || "(تم التخطي)"; });

  nextBtn.disabled = true;
  nextBtn.textContent = "جاري الإرسال...";

  try {
    if (ENDPOINT) {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("bad response");
    } else {
      console.log("وضع التجربة: ما فيه رابط إرسال.", payload);
    }
    form.hidden = true;
    thanks.hidden = false;
    thanks.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (e) {
    errorMsg.textContent = "ما قدرنا نرسل إجاباتك. تأكد من الاتصال وجرّب مرة ثانية.";
    errorMsg.hidden = false;
    nextBtn.disabled = false;
    nextBtn.textContent = "إرسال";
  }
}
