const STORAGE_KEY = "mayuan_practice_state_v2";
const LEGACY_STORAGE_KEY = "mayuan_practice_state_v1";
const BACKUP_VERSION = 1;
const QUESTION_BANK_VERSION = "2026-05-28-release";
const MULTI_SUBJECT_RECORD_VERSION = 2;
const SET_SIZE = 20;
const DEFAULT_SUBJECT = "mayuan";
const SUBJECTS = {
  mayuan: {
    label: "马原",
    getQuestions: () => window.QUESTIONS || [],
    bankVersion: QUESTION_BANK_VERSION,
    setModeText: (set) => `马原 · 正在练习第 ${set} 套。红色必背会反复换问法出现。`,
    randomText: (count) => `马原 · 随机练习会从 ${count} 题中抽取 20 题，适合每天快速热身。`,
    wrongText: "马原 · 错题重刷按错误次数优先，适合考前集中补短板。"
  },
  junli: {
    label: "军理",
    getQuestions: () => window.MILITARY_QUESTIONS || [],
    bankVersion: "junli-2026-06-13",
    setModeText: (set) => `军理 · 正在练习第 ${set} 套。题目来自军事理论题库。`,
    randomText: (count) => `军理 · 随机练习会从 ${count} 题中抽取 20 题，适合考前快速过题。`,
    wrongText: "军理 · 错题重刷只使用军理错题本，不会混入马原。"
  }
};
const SUBJECT_KEYS = Object.keys(SUBJECTS);
const CONFIG = window.MAYUAN_SUPABASE || {};
const STUDENT_EMAIL_DOMAIN = CONFIG.studentEmailDomain || "mayuan.local";
const supabaseClient = CONFIG.url && CONFIG.anonKey && window.supabase
  ? window.supabase.createClient(CONFIG.url, CONFIG.anonKey)
  : null;

const state = {
  mode: "set",
  set: 1,
  index: 0,
  sessionQuestions: [],
  answered: false,
  selectedAnswer: "",
  subject: DEFAULT_SUBJECT,
  appRecords: emptyAppRecords(),
  records: emptyRecords(),
  localRecords: null,
  profile: null,
  session: null,
  syncTimer: null,
  lastSyncedAt: null
};

const els = {
  authView: document.querySelector("#authView"),
  appView: document.querySelector("#appView"),
  loginForm: document.querySelector("#loginForm"),
  studentIdInput: document.querySelector("#studentIdInput"),
  passwordInput: document.querySelector("#passwordInput"),
  authStatus: document.querySelector("#authStatus"),
  accountLabel: document.querySelector("#accountLabel"),
  adminBtn: document.querySelector("#adminBtn"),
  changePasswordBtn: document.querySelector("#changePasswordBtn"),
  logoutBtn: document.querySelector("#logoutBtn"),
  modeText: document.querySelector("#modeText"),
  resetBtn: document.querySelector("#resetBtn"),
  backupStatus: document.querySelector("#backupStatus"),
  sealLocalBtn: document.querySelector("#sealLocalBtn"),
  importLocalBtn: document.querySelector("#importLocalBtn"),
  exportBackupBtn: document.querySelector("#exportBackupBtn"),
  importBackupBtn: document.querySelector("#importBackupBtn"),
  importBackupInput: document.querySelector("#importBackupInput"),
  subjectSwitch: document.querySelector("#subjectSwitch"),
  setSelect: document.querySelector("#setSelect"),
  setModeBtn: document.querySelector("#setModeBtn"),
  randomModeBtn: document.querySelector("#randomModeBtn"),
  wrongModeBtn: document.querySelector("#wrongModeBtn"),
  accuracyMetric: document.querySelector("#accuracyMetric"),
  redMetric: document.querySelector("#redMetric"),
  wrongMetric: document.querySelector("#wrongMetric"),
  weakMetric: document.querySelector("#weakMetric"),
  priorityBadge: document.querySelector("#priorityBadge"),
  chapterLabel: document.querySelector("#chapterLabel"),
  progressLabel: document.querySelector("#progressLabel"),
  questionTitle: document.querySelector("#questionTitle"),
  questionPrompt: document.querySelector("#questionPrompt"),
  answerForm: document.querySelector("#answerForm"),
  submitBtn: document.querySelector("#submitBtn"),
  nextBtn: document.querySelector("#nextBtn"),
  masteredBtn: document.querySelector("#masteredBtn"),
  editAnswerBtn: document.querySelector("#editAnswerBtn"),
  feedback: document.querySelector("#feedback"),
  wrongFilter: document.querySelector("#wrongFilter"),
  wrongList: document.querySelector("#wrongList"),
  chapterWeakness: document.querySelector("#chapterWeakness"),
  answerDialog: document.querySelector("#answerDialog"),
  answerEditForm: document.querySelector("#answerEditForm"),
  answerEditHint: document.querySelector("#answerEditHint"),
  answerEditFields: document.querySelector("#answerEditFields"),
  resetAnswerEditBtn: document.querySelector("#resetAnswerEditBtn"),
  saveAnswerEditBtn: document.querySelector("#saveAnswerEditBtn"),
  passwordDialog: document.querySelector("#passwordDialog"),
  passwordForm: document.querySelector("#passwordForm"),
  newPasswordInput: document.querySelector("#newPasswordInput"),
  passwordStatus: document.querySelector("#passwordStatus"),
  savePasswordBtn: document.querySelector("#savePasswordBtn"),
  adminDialog: document.querySelector("#adminDialog"),
  adminStudentId: document.querySelector("#adminStudentId"),
  adminDisplayName: document.querySelector("#adminDisplayName"),
  adminPassword: document.querySelector("#adminPassword"),
  refreshUsersBtn: document.querySelector("#refreshUsersBtn"),
  createUserBtn: document.querySelector("#createUserBtn"),
  adminStatus: document.querySelector("#adminStatus"),
  adminUsers: document.querySelector("#adminUsers")
};

function emptyRecords() {
  return {
    attempts: [],
    wrongBook: {},
    answerOverrides: {},
    backupMeta: {
      backupVersion: BACKUP_VERSION,
      questionBankVersion: QUESTION_BANK_VERSION,
      updatedAt: null
    }
  };
}

function emptyAppRecords() {
  return {
    app: "supreme-practice",
    recordVersion: MULTI_SUBJECT_RECORD_VERSION,
    activeSubject: DEFAULT_SUBJECT,
    subjects: SUBJECT_KEYS.reduce((records, subject) => {
      records[subject] = emptyRecords();
      return records;
    }, {}),
    backupMeta: {
      backupVersion: BACKUP_VERSION,
      questionBankVersion: "multi-subject",
      updatedAt: null
    }
  };
}

function normalizeRecords(parsed) {
  const base = emptyRecords();
  if (!parsed || typeof parsed !== "object") return base;

  return {
    attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
    wrongBook: parsed.wrongBook && typeof parsed.wrongBook === "object" ? parsed.wrongBook : {},
    answerOverrides: parsed.answerOverrides && typeof parsed.answerOverrides === "object" ? parsed.answerOverrides : {},
    backupMeta: {
      ...base.backupMeta,
      ...(parsed.backupMeta && typeof parsed.backupMeta === "object" ? parsed.backupMeta : {})
    }
  };
}

function normalizeAppRecords(parsed) {
  const base = emptyAppRecords();
  if (!parsed || typeof parsed !== "object") return base;

  if (parsed.subjects && typeof parsed.subjects === "object") {
    for (const subject of SUBJECT_KEYS) {
      base.subjects[subject] = normalizeRecords(parsed.subjects[subject]);
    }
    base.activeSubject = SUBJECTS[parsed.activeSubject] ? parsed.activeSubject : DEFAULT_SUBJECT;
    base.backupMeta = {
      ...base.backupMeta,
      ...(parsed.backupMeta && typeof parsed.backupMeta === "object" ? parsed.backupMeta : {})
    };
    return base;
  }

  base.subjects.mayuan = normalizeRecords(parsed);
  base.activeSubject = DEFAULT_SUBJECT;
  return base;
}

function getCurrentSubject() {
  return SUBJECTS[state.subject] ? SUBJECTS[state.subject] : SUBJECTS[DEFAULT_SUBJECT];
}

function getCurrentQuestions() {
  return getCurrentSubject().getQuestions();
}

function syncCurrentRecordsReference() {
  if (!state.appRecords?.subjects) state.appRecords = emptyAppRecords();
  if (!state.appRecords.subjects[state.subject]) state.appRecords.subjects[state.subject] = emptyRecords();
  state.records = state.appRecords.subjects[state.subject];
}

function switchSubject(subject, persistChoice = true) {
  if (!SUBJECTS[subject] || subject === state.subject) return;
  state.subject = subject;
  state.appRecords.activeSubject = subject;
  syncCurrentRecordsReference();
  state.set = 1;
  state.index = 0;
  state.sessionQuestions = [];
  state.answered = false;
  updateSubjectButtons();
  setupSetSelect();
  startSet(state.set);
  if (persistChoice) void persistRecords(`${getCurrentSubject().label}记录已同步。`);
}

function updateSubjectButtons() {
  els.subjectSwitch?.querySelectorAll("[data-subject]").forEach((button) => {
    button.classList.toggle("active", button.dataset.subject === state.subject);
  });
}

function loadRecords() {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) return normalizeRecords(JSON.parse(current));

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) return normalizeRecords(JSON.parse(legacy));
  } catch {
    return emptyRecords();
  }
  return emptyRecords();
}

function hasMeaningfulRecords(records) {
  return Boolean(
    records &&
    (
      records.attempts?.length ||
      Object.keys(records.wrongBook || {}).length ||
      Object.keys(records.answerOverrides || {}).length
    )
  );
}

function stampRecords() {
  syncCurrentRecordsReference();
  state.records.backupMeta = {
    backupVersion: BACKUP_VERSION,
    questionBankVersion: getCurrentSubject().bankVersion,
    updatedAt: new Date().toISOString()
  };
  state.appRecords.app = "supreme-practice";
  state.appRecords.recordVersion = MULTI_SUBJECT_RECORD_VERSION;
  state.appRecords.activeSubject = state.subject;
  state.appRecords.backupMeta = {
    backupVersion: BACKUP_VERSION,
    questionBankVersion: "multi-subject",
    updatedAt: new Date().toISOString()
  };
}

function studentIdToEmail(studentId) {
  const clean = String(studentId || "").trim();
  if (!/^[A-Za-z0-9._-]+$/.test(clean)) {
    throw new Error("学号只能包含字母、数字、点、横线或下划线。");
  }
  return `${clean}@${STUDENT_EMAIL_DOMAIN}`;
}

function setStatus(element, message, type = "") {
  if (!element) return;
  element.textContent = message;
  element.classList.toggle("error", type === "error");
  element.classList.toggle("ok", type === "ok");
}

async function persistRecords(statusText = "云端记录已同步。") {
  stampRecords();

  if (!supabaseClient || !state.session?.user) {
    setBackupStatus("Supabase 未配置，无法同步云端记录。");
    return;
  }

  try {
    const { error } = await supabaseClient
      .from("practice_records")
      .upsert({
        user_id: state.session.user.id,
        records: state.appRecords,
        question_bank_version: "multi-subject",
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });
    if (error) throw error;
    state.lastSyncedAt = new Date();
    setBackupStatus(statusText);
  } catch (error) {
    setBackupStatus(`云端同步失败：${error.message || "请稍后重试"}`);
  }
}

function normalizeAnswer(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[，。；;、,.!！?？:："'“”‘’（）()]/g, "");
}

function normalizeChoiceAnswer(value) {
  return [...new Set(String(value || "").toUpperCase().replace(/[^A-E]/g, "").split(""))].sort().join("");
}

function getQuestionById(id) {
  return getCurrentQuestions().find((question) => question.id === id);
}

function currentQuestion() {
  return state.sessionQuestions[state.index];
}

function getAnswerSpec(question) {
  const override = state.records.answerOverrides[question.id];
  if (!override) {
    return {
      answer: question.answer,
      keywords: question.keywords || [],
      edited: false
    };
  }

  return {
    answer: override.answer,
    keywords: Array.isArray(override.keywords) ? override.keywords : question.keywords || [],
    edited: true,
    updatedAt: override.updatedAt
  };
}

function formatAnswer(question) {
  const spec = getAnswerSpec(question);
  if (question.type === "single_choice" || question.type === "multiple_choice") {
    return normalizeChoiceAnswer(spec.answer).split("").map((letter) => {
      const index = letter.charCodeAt(0) - 65;
      return `${letter}. ${question.options[index] || "未知选项"}`;
    }).join("；");
  }
  if (question.type === "fill_blank" && spec.keywords.length) {
    return `${spec.answer}（关键词：${spec.keywords.join("、")}）`;
  }
  return spec.answer;
}

function setupSetSelect() {
  const questions = getCurrentQuestions();
  const totalSets = Math.max(1, ...questions.map((question) => question.set));
  els.setSelect.innerHTML = Array.from({ length: totalSets }, (_, index) => {
    const setNumber = index + 1;
    return `<option value="${setNumber}">第 ${setNumber} 套</option>`;
  }).join("");
  if (state.set > totalSets) state.set = 1;
  els.setSelect.value = String(state.set);
}

function startSet(setNumber) {
  state.mode = "set";
  state.set = Number(setNumber);
  state.index = 0;
  state.sessionQuestions = getCurrentQuestions().filter((question) => question.set === state.set);
  state.answered = false;
  updateModeButtons();
  render();
}

function startRandom() {
  state.mode = "random";
  state.index = 0;
  state.sessionQuestions = seededPick(getCurrentQuestions(), SET_SIZE, Date.now());
  state.answered = false;
  updateModeButtons();
  render();
}

function startWrongPractice() {
  const wrongIds = Object.values(state.records.wrongBook)
    .sort((left, right) => right.wrongCount - left.wrongCount)
    .map((item) => item.questionId);
  state.mode = "wrong";
  state.index = 0;
  state.sessionQuestions = wrongIds.map(getQuestionById).filter(Boolean);
  state.answered = false;
  updateModeButtons();
  render();
}

function seededPick(list, count, seed) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const swap = (seed + i * 13 + copy[i].id.length) % (i + 1);
    [copy[i], copy[swap]] = [copy[swap], copy[i]];
  }
  return copy.slice(0, count);
}

function updateModeButtons() {
  els.setModeBtn.classList.toggle("active", state.mode === "set");
  els.randomModeBtn.classList.toggle("active", state.mode === "random");
  els.wrongModeBtn.classList.toggle("active", state.mode === "wrong");
  els.modeText.textContent = state.mode === "set"
    ? getCurrentSubject().setModeText(state.set)
    : state.mode === "random"
      ? getCurrentSubject().randomText(getCurrentQuestions().length)
      : getCurrentSubject().wrongText;
}

function render() {
  renderQuestion();
  renderStats();
  renderWrongBook();
}

function renderQuestion() {
  const question = currentQuestion();
  els.feedback.hidden = true;
  els.feedback.className = "feedback";
  els.submitBtn.disabled = false;
  els.nextBtn.disabled = true;
  els.masteredBtn.hidden = true;
  els.editAnswerBtn.disabled = !question;
  state.answered = false;
  state.selectedAnswer = "";

  if (!question) {
    els.priorityBadge.textContent = "DONE";
    els.priorityBadge.className = "badge black";
    els.chapterLabel.textContent = "";
    els.progressLabel.textContent = "0/0";
    els.questionTitle.textContent = state.mode === "wrong" ? "错题本暂时是空的" : "本轮练习已完成";
    els.questionPrompt.textContent = state.mode === "wrong"
      ? "继续刷套题或随机练习，答错的题会自动进入这里。"
      : "可以换一套继续刷，或者进入错题重刷。";
    els.answerForm.innerHTML = "";
    els.submitBtn.disabled = true;
    return;
  }

  const spec = getAnswerSpec(question);
  els.priorityBadge.textContent = priorityText(question.priority);
  els.priorityBadge.className = `badge ${question.priority}`;
  els.chapterLabel.textContent = spec.edited ? `${question.chapter} · 已手动修正答案` : question.chapter;
  els.progressLabel.textContent = `${state.index + 1}/${state.sessionQuestions.length}`;
  els.questionTitle.textContent = `${question.title} · ${typeText(question.type)}`;
  els.questionPrompt.textContent = question.prompt;
  els.answerForm.innerHTML = question.type === "fill_blank" ? renderFillInput() : renderOptions(question);
}

function renderOptions(question) {
  return question.options.map((option, index) => {
    const value = question.type === "single_choice" ? String.fromCharCode(65 + index) : option;
    const multiValue = question.type === "multiple_choice" ? String.fromCharCode(65 + index) : value;
    const label = (question.type === "single_choice" || question.type === "multiple_choice") ? `${multiValue}. ${option}` : option;
    const inputType = question.type === "multiple_choice" ? "checkbox" : "radio";
    return `
      <label class="option">
        <input type="${inputType}" name="answer" value="${escapeHtml(multiValue)}">
        <span>${escapeHtml(label)}</span>
      </label>
    `;
  }).join("");
}

function renderFillInput() {
  return '<input class="fill-input" name="answer" type="text" autocomplete="off" placeholder="输入关键词即可，标点不影响判定">';
}

function priorityText(priority) {
  return ({ red: "红必背", blue: "蓝常考", black: "黑补充" })[priority] || priority;
}

function typeText(type) {
  return ({ single_choice: "单选", multiple_choice: "多选", true_false: "判断", fill_blank: "填空" })[type] || type;
}

function submitAnswer() {
  const question = currentQuestion();
  if (!question || state.answered) return;

  const formData = new FormData(els.answerForm);
  const answer = question.type === "multiple_choice"
    ? formData.getAll("answer").sort().join("")
    : question.type === "fill_blank"
    ? String(formData.get("answer") || "").trim()
    : String(formData.get("answer") || "");

  if (!answer) {
    showFeedback(false, "先写一个答案再提交。", question);
    return;
  }

  const correct = isCorrect(question, answer);
  state.selectedAnswer = answer;
  state.answered = true;
  recordAttempt(question, answer, correct);
  showFeedback(correct, correct ? "答对了" : "答错了", question);
  els.submitBtn.disabled = true;
  els.nextBtn.disabled = false;
  els.masteredBtn.hidden = !state.records.wrongBook[question.id];
  void persistRecords();
  renderStats();
  renderWrongBook();
}

function isCorrect(question, answer) {
  const spec = getAnswerSpec(question);
  if (question.type === "fill_blank") {
    const normalized = normalizeAnswer(answer);
    return spec.keywords.every((keyword) => normalized.includes(normalizeAnswer(keyword)));
  }
  if (question.type === "multiple_choice") {
    return normalizeChoiceAnswer(answer) === normalizeChoiceAnswer(spec.answer);
  }
  return String(answer) === String(spec.answer);
}

function recordAttempt(question, answer, correct) {
  state.records.attempts.push({
    questionId: question.id,
    knowledgeId: question.knowledgeId,
    chapter: question.chapter,
    priority: question.priority,
    type: question.type,
    answer,
    correct,
    time: new Date().toISOString()
  });

  if (correct) {
    const wrong = state.records.wrongBook[question.id];
    if (wrong) wrong.correctAfterWrong = (wrong.correctAfterWrong || 0) + 1;
    return;
  }

  upsertWrongBookItem(question);
}

function upsertWrongBookItem(question) {
  const old = state.records.wrongBook[question.id];
  state.records.wrongBook[question.id] = {
    questionId: question.id,
    knowledgeId: question.knowledgeId,
    title: question.title,
    prompt: question.prompt,
    chapter: question.chapter,
    priority: question.priority,
    type: question.type,
    wrongCount: old ? old.wrongCount + 1 : 1,
    correctAfterWrong: old?.correctAfterWrong || 0,
    lastWrong: new Date().toISOString()
  };
}

function rebuildWrongBookFromAttempts() {
  const rebuilt = {};
  for (const attempt of state.records.attempts) {
    const question = getQuestionById(attempt.questionId);
    if (!question || attempt.correct) continue;
    const old = rebuilt[question.id];
    rebuilt[question.id] = {
      questionId: question.id,
      knowledgeId: question.knowledgeId,
      title: question.title,
      prompt: question.prompt,
      chapter: question.chapter,
      priority: question.priority,
      type: question.type,
      wrongCount: old ? old.wrongCount + 1 : 1,
      correctAfterWrong: old?.correctAfterWrong || 0,
      lastWrong: attempt.time || new Date().toISOString()
    };
  }
  state.records.wrongBook = rebuilt;
}

function showFeedback(correct, label, question) {
  const spec = getAnswerSpec(question);
  els.feedback.hidden = false;
  els.feedback.className = `feedback ${correct ? "correct" : "wrong"}`;
  els.feedback.innerHTML = `
    <strong>${escapeHtml(label)}${spec.edited ? "（使用手动修正答案）" : ""}</strong>
    <div>标准答案：${escapeHtml(formatAnswer(question))}</div>
    <div>解析：${escapeHtml(question.explanation)}</div>
    <div>来源：${escapeHtml(question.sourcePoint)}</div>
  `;
}

function nextQuestion() {
  if (state.index < state.sessionQuestions.length - 1) {
    state.index += 1;
    renderQuestion();
  } else {
    state.index += 1;
    render();
  }
}

function markMastered() {
  const question = currentQuestion();
  if (!question) return;
  delete state.records.wrongBook[question.id];
  void persistRecords();
  if (state.mode === "wrong") {
    state.sessionQuestions = state.sessionQuestions.filter((item) => item.id !== question.id);
    if (state.index >= state.sessionQuestions.length) state.index = Math.max(0, state.sessionQuestions.length - 1);
  }
  render();
}

function renderStats() {
  const attempts = state.records.attempts;
  const total = attempts.length;
  const correct = attempts.filter((item) => item.correct).length;
  els.accuracyMetric.textContent = total ? `${Math.round((correct / total) * 100)}%` : "0%";

  const redAttempts = attempts.filter((item) => item.priority === "red");
  const redCorrect = redAttempts.filter((item) => item.correct).length;
  els.redMetric.textContent = redAttempts.length ? `${Math.round((redCorrect / redAttempts.length) * 100)}%` : "0%";

  const wrongItems = Object.values(state.records.wrongBook);
  els.wrongMetric.textContent = String(wrongItems.length);

  const knowledgeRows = countHistoricalMistakes("knowledgeId");
  const topKnowledge = knowledgeRows[0];
  els.weakMetric.textContent = topKnowledge ? `${knowledgeTitle(topKnowledge[0])} ${topKnowledge[1]}次` : "暂无";

  const chapterRows = countHistoricalMistakes("chapter").slice(0, 5);
  const knowledgeWeakRows = knowledgeRows.slice(0, 5);
  const chapterHtml = chapterRows.length
    ? chapterRows.map(([chapter, count]) => `<div class="weak-item">${escapeHtml(chapter)}：${count} 次历史错误</div>`).join("")
    : '<p class="empty">还没有薄弱章节记录。</p>';
  const knowledgeHtml = knowledgeWeakRows.length
    ? knowledgeWeakRows.map(([knowledgeId, count]) => `<div class="weak-item">${escapeHtml(knowledgeTitle(knowledgeId))}：${count} 次历史错误</div>`).join("")
    : "";
  els.chapterWeakness.innerHTML = `${chapterHtml}${knowledgeHtml}`;
}

function countHistoricalMistakes(key) {
  const counts = new Map();
  state.records.attempts.filter((item) => !item.correct).forEach((item) => {
    const value = item[key] || "未分类";
    counts.set(value, (counts.get(value) || 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function knowledgeTitle(knowledgeId) {
  const point = (window.KNOWLEDGE_POINTS || []).find((item) => item.id === knowledgeId);
  if (point) return point.title;
  const question = getCurrentQuestions().find((item) => item.knowledgeId === knowledgeId);
  return question ? question.chapter : knowledgeId;
}

function renderWrongBook() {
  const filter = els.wrongFilter.value;
  const items = Object.values(state.records.wrongBook)
    .filter((item) => filter === "all" || item.priority === filter)
    .sort((left, right) => right.wrongCount - left.wrongCount || right.lastWrong.localeCompare(left.lastWrong));

  els.wrongList.innerHTML = items.length ? items.map((item) => `
    <div class="wrong-item">
      <strong>${escapeHtml(item.title)}</strong>
      <div class="wrong-meta">${priorityText(item.priority)} · ${typeText(item.type)} · 错 ${item.wrongCount} 次</div>
      <div class="wrong-meta">${escapeHtml(item.chapter)}</div>
      <button type="button" data-review="${escapeHtml(item.questionId)}">刷这题</button>
    </div>
  `).join("") : '<p class="empty">暂时没有错题。答错后会自动归纳到这里。</p>';
}

function jumpToWrongQuestion(questionId) {
  const question = getQuestionById(questionId);
  if (!question) return;
  state.mode = "wrong";
  state.sessionQuestions = [question];
  state.index = 0;
  updateModeButtons();
  render();
}

function clearRecords() {
  if (!confirm(`确定清空${getCurrentSubject().label}的所有练习记录、错题本和手动改答案吗？`)) return;
  state.appRecords.subjects[state.subject] = emptyRecords();
  syncCurrentRecordsReference();
  void persistRecords(`已清空${getCurrentSubject().label}记录。`);
  render();
}

function openAnswerEditor() {
  const question = currentQuestion();
  if (!question) return;
  const spec = getAnswerSpec(question);
  els.answerEditHint.textContent = `当前题目：${question.title}。修改只保存在你的个人数据里，不会改原始题库文件。`;
  els.answerEditFields.innerHTML = buildAnswerEditorFields(question, spec);
  els.answerDialog.showModal();
}

function buildAnswerEditorFields(question, spec) {
  if (question.type === "single_choice") {
    const options = question.options.map((option, index) => {
      const value = String.fromCharCode(65 + index);
      return `<option value="${value}" ${spec.answer === value ? "selected" : ""}>${value}. ${escapeHtml(option)}</option>`;
    }).join("");
    return `<label>正确选项<select name="answer">${options}</select></label>`;
  }

  if (question.type === "multiple_choice") {
    const selected = normalizeChoiceAnswer(spec.answer);
    return question.options.map((option, index) => {
      const value = String.fromCharCode(65 + index);
      return `
        <label>
          <span>
            <input type="checkbox" name="answer" value="${value}" ${selected.includes(value) ? "checked" : ""}>
            ${value}. ${escapeHtml(option)}
          </span>
        </label>
      `;
    }).join("");
  }

  if (question.type === "true_false") {
    return `
      <label>正确答案
        <select name="answer">
          <option value="正确" ${spec.answer === "正确" ? "selected" : ""}>正确</option>
          <option value="错误" ${spec.answer === "错误" ? "selected" : ""}>错误</option>
        </select>
      </label>
    `;
  }

  return `
    <label>标准答案<input name="answer" value="${escapeHtml(spec.answer)}"></label>
    <label>判题关键词<input name="keywords" value="${escapeHtml(spec.keywords.join("、"))}" placeholder="多个关键词用顿号、逗号或空格分隔"></label>
  `;
}

function saveAnswerEdit() {
  const question = currentQuestion();
  if (!question) return;
  const formData = new FormData(els.answerEditForm);
  const answer = question.type === "multiple_choice"
    ? normalizeChoiceAnswer(formData.getAll("answer").join(""))
    : String(formData.get("answer") || "").trim();
  if (!answer) {
    alert("答案不能为空。");
    return;
  }

  const keywords = question.type === "fill_blank"
    ? splitKeywords(String(formData.get("keywords") || answer))
    : [];
  if (question.type === "fill_blank" && keywords.length === 0) {
    alert("填空题至少需要一个判题关键词。");
    return;
  }

  state.records.answerOverrides[question.id] = {
    answer,
    keywords,
    updatedAt: new Date().toISOString()
  };
  recalculateAttemptsForQuestion(question);
  rebuildWrongBookFromAttempts();
  els.answerDialog.close();
  void persistRecords("答案已修正，并已更新本地记录。");
  render();
}

function resetAnswerEdit() {
  const question = currentQuestion();
  if (!question) return;
  delete state.records.answerOverrides[question.id];
  recalculateAttemptsForQuestion(question);
  rebuildWrongBookFromAttempts();
  els.answerDialog.close();
  void persistRecords("已恢复原始答案，并已更新本地记录。");
  render();
}

function splitKeywords(value) {
  return String(value)
    .split(/[、，,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function recalculateAttemptsForQuestion(question) {
  state.records.attempts = state.records.attempts.map((attempt) => {
    if (attempt.questionId !== question.id) return attempt;
    return {
      ...attempt,
      correct: isCorrect(question, attempt.answer),
      recalculatedAt: new Date().toISOString()
    };
  });
}

function createBackupPayload() {
  return {
    app: "supreme-practice",
    backupVersion: BACKUP_VERSION,
    recordVersion: MULTI_SUBJECT_RECORD_VERSION,
    questionBankVersion: "multi-subject",
    exportedAt: new Date().toISOString(),
    records: state.appRecords
  };
}

function validateBackupPayload(payload) {
  if (!payload || typeof payload !== "object") throw new Error("备份文件不是有效 JSON。");
  if (!payload.records || typeof payload.records !== "object") throw new Error("备份文件缺少 records 数据。");
  if (payload.app === "supreme-practice") return normalizeAppRecords(payload.records);
  if (payload.app === "mayuan-practice") {
    const migrated = emptyAppRecords();
    migrated.subjects.mayuan = normalizeRecords(payload.records);
    return migrated;
  }
  throw new Error("这不是至尊刷题系统备份文件。");
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(createBackupPayload(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `supreme-practice-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setBackupStatus("已导出完整备份文件。");
}

function importBackup() {
  els.importBackupInput.value = "";
  els.importBackupInput.click();
}

async function handleBackupImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const payload = JSON.parse(await file.text());
    state.appRecords = validateBackupPayload(payload);
    state.subject = state.appRecords.activeSubject || DEFAULT_SUBJECT;
    syncCurrentRecordsReference();
    rebuildWrongBookFromAttempts();
    await persistRecords("已导入备份，并覆盖当前浏览器记录。");
    updateSubjectButtons();
    setupSetSelect();
    render();
  } catch (error) {
    alert(error.message || "导入失败，请检查备份文件。");
  }
}

function setBackupStatus(message) {
  els.backupStatus.textContent = message;
}

function updateLocalRecordActions() {
  const canManageLocalHistory = state.profile?.role === "admin" && hasMeaningfulRecords(state.localRecords);
  els.sealLocalBtn.hidden = !canManageLocalHistory;
  els.importLocalBtn.hidden = !canManageLocalHistory;
}

function showAuthView(message = "") {
  els.authView.hidden = false;
  els.appView.hidden = true;
  setStatus(els.authStatus, message);
}

function showAppView() {
  els.authView.hidden = true;
  els.appView.hidden = false;
}

async function handleLogin(event) {
  event.preventDefault();
  if (!supabaseClient) {
    setStatus(els.authStatus, "请先在 config.js 中填写 Supabase URL 和 publishable key。", "error");
    return;
  }

  try {
    setStatus(els.authStatus, "正在登录...");
    const email = studentIdToEmail(els.studentIdInput.value);
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password: els.passwordInput.value
    });
    if (error) throw error;
    els.passwordInput.value = "";
    await loadAccount(data.session);
  } catch (error) {
    setStatus(els.authStatus, error.message || "登录失败，请检查学号和密码。", "error");
  }
}

async function loadAccount(session) {
  if (!session?.user) {
    showAuthView();
    return;
  }

  state.session = session;
  const { data: profile, error: profileError } = await supabaseClient
    .from("app_users")
    .select("user_id, student_id, display_name, role, is_active")
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (profileError) throw profileError;
  if (!profile || !profile.is_active) {
    await supabaseClient.auth.signOut();
    throw new Error("账号不存在或已停用，请联系管理员。");
  }

  state.profile = profile;
  const { data: recordRow, error: recordError } = await supabaseClient
    .from("practice_records")
    .select("records")
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (recordError) throw recordError;

  if (recordRow?.records) {
    state.appRecords = normalizeAppRecords(recordRow.records);
  } else {
    state.appRecords = emptyAppRecords();
    await persistRecords("已为当前账号创建空云端记录。");
  }
  state.subject = state.appRecords.activeSubject || DEFAULT_SUBJECT;
  syncCurrentRecordsReference();

  els.accountLabel.textContent = `${profile.display_name || profile.student_id}（${profile.student_id}）`;
  els.adminBtn.hidden = profile.role !== "admin";
  updateLocalRecordActions();
  showAppView();
  updateSubjectButtons();
  setupSetSelect();
  startSet(state.set);
  setBackupStatus("云端记录已加载。");
}

async function initAuth() {
  state.localRecords = loadRecords();
  if (!supabaseClient) {
    showAuthView("请先配置 config.js 后再部署到 GitHub Pages。");
    setStatus(els.authStatus, "请先配置 config.js 后再部署到 GitHub Pages。", "error");
    return;
  }

  const { data } = await supabaseClient.auth.getSession();
  if (data.session) {
    try {
      await loadAccount(data.session);
    } catch (error) {
      showAuthView(error.message || "登录状态已失效，请重新登录。");
    }
  } else {
    showAuthView();
  }

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    state.session = session;
    if (!session) showAuthView();
  });
}

async function logout() {
  if (supabaseClient) await supabaseClient.auth.signOut();
  state.session = null;
  state.profile = null;
  state.appRecords = emptyAppRecords();
  state.subject = DEFAULT_SUBJECT;
  syncCurrentRecordsReference();
  showAuthView("已退出登录。");
}

function openPasswordDialog() {
  els.newPasswordInput.value = "";
  setStatus(els.passwordStatus, "");
  els.passwordDialog.showModal();
}

async function savePassword() {
  const password = els.newPasswordInput.value;
  if (password.length < 6) {
    setStatus(els.passwordStatus, "新密码至少 6 位。", "error");
    return;
  }
  try {
    setStatus(els.passwordStatus, "正在保存...");
    const { error } = await supabaseClient.auth.updateUser({ password });
    if (error) throw error;
    setStatus(els.passwordStatus, "密码已修改。", "ok");
    setTimeout(() => els.passwordDialog.close(), 500);
  } catch (error) {
    setStatus(els.passwordStatus, error.message || "修改失败。", "error");
  }
}

function sealLocalRecords() {
  if (!hasMeaningfulRecords(state.localRecords)) {
    setBackupStatus("没有发现可封存的本机旧记录。");
    return;
  }
  const payload = {
    app: "mayuan-practice",
    purpose: "sealed-private-history",
    backupVersion: BACKUP_VERSION,
    questionBankVersion: QUESTION_BANK_VERSION,
    exportedAt: new Date().toISOString(),
    records: state.localRecords
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "my-practice-records-sealed.json";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setBackupStatus("已下载封存文件。请放入本机 private/ 文件夹；该目录不会提交到 GitHub。");
}

async function importLocalRecordsToCurrentAccount() {
  if (!hasMeaningfulRecords(state.localRecords)) {
    setBackupStatus("没有发现可导入的本机旧记录。");
    return;
  }
  const target = window.prompt("请输入当前账号学号，确认要把本机旧记录导入到这个账号。");
  if (target !== state.profile?.student_id) {
    setBackupStatus("学号确认不一致，已取消导入。");
    return;
  }
  state.appRecords.subjects.mayuan = normalizeRecords(state.localRecords);
  state.subject = "mayuan";
  state.appRecords.activeSubject = "mayuan";
  syncCurrentRecordsReference();
  rebuildWrongBookFromAttempts();
  await persistRecords("本机旧记录已导入当前账号。");
  updateSubjectButtons();
  setupSetSelect();
  render();
}

async function invokeAdmin(action, payload = {}) {
  const { data, error } = await supabaseClient.functions.invoke("admin-users", {
    body: { action, ...payload }
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

function openAdminDialog() {
  setStatus(els.adminStatus, "");
  els.adminDialog.showModal();
  void refreshAdminUsers();
}

async function refreshAdminUsers() {
  try {
    setStatus(els.adminStatus, "正在加载账号...");
    const data = await invokeAdmin("list");
    renderAdminUsers(data.users || []);
    setStatus(els.adminStatus, `已加载 ${data.users?.length || 0} 个账号。`, "ok");
  } catch (error) {
    setStatus(els.adminStatus, error.message || "加载失败。", "error");
  }
}

function renderAdminUsers(users) {
  els.adminUsers.innerHTML = users.length ? users.map((user) => `
    <div class="admin-user">
      <div>
        <strong>${escapeHtml(user.student_id)}${user.display_name ? ` · ${escapeHtml(user.display_name)}` : ""}</strong>
        <span>${user.role === "admin" ? "管理员" : "普通账号"} · ${user.is_active ? "已启用" : "已停用"}</span>
      </div>
      <div class="admin-user-actions">
        <button type="button" data-admin-action="reset" data-student-id="${escapeHtml(user.student_id)}">重置密码</button>
        <button type="button" data-admin-action="toggle" data-student-id="${escapeHtml(user.student_id)}" data-active="${user.is_active ? "true" : "false"}">${user.is_active ? "停用" : "启用"}</button>
      </div>
    </div>
  `).join("") : '<p class="empty">还没有账号。</p>';
}

async function createAdminUser() {
  const studentId = els.adminStudentId.value.trim();
  const password = els.adminPassword.value;
  if (!studentId || !password) {
    setStatus(els.adminStatus, "学号和密码都要填写。", "error");
    return;
  }
  try {
    setStatus(els.adminStatus, "正在创建账号...");
    await invokeAdmin("create", {
      studentId,
      password,
      displayName: els.adminDisplayName.value.trim()
    });
    els.adminStudentId.value = "";
    els.adminDisplayName.value = "";
    els.adminPassword.value = "";
    await refreshAdminUsers();
    setStatus(els.adminStatus, "账号已创建，云端记录为空。", "ok");
  } catch (error) {
    setStatus(els.adminStatus, error.message || "创建失败。", "error");
  }
}

async function handleAdminUserClick(event) {
  const button = event.target.closest("[data-admin-action]");
  if (!button) return;
  const studentId = button.dataset.studentId;
  try {
    if (button.dataset.adminAction === "reset") {
      const password = window.prompt(`请输入 ${studentId} 的新密码：`);
      if (!password) return;
      await invokeAdmin("resetPassword", { studentId, password });
      setStatus(els.adminStatus, "密码已重置。", "ok");
    }
    if (button.dataset.adminAction === "toggle") {
      const isActive = button.dataset.active !== "true";
      await invokeAdmin("setActive", { studentId, isActive });
      await refreshAdminUsers();
      setStatus(els.adminStatus, isActive ? "账号已启用。" : "账号已停用。", "ok");
    }
  } catch (error) {
    setStatus(els.adminStatus, error.message || "操作失败。", "error");
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function bindEvents() {
  els.loginForm.addEventListener("submit", handleLogin);
  els.logoutBtn.addEventListener("click", logout);
  els.changePasswordBtn.addEventListener("click", openPasswordDialog);
  els.savePasswordBtn.addEventListener("click", savePassword);
  els.adminBtn.addEventListener("click", openAdminDialog);
  els.refreshUsersBtn.addEventListener("click", refreshAdminUsers);
  els.createUserBtn.addEventListener("click", createAdminUser);
  els.adminUsers.addEventListener("click", handleAdminUserClick);
  els.sealLocalBtn.addEventListener("click", sealLocalRecords);
  els.importLocalBtn.addEventListener("click", importLocalRecordsToCurrentAccount);
  els.subjectSwitch.addEventListener("click", (event) => {
    const button = event.target.closest("[data-subject]");
    if (button) switchSubject(button.dataset.subject);
  });
  els.setSelect.addEventListener("change", () => startSet(els.setSelect.value));
  els.setModeBtn.addEventListener("click", () => startSet(state.set));
  els.randomModeBtn.addEventListener("click", startRandom);
  els.wrongModeBtn.addEventListener("click", startWrongPractice);
  els.submitBtn.addEventListener("click", submitAnswer);
  els.nextBtn.addEventListener("click", nextQuestion);
  els.masteredBtn.addEventListener("click", markMastered);
  els.editAnswerBtn.addEventListener("click", openAnswerEditor);
  els.saveAnswerEditBtn.addEventListener("click", saveAnswerEdit);
  els.resetAnswerEditBtn.addEventListener("click", resetAnswerEdit);
  els.resetBtn.addEventListener("click", clearRecords);
  els.exportBackupBtn.addEventListener("click", exportBackup);
  els.importBackupBtn.addEventListener("click", importBackup);
  els.importBackupInput.addEventListener("change", handleBackupImport);
  els.wrongFilter.addEventListener("change", renderWrongBook);
  els.wrongList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-review]");
    if (button) jumpToWrongQuestion(button.dataset.review);
  });
  els.answerForm.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!state.answered) submitAnswer();
      else nextQuestion();
    }
  });
}

bindEvents();
void initAuth();
