const STORAGE_KEY = "mayuan_practice_state_v2";
const LEGACY_STORAGE_KEY = "mayuan_practice_state_v1";
const THEME_STORAGE_KEY = "supreme_practice_dark_mode";
const BACKUP_VERSION = 1;
const QUESTION_BANK_VERSION = "2026-05-28-release";
const MULTI_SUBJECT_RECORD_VERSION = 2;
const SET_SIZE = 20;
const EXAM_COUNT = 5;
const EXAM_DURATION_SECONDS = 30 * 60;
const EXAM_RULES = {
  single_choice: { count: 50, score: 0.5 },
  multiple_choice: { count: 25, score: 1 },
  true_false: { count: 20, score: 1 }
};
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
  mayuan_sync: {
    label: "马原同步练",
    getQuestions: () => window.MAYUAN_SYNC_QUESTIONS || [],
    bankVersion: "mayuan-sync-docx-20260625",
    setModeText: (_set, group) => `马原同步练 · 正在练习${group?.label || "单元"}。题目来自马原机考题库。`,
    randomText: (count) => `马原同步练 · 随机练习会从 ${count} 题中抽取 20 题，适合按单元复习后混合检查。`,
    wrongText: "马原同步练 · 错题重刷只使用马原同步练错题本，不会混入其他学科。"
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
  examSet: 1,
  index: 0,
  sessionQuestions: [],
  answered: false,
  selectedAnswer: "",
  currentResult: null,
  examSession: null,
  examTimer: null,
  wrongReviewSelection: new Set(),
  wrongReviewKnowledgeOpen: new Set(),
  wrongReviewFilter: "all",
  wrongReviewUnitFilter: "all",
  wrongReviewSession: null,
  guessedQuestionIds: new Set(),
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
  darkModeToggle: document.querySelector("#darkModeToggle"),
  modeText: document.querySelector("#modeText"),
  resetBtn: document.querySelector("#resetBtn"),
  backupStatus: document.querySelector("#backupStatus"),
  sealLocalBtn: document.querySelector("#sealLocalBtn"),
  importLocalBtn: document.querySelector("#importLocalBtn"),
  exportBackupBtn: document.querySelector("#exportBackupBtn"),
  importBackupBtn: document.querySelector("#importBackupBtn"),
  importBackupInput: document.querySelector("#importBackupInput"),
  subjectSwitch: document.querySelector("#subjectSwitch"),
  setSelectLabel: document.querySelector("#setSelectLabel"),
  setSelect: document.querySelector("#setSelect"),
  setModeBtn: document.querySelector("#setModeBtn"),
  examModeBtn: document.querySelector("#examModeBtn"),
  choiceModeBtn: document.querySelector("#choiceModeBtn"),
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
  guessedBtn: document.querySelector("#guessedBtn"),
  editAnswerBtn: document.querySelector("#editAnswerBtn"),
  feedback: document.querySelector("#feedback"),
  wrongFilter: document.querySelector("#wrongFilter"),
  wrongList: document.querySelector("#wrongList"),
  chapterWeakness: document.querySelector("#chapterWeakness"),
  answerDialog: document.querySelector("#answerDialog"),
  answerEditForm: document.querySelector("#answerEditForm"),
  answerEditHint: document.querySelector("#answerEditHint"),
  answerEditFields: document.querySelector("#answerEditFields"),
  answerSuggestions: document.querySelector("#answerSuggestions"),
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
    sessionState: null,
    examResults: {},
    wrongReviewResults: [],
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
    sessionState: parsed.sessionState && typeof parsed.sessionState === "object" ? parsed.sessionState : null,
    examResults: parsed.examResults && typeof parsed.examResults === "object" ? parsed.examResults : {},
    wrongReviewResults: Array.isArray(parsed.wrongReviewResults) ? parsed.wrongReviewResults : [],
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
    for (const [subject, records] of Object.entries(parsed.subjects)) {
      if (!base.subjects[subject]) base.subjects[subject] = records;
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

function isMayuan() {
  return state.subject === "mayuan";
}

function isChapterSubject() {
  return state.subject === "mayuan_sync";
}

function getPracticeGroups() {
  const questions = getCurrentQuestions();
  if (isChapterSubject()) {
    const chapters = [...new Set(questions.map((question) => question.chapter))];
    return chapters.map((chapter, index) => ({
      id: String(index + 1),
      label: chapter,
      questions: questions.filter((question) => question.chapter === chapter)
    }));
  }

  const totalSets = Math.max(1, ...questions.map((question) => question.set));
  return Array.from({ length: totalSets }, (_, index) => {
    const setNumber = index + 1;
    return {
      id: String(setNumber),
      label: `第 ${setNumber} 套`,
      questions: questions.filter((question) => question.set === setNumber)
    };
  });
}

function getAttemptStats() {
  const stats = new Map();
  for (const attempt of state.records.attempts) {
    const old = stats.get(attempt.questionId) || { count: 0, lastTime: "", correct: 0, wrong: 0 };
    old.count += 1;
    old.lastTime = attempt.time && attempt.time > old.lastTime ? attempt.time : old.lastTime;
    if (attempt.correct) old.correct += 1;
    else old.wrong += 1;
    stats.set(attempt.questionId, old);
  }
  return stats;
}

function smartPickQuestions(list, count, seed) {
  const stats = getAttemptStats();
  const unseen = [];
  const seen = [];
  for (const question of list) {
    if (stats.has(question.id)) seen.push(question);
    else unseen.push(question);
  }

  const shuffledUnseen = seededPick(unseen, unseen.length, seed);
  const sortedSeen = [...seen].sort((left, right) => {
    const leftStats = stats.get(left.id);
    const rightStats = stats.get(right.id);
    return leftStats.count - rightStats.count ||
      String(leftStats.lastTime || "").localeCompare(String(rightStats.lastTime || "")) ||
      left.id.localeCompare(right.id);
  });
  return [...shuffledUnseen, ...sortedSeen].slice(0, count);
}

function getQuestionStatus(question) {
  if (state.records.wrongBook[question.id]) return { label: "错题", className: "wrong" };
  return state.records.attempts.some((attempt) => attempt.questionId === question.id)
    ? { label: "已做", className: "done" }
    : { label: "未做", className: "" };
}

function buildExamPaper(examSet) {
  const all = (window.QUESTIONS || []);
  const seedBase = Number(examSet) * 1009;
  return [
    ...seededPick(all.filter((question) => question.type === "single_choice"), EXAM_RULES.single_choice.count, seedBase + 11),
    ...seededPick(all.filter((question) => question.type === "multiple_choice"), EXAM_RULES.multiple_choice.count, seedBase + 23),
    ...seededPick(all.filter((question) => question.type === "true_false"), EXAM_RULES.true_false.count, seedBase + 37)
  ].map((question, index) => ({ ...question, examOrder: index + 1 }));
}

function getExamMaxScore() {
  return Object.values(EXAM_RULES).reduce((sum, rule) => sum + rule.count * rule.score, 0);
}

function resetWrongReviewState() {
  state.wrongReviewSelection = new Set();
  state.wrongReviewKnowledgeOpen = new Set();
  state.wrongReviewFilter = "all";
  state.wrongReviewUnitFilter = "all";
  state.wrongReviewSession = null;
}

function syncCurrentRecordsReference() {
  if (!state.appRecords?.subjects) state.appRecords = emptyAppRecords();
  if (!state.appRecords.subjects[state.subject]) state.appRecords.subjects[state.subject] = emptyRecords();
  state.records = state.appRecords.subjects[state.subject];
}

function switchSubject(subject, persistChoice = true) {
  if (!SUBJECTS[subject] || subject === state.subject) return;
  stopExamTimer();
  saveSessionState();
  state.subject = subject;
  state.appRecords.activeSubject = subject;
  syncCurrentRecordsReference();
  state.set = 1;
  state.examSet = 1;
  state.mode = "set";
  state.index = 0;
  state.sessionQuestions = [];
  state.answered = false;
  state.selectedAnswer = "";
  state.currentResult = null;
  state.examSession = null;
  state.guessedQuestionIds = new Set();
  resetWrongReviewState();
  updateSubjectButtons();
  setupSetSelect();
  if (!restoreSessionState()) startSet(state.set);
  if (persistChoice) void persistRecords(`${getCurrentSubject().label}记录已同步。`);
}

function updateSubjectButtons() {
  els.subjectSwitch?.querySelectorAll("[data-subject]").forEach((button) => {
    button.classList.toggle("active", button.dataset.subject === state.subject);
  });
}

function createSessionState() {
  return {
    mode: state.mode,
    set: state.set,
    examSet: state.examSet,
    index: state.index,
    questionIds: state.sessionQuestions.map((question) => question.id),
    answered: state.answered,
    selectedAnswer: state.selectedAnswer,
    currentResult: state.currentResult,
    wrongReviewSelection: [...state.wrongReviewSelection],
    wrongReviewFilter: state.wrongReviewFilter,
    wrongReviewUnitFilter: state.wrongReviewUnitFilter,
    wrongReviewSession: state.wrongReviewSession,
    guessedQuestionIds: [...state.guessedQuestionIds],
    examSession: state.examSession ? {
      examSet: state.examSession.examSet,
      startedAt: state.examSession.startedAt,
      submittedAt: state.examSession.submittedAt || null,
      answers: state.examSession.answers || {},
      results: state.examSession.results || {}
    } : null,
    updatedAt: new Date().toISOString()
  };
}

function saveSessionState() {
  syncCurrentRecordsReference();
  if (state.mode === "wrong" && state.wrongReviewSession?.completedAt) {
    state.records.sessionState = null;
    return;
  }
  state.records.sessionState = createSessionState();
}

function clearSessionState() {
  syncCurrentRecordsReference();
  state.records.sessionState = null;
}

function restoreSessionState() {
  const saved = state.records.sessionState;
  if (!saved || !saved.mode || !Array.isArray(saved.questionIds)) return false;

  state.wrongReviewSelection = new Set(Array.isArray(saved.wrongReviewSelection) ? saved.wrongReviewSelection : []);
  state.wrongReviewFilter = saved.wrongReviewFilter || "all";
  state.wrongReviewUnitFilter = saved.wrongReviewUnitFilter || "all";
  state.wrongReviewSession = saved.wrongReviewSession || null;
  state.guessedQuestionIds = new Set(Array.isArray(saved.guessedQuestionIds) ? saved.guessedQuestionIds : []);

  if (saved.mode === "wrong-select") {
    state.mode = "wrong-select";
    state.index = 0;
    state.sessionQuestions = [];
    state.answered = false;
    state.selectedAnswer = "";
    state.currentResult = null;
    state.examSession = null;
    setupSetSelect();
    updateModeButtons();
    render();
    return true;
  }

  const questions = saved.questionIds.map(getQuestionById).filter(Boolean);
  if (!questions.length) return false;
  if (saved.mode !== "wrong" && questions.length !== saved.questionIds.length) return false;
  if (saved.mode === "choice" && questions.some((question) => question.type !== "single_choice")) return false;
  if (saved.mode === "wrong" && state.wrongReviewSession?.selectedIds?.length) {
    const validSelectedIds = state.wrongReviewSession.selectedIds.filter((questionId) => getQuestionById(questionId));
    if (!validSelectedIds.length) return false;
    state.wrongReviewSession.selectedIds = validSelectedIds;
    state.wrongReviewSession.results = Object.fromEntries(validSelectedIds.map((questionId) => [
      questionId,
      state.wrongReviewSession.results?.[questionId] || []
    ]));
  }

  state.mode = saved.mode;
  state.set = Number(saved.set || 1);
  state.examSet = Number(saved.examSet || 1);
  state.index = Math.min(Math.max(Number(saved.index || 0), 0), questions.length);
  state.sessionQuestions = questions;
  state.answered = Boolean(saved.answered);
  state.selectedAnswer = saved.selectedAnswer || "";
  state.currentResult = saved.currentResult || null;
  state.examSession = saved.examSession || null;
  setupSetSelect();
  updateModeButtons();
  render();
  startExamTimer();
  return true;
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

function schedulePersistRecords(statusText = "当前进度已保存。") {
  if (state.syncTimer) clearTimeout(state.syncTimer);
  state.syncTimer = setTimeout(() => {
    state.syncTimer = null;
    void persistRecords(statusText);
  }, 800);
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

function getFormAnswer(question) {
  const formData = new FormData(els.answerForm);
  return question.type === "multiple_choice"
    ? formData.getAll("answer").sort().join("")
    : question.type === "fill_blank"
      ? String(formData.get("answer") || "").trim()
      : String(formData.get("answer") || "");
}

function captureDraftAnswer() {
  const question = currentQuestion();
  if (!question || state.answered) return;
  state.selectedAnswer = getFormAnswer(question);
  if (state.mode === "exam" && state.examSession && state.selectedAnswer) {
    state.examSession.answers[question.id] = state.selectedAnswer;
  }
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
  return formatAnswerValue(question, spec.answer, spec.keywords);
}

function formatAnswerValue(question, answer, keywords = []) {
  if (question.type === "single_choice" || question.type === "multiple_choice") {
    return normalizeChoiceAnswer(answer).split("").map((letter) => {
      const index = letter.charCodeAt(0) - 65;
      return `${letter}. ${question.options[index] || "未知选项"}`;
    }).join("；");
  }
  if (question.type === "fill_blank" && keywords.length) {
    return `${answer}（关键词：${keywords.join("、")}）`;
  }
  return answer;
}

function setupSetSelect() {
  els.setSelect.disabled = false;

  if (state.mode === "exam") {
    els.setSelectLabel.textContent = "模拟卷";
    els.setSelect.innerHTML = Array.from({ length: EXAM_COUNT }, (_, index) => {
      const examSet = index + 1;
      const done = state.records.examResults?.[examSet] ? "（已做）" : "";
      return `<option value="${examSet}">第 ${examSet} 套${done}</option>`;
    }).join("");
    els.setSelect.value = String(state.examSet);
    return;
  }

  if (state.mode === "wrong-select" || state.mode === "wrong") {
    els.setSelectLabel.textContent = "错题";
    els.setSelect.innerHTML = `<option>${state.mode === "wrong-select" ? "选择本次重刷题目" : "本次重刷"}</option>`;
    els.setSelect.disabled = true;
    return;
  }

  els.setSelectLabel.textContent = isChapterSubject() ? "单元" : "套题";
  const groups = getPracticeGroups();
  els.setSelect.innerHTML = groups.map((group) => {
    const countText = isChapterSubject() ? `（${group.questions.length}题）` : "";
    return `<option value="${group.id}">${escapeHtml(group.label)}${countText}</option>`;
  }).join("");
  if (state.set > groups.length) state.set = 1;
  els.setSelect.value = String(state.set);
}

function startSet(setNumber) {
  stopExamTimer();
  state.mode = "set";
  state.set = Number(setNumber);
  state.index = 0;
  state.examSession = null;
  state.sessionQuestions = getPracticeGroups()[state.set - 1]?.questions || [];
  state.answered = false;
  state.selectedAnswer = "";
  state.currentResult = null;
  state.guessedQuestionIds = new Set();
  resetWrongReviewState();
  setupSetSelect();
  updateModeButtons();
  saveSessionState();
  void persistRecords();
  render();
}

function startRandom() {
  stopExamTimer();
  state.mode = "random";
  state.index = 0;
  state.examSession = null;
  state.sessionQuestions = smartPickQuestions(getCurrentQuestions(), SET_SIZE, Date.now());
  state.answered = false;
  state.selectedAnswer = "";
  state.currentResult = null;
  state.guessedQuestionIds = new Set();
  resetWrongReviewState();
  setupSetSelect();
  updateModeButtons();
  saveSessionState();
  void persistRecords();
  render();
}

function startChoicePractice() {
  stopExamTimer();
  state.mode = "choice";
  state.index = 0;
  state.examSession = null;
  state.sessionQuestions = smartPickQuestions(
    getCurrentQuestions().filter((question) => question.type === "single_choice"),
    SET_SIZE,
    Date.now()
  );
  state.answered = false;
  state.selectedAnswer = "";
  state.currentResult = null;
  state.guessedQuestionIds = new Set();
  resetWrongReviewState();
  setupSetSelect();
  updateModeButtons();
  saveSessionState();
  void persistRecords();
  render();
}

function startExam(examSet = state.examSet) {
  if (!isMayuan()) return;
  state.mode = "exam";
  state.examSet = Number(examSet);
  state.set = state.examSet;
  state.index = 0;
  state.sessionQuestions = buildExamPaper(state.examSet);
  state.answered = false;
  state.selectedAnswer = "";
  state.currentResult = null;
  state.guessedQuestionIds = new Set();
  resetWrongReviewState();
  state.examSession = {
    examSet: state.examSet,
    startedAt: new Date().toISOString(),
    answers: {},
    results: {},
    submittedAt: null
  };
  setupSetSelect();
  updateModeButtons();
  startExamTimer();
  saveSessionState();
  void persistRecords();
  render();
}

function startWrongPractice() {
  stopExamTimer();
  state.mode = "wrong-select";
  state.index = 0;
  state.examSession = null;
  state.sessionQuestions = [];
  state.answered = false;
  state.selectedAnswer = "";
  state.currentResult = null;
  state.wrongReviewSession = null;
  state.wrongReviewSelection = new Set();
  state.wrongReviewKnowledgeOpen = new Set();
  state.wrongReviewFilter = "all";
  state.wrongReviewUnitFilter = "all";
  state.guessedQuestionIds = new Set();
  setupSetSelect();
  updateModeButtons();
  saveSessionState();
  void persistRecords();
  render();
}

function sortedWrongItems() {
  return Object.values(state.records.wrongBook)
    .filter((item) => getQuestionById(item.questionId))
    .sort((left, right) => right.wrongCount - left.wrongCount || String(right.lastWrong || "").localeCompare(String(left.lastWrong || "")));
}

function visibleWrongReviewItems() {
  return sortedWrongItems().filter((item) => state.wrongReviewFilter === "all" || item.priority === state.wrongReviewFilter);
}

function visibleWrongReviewUnits() {
  return [...new Set(sortedWrongItems().map((item) => item.chapter).filter(Boolean))];
}

function selectWrongReviewUnit() {
  if (!isChapterSubject()) return;
  const selectedUnit = state.wrongReviewUnitFilter || "all";
  const items = visibleWrongReviewItems().filter((item) => selectedUnit === "all" || item.chapter === selectedUnit);
  for (const item of items) {
    state.wrongReviewSelection.add(item.questionId);
  }
  saveSessionState();
  void persistRecords();
  renderQuestion();
}

function startSelectedWrongReview() {
  const selectedIds = sortedWrongItems()
    .map((item) => item.questionId)
    .filter((questionId) => state.wrongReviewSelection.has(questionId));
  const questions = selectedIds.map(getQuestionById).filter(Boolean);
  if (!questions.length) {
    showFeedback(false, "请先选择至少一道错题。", { answer: "", keywords: [], explanation: "勾选错题后再开始本次重刷。", sourcePoint: "", type: "fill_blank" });
    return;
  }

  state.mode = "wrong";
  state.index = 0;
  state.sessionQuestions = [...questions, ...questions];
  state.answered = false;
  state.selectedAnswer = "";
  state.currentResult = null;
  state.examSession = null;
  state.wrongReviewSession = {
    selectedIds: questions.map((question) => question.id),
    roundCount: 2,
    results: Object.fromEntries(questions.map((question) => [question.id, []])),
    startedAt: new Date().toISOString(),
    completedAt: null,
    summary: null
  };
  setupSetSelect();
  updateModeButtons();
  saveSessionState();
  void persistRecords("错题重刷已开始。");
  render();
}

function recordWrongReviewAnswer(question, correct) {
  if (state.mode !== "wrong" || !state.wrongReviewSession?.selectedIds?.length) return;
  const groupSize = state.wrongReviewSession.selectedIds.length;
  const roundIndex = Math.floor(state.index / groupSize);
  const results = state.wrongReviewSession.results[question.id] || [];
  results[roundIndex] = Boolean(correct);
  state.wrongReviewSession.results[question.id] = results;
}

function finishWrongReview() {
  if (state.mode !== "wrong" || !state.wrongReviewSession || state.wrongReviewSession.completedAt) return;

  const selectedIds = state.wrongReviewSession.selectedIds || [];
  const questionResults = selectedIds.map((questionId) => {
    const results = state.wrongReviewSession.results[questionId] || [];
    const mastered = results.length >= 2 && results.slice(0, 2).every(Boolean);
    if (mastered) delete state.records.wrongBook[questionId];
    return { questionId, results: results.slice(0, 2).map(Boolean), mastered };
  });
  const removed = questionResults.filter((item) => item.mastered).length;
  const completedAt = new Date().toISOString();
  const summary = {
    total: selectedIds.length,
    removed,
    kept: selectedIds.length - removed,
    startedAt: state.wrongReviewSession.startedAt,
    completedAt,
    questionResults
  };

  state.wrongReviewSession.completedAt = completedAt;
  state.wrongReviewSession.summary = summary;
  state.records.wrongReviewResults = [
    summary,
    ...(Array.isArray(state.records.wrongReviewResults) ? state.records.wrongReviewResults : [])
  ].slice(0, 20);
  state.index = state.sessionQuestions.length;
  state.answered = false;
  state.selectedAnswer = "";
  state.currentResult = null;
  clearSessionState();
  void persistRecords("错题重刷已结束，错题本已更新。");
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
  els.setModeBtn.textContent = isChapterSubject() ? "单元练习" : "套题练习";
  els.examModeBtn.hidden = !isMayuan();
  els.examModeBtn.classList.toggle("active", state.mode === "exam");
  els.choiceModeBtn.hidden = !isChapterSubject();
  els.choiceModeBtn.classList.toggle("active", state.mode === "choice");
  els.randomModeBtn.classList.toggle("active", state.mode === "random");
  els.wrongModeBtn.classList.toggle("active", state.mode === "wrong" || state.mode === "wrong-select");
  els.modeText.textContent = state.mode === "set"
    ? getCurrentSubject().setModeText(state.set, getPracticeGroups()[state.set - 1])
    : state.mode === "exam"
      ? `马原 · 第 ${state.examSet} 套模拟考试，满分 ${getExamMaxScore()} 分，限时 30 分钟。`
      : state.mode === "choice"
        ? `${getCurrentSubject().label} · 单选题专项只抽单选题，优先出现未做题。`
        : state.mode === "random"
          ? getCurrentSubject().randomText(getCurrentQuestions().length)
          : state.mode === "wrong-select"
            ? `${getCurrentSubject().label} · 先选择本次要重刷的错题，再组成两轮重刷组。`
            : getCurrentSubject().wrongText;
}

function getExamRemainingSeconds() {
  if (!state.examSession?.startedAt || state.examSession.submittedAt) return 0;
  const elapsed = Math.floor((Date.now() - new Date(state.examSession.startedAt).getTime()) / 1000);
  return Math.max(0, EXAM_DURATION_SECONDS - elapsed);
}

function formatDuration(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function stopExamTimer() {
  if (state.examTimer) {
    clearInterval(state.examTimer);
    state.examTimer = null;
  }
}

function startExamTimer() {
  stopExamTimer();
  if (state.mode !== "exam" || state.examSession?.submittedAt) return;
  state.examTimer = setInterval(() => {
    if (state.mode !== "exam" || !state.examSession || state.examSession.submittedAt) {
      stopExamTimer();
      return;
    }
    if (getExamRemainingSeconds() <= 0) {
      finishExam(true);
      return;
    }
    renderStats();
    updateModeButtons();
  }, 1000);
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
  els.submitBtn.hidden = false;
  els.nextBtn.hidden = false;
  els.editAnswerBtn.hidden = false;
  els.submitBtn.textContent = "提交答案";
  els.nextBtn.textContent = "下一题";
  els.submitBtn.disabled = Boolean(state.answered);
  els.nextBtn.disabled = !state.answered;
  els.masteredBtn.hidden = true;
  els.guessedBtn.hidden = true;
  els.guessedBtn.disabled = false;
  els.editAnswerBtn.disabled = !question;

  if (state.mode === "wrong-select") {
    renderWrongReviewSelection();
    return;
  }

  if (!question) {
    els.priorityBadge.textContent = "DONE";
    els.priorityBadge.className = "badge black";
    els.chapterLabel.textContent = "";
    els.progressLabel.textContent = "0/0";
    els.questionTitle.textContent = state.mode === "wrong"
      ? state.wrongReviewSession?.summary ? "本次错题重刷已完成" : "错题本暂时是空的"
      : state.mode === "exam"
        ? "模拟考试已完成"
        : "本轮练习已完成";
    els.questionPrompt.textContent = state.mode === "wrong"
      ? state.wrongReviewSession?.summary ? "两轮都答对的题目已经自动移出错题本，任一轮答错的题目会继续保留。" : "继续刷套题或随机练习，答错的题会自动进入这里。"
      : state.mode === "exam"
        ? "可以查看本次模拟考试成绩，或切换另一套模拟卷。"
        : "可以换一套继续刷，或者进入错题重刷。";
    els.answerForm.innerHTML = state.mode === "wrong" && state.wrongReviewSession?.summary
      ? renderWrongReviewSummary(state.wrongReviewSession.summary)
      : "";
    els.submitBtn.disabled = true;
    els.nextBtn.disabled = true;
    els.submitBtn.hidden = true;
    els.nextBtn.hidden = true;
    els.editAnswerBtn.hidden = true;
    els.guessedBtn.hidden = true;
    return;
  }

  const spec = getAnswerSpec(question);
  const status = getQuestionStatus(question);
  const statusHtml = `<span class="question-tags"><span class="status-tag ${status.className}">${status.label}</span></span>`;
  els.priorityBadge.textContent = priorityText(question.priority);
  els.priorityBadge.className = `badge ${question.priority}`;
  els.chapterLabel.innerHTML = `${escapeHtml(spec.edited ? `${question.chapter} · 已手动修正答案` : question.chapter)}${statusHtml}`;
  els.progressLabel.textContent = state.mode === "exam"
    ? `${state.index + 1}/${state.sessionQuestions.length} · ${formatDuration(getExamRemainingSeconds())}`
    : state.mode === "wrong" && state.wrongReviewSession?.selectedIds?.length
      ? `第 ${Math.floor(state.index / state.wrongReviewSession.selectedIds.length) + 1} 轮 · ${state.index % state.wrongReviewSession.selectedIds.length + 1}/${state.wrongReviewSession.selectedIds.length}`
      : `${state.index + 1}/${state.sessionQuestions.length}`;
  els.questionTitle.textContent = `${question.title} · ${typeText(question.type)}`;
  els.questionPrompt.textContent = question.prompt;
  els.answerForm.innerHTML = question.type === "fill_blank" ? renderFillInput() : renderOptions(question);
  applySelectedAnswer(question);
  if (state.answered && state.currentResult) {
    showFeedback(state.currentResult.correct, state.currentResult.label, question);
    els.submitBtn.disabled = true;
    els.nextBtn.disabled = false;
    els.nextBtn.textContent = state.mode === "wrong" && state.index >= state.sessionQuestions.length - 1 ? "完成本次重刷" : "下一题";
    els.masteredBtn.hidden = state.mode === "wrong" || !state.records.wrongBook[question.id];
    els.guessedBtn.hidden = !isChapterSubject() || isCurrentAnswerGuessed();
    els.guessedBtn.disabled = isCurrentAnswerGuessed();
  }
}

function renderWrongReviewSelection() {
  const items = visibleWrongReviewItems();
  const unitOptions = visibleWrongReviewUnits();
  if (state.wrongReviewUnitFilter !== "all" && !unitOptions.includes(state.wrongReviewUnitFilter)) {
    state.wrongReviewUnitFilter = "all";
  }
  const selectedCount = state.wrongReviewSelection.size;
  els.priorityBadge.textContent = "REVIEW";
  els.priorityBadge.className = "badge blue";
  els.chapterLabel.textContent = `${getCurrentSubject().label} · 错题重刷`;
  els.progressLabel.textContent = `已选 ${selectedCount}`;
  els.questionTitle.textContent = "选择本次要重刷的错题";
  els.questionPrompt.textContent = "勾选题目组成一组，系统会按整组两轮复现。两轮都答对会自动移出错题本。";
  els.submitBtn.hidden = true;
  els.nextBtn.hidden = true;
  els.masteredBtn.hidden = true;
  els.guessedBtn.hidden = true;
  els.editAnswerBtn.hidden = true;
  els.answerForm.innerHTML = `
    <div class="wrong-review-tools">
      <label>筛选
        <select data-wrong-review-filter>
          <option value="all"${state.wrongReviewFilter === "all" ? " selected" : ""}>全部错题</option>
          <option value="red"${state.wrongReviewFilter === "red" ? " selected" : ""}>红必背</option>
          <option value="blue"${state.wrongReviewFilter === "blue" ? " selected" : ""}>蓝常考</option>
          <option value="black"${state.wrongReviewFilter === "black" ? " selected" : ""}>黑补充</option>
        </select>
      </label>
      ${isChapterSubject() ? `
        <label>单元
          <select data-wrong-review-unit>
            <option value="all"${state.wrongReviewUnitFilter === "all" ? " selected" : ""}>全部单元</option>
            ${unitOptions.map((chapter) => `<option value="${escapeHtml(chapter)}"${state.wrongReviewUnitFilter === chapter ? " selected" : ""}>${escapeHtml(chapter)}</option>`).join("")}
          </select>
        </label>
      ` : ""}
      <div class="wrong-review-actions">
        <button type="button" data-wrong-review-action="select-visible">全选当前筛选</button>
        ${isChapterSubject() ? '<button type="button" data-wrong-review-action="select-unit">选择该单元错题</button>' : ""}
        <button type="button" data-wrong-review-action="clear">取消全选</button>
        <button class="primary" type="button" data-wrong-review-action="start" ${selectedCount ? "" : "disabled"}>开始重刷 ${selectedCount ? `(${selectedCount})` : ""}</button>
      </div>
    </div>
    <div class="wrong-review-list">
      ${items.length ? items.map((item) => {
        const question = getQuestionById(item.questionId);
        const knowledgeOpen = state.wrongReviewKnowledgeOpen.has(item.questionId);
        return `
          <div class="wrong-review-item">
            <label>
              <input type="checkbox" name="wrongReviewPick" value="${escapeHtml(item.questionId)}" ${state.wrongReviewSelection.has(item.questionId) ? "checked" : ""}>
              <span>
                <strong>${escapeHtml(item.title)}</strong>
                <em>${priorityText(item.priority)} · ${typeText(item.type)} · 错 ${item.wrongCount} 次</em>
                <small>${escapeHtml(item.chapter)}</small>
              </span>
            </label>
            <button type="button" data-wrong-review-action="toggle-knowledge" data-question-id="${escapeHtml(item.questionId)}">${knowledgeOpen ? "收起知识点" : "看知识点"}</button>
            ${knowledgeOpen && question ? renderKnowledgeCard(question) : ""}
          </div>
        `;
      }).join("") : '<p class="empty">当前筛选下没有错题。</p>'}
    </div>
  `;
}

function renderKnowledgeCard(question) {
  const optionHtml = Array.isArray(question.options) && question.options.length
    ? `<ol class="knowledge-options">${question.options.map((option, index) => `
        <li><strong>${escapeHtml(String.fromCharCode(65 + index))}.</strong> ${escapeHtml(option)}</li>
      `).join("")}</ol>`
    : "";
  return `
    <div class="knowledge-card">
      <div class="knowledge-prompt">${escapeHtml(question.prompt)}</div>
      ${optionHtml}
      <div><strong>标准答案：</strong>${escapeHtml(formatAnswer(question))}</div>
      <div><strong>来源：</strong>${escapeHtml(question.sourcePoint)}</div>
    </div>
  `;
}

function renderWrongReviewSummary(summary) {
  return `
    <div class="exam-summary">
      <strong>本次共 ${escapeHtml(summary.total)} 题</strong>
      <div>两轮全对并移出：${escapeHtml(summary.removed)} 题</div>
      <div>继续保留在错题本：${escapeHtml(summary.kept)} 题</div>
      <div>完成时间：${escapeHtml(formatAdminTime ? formatAdminTime(summary.completedAt) : new Date(summary.completedAt).toLocaleString("zh-CN"))}</div>
    </div>
  `;
}

function applySelectedAnswer(question) {
  if (!state.selectedAnswer) return;
  if (question.type === "fill_blank") {
    const input = els.answerForm.querySelector("[name='answer']");
    if (input) input.value = state.selectedAnswer;
    return;
  }
  if (question.type === "multiple_choice") {
    const selected = normalizeChoiceAnswer(state.selectedAnswer);
    els.answerForm.querySelectorAll("[name='answer']").forEach((input) => {
      input.checked = selected.includes(input.value);
    });
    return;
  }
  const input = els.answerForm.querySelector(`[name='answer'][value="${CSS.escape(state.selectedAnswer)}"]`);
  if (input) input.checked = true;
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

  const answer = getFormAnswer(question);

  if (!answer) {
    showFeedback(false, "先写一个答案再提交。", question);
    return;
  }

  const correct = isCorrect(question, answer);
  state.selectedAnswer = answer;
  state.answered = true;
  state.currentResult = { correct, label: correct ? "答对了" : "答错了" };
  recordAttempt(question, answer, correct);
  recordWrongReviewAnswer(question, correct);
  if (state.mode === "exam" && state.examSession) {
    state.examSession.answers[question.id] = answer;
    state.examSession.results[question.id] = {
      answer,
      correct,
      score: getQuestionScore(question, correct),
      type: question.type
    };
    state.currentResult.label = correct
      ? `已记录：答对了，本题 ${getQuestionScore(question, correct)} 分`
      : "已记录：答错了，本题 0 分";
  }
  showFeedback(correct, correct ? "答对了" : "答错了", question);
  if (state.mode === "exam") showFeedback(correct, state.currentResult.label, question);
  els.submitBtn.disabled = true;
  els.nextBtn.disabled = false;
  els.nextBtn.textContent = state.mode === "wrong" && state.index >= state.sessionQuestions.length - 1 ? "完成本次重刷" : "下一题";
  els.masteredBtn.hidden = state.mode === "wrong" || !state.records.wrongBook[question.id];
  els.guessedBtn.hidden = !isChapterSubject() || isCurrentAnswerGuessed();
  els.guessedBtn.disabled = isCurrentAnswerGuessed();
  saveSessionState();
  void persistRecords();
  renderStats();
  renderWrongBook();
}

function currentGuessKey() {
  const question = currentQuestion();
  return question ? `${state.mode}:${state.index}:${question.id}` : "";
}

function isCurrentAnswerGuessed() {
  const key = currentGuessKey();
  return Boolean(state.currentResult?.guessed || (key && state.guessedQuestionIds.has(key)));
}

function markCurrentAnswerGuessed() {
  const question = currentQuestion();
  if (!isChapterSubject() || !question || !state.answered || !state.currentResult || isCurrentAnswerGuessed()) return;

  const key = currentGuessKey();
  if (key) state.guessedQuestionIds.add(key);

  const lastAttemptIndex = state.records.attempts
    .map((attempt, index) => ({ attempt, index }))
    .filter((row) => row.attempt.questionId === question.id)
    .map((row) => row.index)
    .pop();
  const lastAttempt = Number.isInteger(lastAttemptIndex) ? state.records.attempts[lastAttemptIndex] : null;
  const wasCorrect = lastAttempt ? Boolean(lastAttempt.correct) : Boolean(state.currentResult.correct);
  const existingWrong = state.records.wrongBook[question.id];

  if (lastAttempt) {
    state.records.attempts[lastAttemptIndex] = {
      ...lastAttempt,
      correct: false,
      guessed: true,
      recalculatedAt: new Date().toISOString()
    };
  }

  if (wasCorrect && existingWrong?.correctAfterWrong) {
    existingWrong.correctAfterWrong = Math.max(0, existingWrong.correctAfterWrong - 1);
  }

  if (wasCorrect || !existingWrong) {
    upsertWrongBookItem(question);
  }

  if (state.mode === "wrong") {
    recordWrongReviewAnswer(question, false);
  }

  state.currentResult = {
    ...state.currentResult,
    correct: false,
    guessed: true,
    label: "已按猜题处理，加入错题本。"
  };
  saveSessionState();
  void persistRecords("已按猜题处理，加入错题本。");
  renderQuestion();
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

function getQuestionScore(question, correct) {
  if (!correct) return 0;
  return EXAM_RULES[question.type]?.score || 0;
}

function calculateExamResult(autoSubmitted = false) {
  const answers = state.examSession?.answers || {};
  const rows = state.sessionQuestions.map((question) => {
    const answer = answers[question.id] || "";
    const correct = answer ? isCorrect(question, answer) : false;
    return {
      questionId: question.id,
      type: question.type,
      answer,
      correct,
      score: getQuestionScore(question, correct)
    };
  });
  const score = rows.reduce((sum, row) => sum + row.score, 0);
  const submittedAt = new Date().toISOString();
  const startedAt = state.examSession?.startedAt || submittedAt;
  const usedSeconds = Math.min(EXAM_DURATION_SECONDS, Math.max(0, Math.floor((new Date(submittedAt) - new Date(startedAt)) / 1000)));
  return {
    examSet: state.examSet,
    score,
    maxScore: getExamMaxScore(),
    usedSeconds,
    autoSubmitted,
    submittedAt,
    startedAt,
    answers: rows
  };
}

function finishExam(autoSubmitted = false) {
  if (state.mode !== "exam" || !state.examSession || state.examSession.submittedAt) return;
  captureDraftAnswer();
  stopExamTimer();
  const result = calculateExamResult(autoSubmitted);
  state.examSession.submittedAt = result.submittedAt;
  state.records.examResults[state.examSet] = result;
  state.index = state.sessionQuestions.length;
  state.answered = false;
  state.selectedAnswer = "";
  state.currentResult = null;
  clearSessionState();
  void persistRecords(autoSubmitted ? "时间到，模拟考试已自动交卷。" : "模拟考试已交卷。");
  setupSetSelect();
  render();
  showExamResult(result);
}

function showExamResult(result) {
  els.feedback.hidden = false;
  els.feedback.className = "feedback correct";
  els.feedback.innerHTML = `
    <div class="exam-summary">
      <strong>第 ${escapeHtml(result.examSet)} 套：${escapeHtml(result.score)} / ${escapeHtml(result.maxScore)} 分</strong>
      <div>用时：${escapeHtml(formatDuration(result.usedSeconds))}${result.autoSubmitted ? " · 时间到自动交卷" : ""}</div>
      <div>单选 50 题每题 0.5 分，多选 25 题每题 1 分，判断 20 题每题 1 分。</div>
    </div>
  `;
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
  if (state.mode === "exam" && state.index >= state.sessionQuestions.length - 1) {
    finishExam(false);
    return;
  }
  if (state.mode === "wrong" && state.index >= state.sessionQuestions.length - 1) {
    finishWrongReview();
    return;
  }
  if (state.index < state.sessionQuestions.length - 1) {
    state.index += 1;
    state.answered = false;
    state.selectedAnswer = "";
    state.currentResult = null;
    saveSessionState();
    void persistRecords();
    renderQuestion();
  } else {
    state.index += 1;
    state.answered = false;
    state.selectedAnswer = "";
    state.currentResult = null;
    saveSessionState();
    void persistRecords();
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
      <button type="button" data-review="${escapeHtml(item.questionId)}">选这题重刷</button>
    </div>
  `).join("") : '<p class="empty">暂时没有错题。答错后会自动归纳到这里。</p>';
}

function jumpToWrongQuestion(questionId) {
  const question = getQuestionById(questionId);
  if (!question) return;
  stopExamTimer();
  state.mode = "wrong-select";
  state.sessionQuestions = [];
  state.index = 0;
  state.answered = false;
  state.selectedAnswer = "";
  state.currentResult = null;
  state.examSession = null;
  state.wrongReviewSession = null;
  state.wrongReviewSelection = new Set([question.id]);
  state.wrongReviewFilter = "all";
  setupSetSelect();
  updateModeButtons();
  saveSessionState();
  void persistRecords();
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
  renderAnswerSuggestions("正在加载其他用户修正情况...");
  els.answerDialog.showModal();
  void loadAnswerSuggestions(question);
}

async function loadAnswerSuggestions(question) {
  if (!supabaseClient || !state.session?.user) {
    renderAnswerSuggestions("当前未连接云端，无法加载其他用户修正情况。");
    return;
  }
  try {
    const data = await invokeAdmin("answerOverrideSuggestions", {
      subject: state.subject,
      questionId: question.id
    });
    const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
    if (!suggestions.length) {
      renderAnswerSuggestions("暂无其他用户修改这道题的答案。");
      return;
    }
    els.answerSuggestions.innerHTML = suggestions.map((item) => `
      <div class="answer-suggestion-item">
        <strong>${escapeHtml(item.displayName || item.studentId || "匿名用户")}</strong>
        <span>${escapeHtml(formatAnswerValue(question, item.answer || "", Array.isArray(item.keywords) ? item.keywords : []))}</span>
        <small>${escapeHtml(formatAdminTime(item.updatedAt))}</small>
      </div>
    `).join("");
  } catch (error) {
    renderAnswerSuggestions(error.message || "加载其他用户修正情况失败。");
  }
}

function renderAnswerSuggestions(message) {
  if (!els.answerSuggestions) return;
  els.answerSuggestions.innerHTML = `<p class="empty">${escapeHtml(message)}</p>`;
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
  if (!restoreSessionState()) {
    state.mode = "set";
    setupSetSelect();
    startSet(state.set);
  }
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
    setStatus(els.adminStatus, "正在加载账号与刷题进度...");
    const data = await invokeAdmin("usageSummary");
    renderAdminUsers(data.users || []);
    setStatus(els.adminStatus, `已加载 ${data.users?.length || 0} 个账号，${data.totalRecords || 0} 条云端记录。`, "ok");
  } catch (error) {
    setStatus(els.adminStatus, error.message || "加载失败。", "error");
  }
}

function formatAdminTime(value) {
  if (!value) return "无";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "无";
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatSubjectUsage(label, usage = {}) {
  return `
    <span>${label}：${usage.attempts || 0}题 · 正确率${usage.accuracy || 0}% · 错题${usage.wrongBook || 0} · 修正${usage.answerOverrides || 0}${usage.examsDone ? ` · 模拟${usage.examsDone}` : ""}</span>
  `;
}

function renderAdminUsers(users) {
  els.adminUsers.innerHTML = users.length ? users.map((user) => {
    const mayuan = user.usage?.subjects?.mayuan || {};
    const mayuanSync = user.usage?.subjects?.mayuan_sync || {};
    return `
    <div class="admin-user">
      <div>
        <strong>${escapeHtml(user.student_id)}${user.display_name ? ` · ${escapeHtml(user.display_name)}` : ""}</strong>
        <span>${user.role === "admin" ? "管理员" : "普通账号"} · ${user.is_active ? "已启用" : "已停用"}</span>
        <div class="admin-user-progress">
          ${formatSubjectUsage("马原", mayuan)}
          ${formatSubjectUsage("马原同步练", mayuanSync)}
          <span>最近使用：${escapeHtml(formatAdminTime(user.usage?.latest))}${user.has_record ? "" : " · 尚无云端记录"}</span>
        </div>
      </div>
      <div class="admin-user-actions">
        <button type="button" data-admin-action="reset" data-student-id="${escapeHtml(user.student_id)}">重置密码</button>
        <button type="button" data-admin-action="toggle" data-student-id="${escapeHtml(user.student_id)}" data-active="${user.is_active ? "true" : "false"}">${user.is_active ? "停用" : "启用"}</button>
      </div>
    </div>
  `;
  }).join("") : '<p class="empty">还没有账号。</p>';
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

function handleWrongReviewClick(event) {
  if (state.mode !== "wrong-select") return;
  const button = event.target.closest("[data-wrong-review-action]");
  if (!button) return;
  event.preventDefault();

  if (button.dataset.wrongReviewAction === "select-visible") {
    for (const item of visibleWrongReviewItems()) {
      state.wrongReviewSelection.add(item.questionId);
    }
    saveSessionState();
    void persistRecords();
    renderQuestion();
  }

  if (button.dataset.wrongReviewAction === "select-unit") {
    selectWrongReviewUnit();
  }

  if (button.dataset.wrongReviewAction === "clear") {
    state.wrongReviewSelection.clear();
    saveSessionState();
    void persistRecords();
    renderQuestion();
  }

  if (button.dataset.wrongReviewAction === "start") {
    startSelectedWrongReview();
  }

  if (button.dataset.wrongReviewAction === "toggle-knowledge") {
    const questionId = button.dataset.questionId;
    if (!questionId) return;
    if (state.wrongReviewKnowledgeOpen.has(questionId)) {
      state.wrongReviewKnowledgeOpen.delete(questionId);
    } else {
      state.wrongReviewKnowledgeOpen.add(questionId);
    }
    renderQuestion();
  }
}

function handleWrongReviewChange(event) {
  if (state.mode !== "wrong-select") return false;
  const target = event.target;

  if (target.matches("[data-wrong-review-filter]")) {
    state.wrongReviewFilter = target.value;
    saveSessionState();
    void persistRecords();
    renderQuestion();
    return true;
  }

  if (target.matches("[data-wrong-review-unit]")) {
    state.wrongReviewUnitFilter = target.value;
    saveSessionState();
    schedulePersistRecords();
    return true;
  }

  if (target.matches("[name='wrongReviewPick']")) {
    if (target.checked) state.wrongReviewSelection.add(target.value);
    else state.wrongReviewSelection.delete(target.value);
    saveSessionState();
    schedulePersistRecords();
    renderQuestion();
    return true;
  }

  return false;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function applyTheme(isDark) {
  document.body.classList.toggle("dark-mode", Boolean(isDark));
  if (els.darkModeToggle) els.darkModeToggle.checked = Boolean(isDark);
}

function initTheme() {
  let isDark = false;
  try {
    isDark = localStorage.getItem(THEME_STORAGE_KEY) === "1";
  } catch {
    isDark = false;
  }
  applyTheme(isDark);
}

function setTheme(isDark) {
  applyTheme(isDark);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? "1" : "0");
  } catch {
    // localStorage can be unavailable in some private browsing contexts.
  }
}

function bindEvents() {
  els.loginForm.addEventListener("submit", handleLogin);
  els.darkModeToggle?.addEventListener("change", () => setTheme(els.darkModeToggle.checked));
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
  els.setSelect.addEventListener("change", () => {
    if (state.mode === "exam") startExam(els.setSelect.value);
    else startSet(els.setSelect.value);
  });
  els.setModeBtn.addEventListener("click", () => startSet(state.set));
  els.examModeBtn.addEventListener("click", () => startExam(state.examSet));
  els.choiceModeBtn.addEventListener("click", startChoicePractice);
  els.randomModeBtn.addEventListener("click", startRandom);
  els.wrongModeBtn.addEventListener("click", startWrongPractice);
  els.submitBtn.addEventListener("click", submitAnswer);
  els.nextBtn.addEventListener("click", nextQuestion);
  els.masteredBtn.addEventListener("click", markMastered);
  els.guessedBtn.addEventListener("click", markCurrentAnswerGuessed);
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
  els.answerForm.addEventListener("click", handleWrongReviewClick);
  els.answerForm.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!state.answered) submitAnswer();
      else nextQuestion();
    }
  });
  els.answerForm.addEventListener("input", () => {
    if (state.mode === "wrong-select") return;
    if (!currentQuestion() || state.answered) return;
    captureDraftAnswer();
    saveSessionState();
    schedulePersistRecords();
  });
  els.answerForm.addEventListener("change", (event) => {
    if (handleWrongReviewChange(event)) return;
    if (!currentQuestion() || state.answered) return;
    captureDraftAnswer();
    saveSessionState();
    schedulePersistRecords();
  });
}

initTheme();
bindEvents();
void initAuth();
