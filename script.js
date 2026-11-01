// ===== الربط مع قوقل فورم =====
// رابط الاستقبال (نفس رابط الفورم لكن بنهاية formResponse)
const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeeEDA_D7dQJLdykvCBr3TM7KqhH3bFCXlmqYHkLc_4-sLzJg/formResponse";

// ===== الأسئلة =====
// الأسئلة والترتيب مطابقة للفورم. كل سؤال له رقم الحقل (entry) في الفورم.
// خيارات السؤال الأول لازم تطابق خيارات الفورم حرفيًا.
const QUESTIONS = [
  {
    type: "choice",
    entry: "entry.906280798",
    text: "كم مرة طلبت من مقفّى؟",
    options: ["مره واحدة", "مرتين الى ثلاث", "اربع مرات او اكثر"]
  },
  {
    type: "text",
    entry: "entry.711340266",
    text: "لو بتعرّف مقفّى لشخص ما جرّبها، كيف توصفها له؟"
  },
  {
    type: "text",
    entry: "entry.515132946",
    text: "تذكّر آخر مرة طلبت من مقفّى؛ وش اللي خلاك تختارها؟"
  },
  {
    type: "text",
    entry: "entry.425732382",
    text: "كيف تقيّم تجربتك مع مقفّى بشكل عام؟"
  },
  {
    type: "text",
    entry: "entry.1820185532",
    text: "إذا بتختار شيئًا واحدًا نحسّنه في تجربتك مع مقفّى، وش بيكون؟ وإذا عندك موقف يوضّح، شاركنا فيه."
  },
  {
    type: "text",
    entry: "entry.222822701",
    text: "مع تطوّر مقفّى، وش الشيء اللي تتمنى نظل محافظين عليه؟"
  },
  {
    type: "text",
    entry: "entry.655340903",
    text: "وش تتمنى تشوف من مقفّى مستقبلًا؟"
  },
  {
    type: "text",
    entry: "entry.1988512692",
    contact: true,
    rows: 3,
    placeholder: "الاسم، وجوال أو إيميل",
    text: "اسمك ووسيلة تواصل، إذا تحب نتابع معك ملاحظتك — اختياري."
  }
];

const $ = (id) => document.getElementById(id);
const intro = $("intro"), form = $("surveyForm"), thanks = $("thanks");
const bar = $("bar"), stepLabel = $("stepLabel"), qText = $("questionText");
const answer = $("answer"), choices = $("choices");
const backBtn = $("backBtn"), nextBtn = $("nextBtn"), errorMsg = $("errorMsg");

const answers = new Array(QUESTIONS.length).fill("");
let current = 0;

function renderChoices(q) {
  choices.replaceChildren();
  q.options.forEach((opt) => {
    const label = document.createElement("label");
    label.className = "choice";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "choice";
    input.value = opt;
    input.checked = answers[current] === opt;
    const span = document.createElement("span");
    span.textContent = opt;
    label.append(input, span);
    choices.append(label);
  });
}

function show() {
  const q = QUESTIONS[current];
  qText.textContent = q.text;
  stepLabel.textContent = `السؤال ${current + 1} من ${QUESTIONS.length}`;
  bar.style.width = `${((current + 1) / QUESTIONS.length) * 100}%`;
  backBtn.hidden = current === 0;
  nextBtn.textContent = current === QUESTIONS.length - 1 ? "إرسال" : "التالي";
  errorMsg.hidden = true;

  if (q.type === "choice") {
    answer.hidden = true;
    choices.hidden = false;
    renderChoices(q);
    qText.focus({ preventScroll: true });
  } else {
    choices.hidden = true;
    answer.hidden = false;
    answer.rows = q.rows || 6;
    answer.placeholder = q.placeholder || "اكتب إجابتك هنا";
    answer.value = answers[current];
    answer.focus({ preventScroll: true });
  }
}

function save() {
  if (QUESTIONS[current].type === "choice") {
    const picked = choices.querySelector("input:checked");
    answers[current] = picked ? picked.value : "";
  } else {
    answers[current] = answer.value.trim();
  }
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.hidden = false;
}

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
  // لازم إجابة واحدة على الأقل من الأسئلة نفسها (الاسم ووسيلة التواصل ما تكفي)
  const hasAnswer = answers.some((a, i) => a && !QUESTIONS[i].contact);
  if (!hasAnswer) {
    showError("جاوب على سؤال واحد على الأقل قبل الإرسال.");
    return;
  }

  const body = new URLSearchParams();
  answers.forEach((a, i) => { if (a) body.append(QUESTIONS[i].entry, a); });

  nextBtn.disabled = true;
  nextBtn.textContent = "جاري الإرسال...";

  try {
    // قوقل ما يرجّع تأكيد للمتصفح (no-cors)، فالفشل الوحيد اللي نكتشفه هو انقطاع الاتصال
    await fetch(FORM_URL, { method: "POST", mode: "no-cors", body });
    form.hidden = true;
    thanks.hidden = false;
    thanks.scrollIntoView({ behavior: "smooth", block: "start" });
    $("thanksTitle").focus({ preventScroll: true });
  } catch (e) {
    showError("ما قدرنا نرسل إجاباتك. تأكد من الاتصال وجرّب مرة ثانية.");
    nextBtn.disabled = false;
    nextBtn.textContent = "إرسال";
  }
}
