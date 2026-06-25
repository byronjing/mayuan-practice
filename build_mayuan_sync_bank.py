#!/usr/bin/env python3
"""Build the Mayuan sync question bank from the DOCX source.

The converter intentionally fails closed. It checks answer counts and validates
each question's inline answer marker against the reference-answer block before
writing the generated question bank.
"""

from __future__ import annotations

import json
import re
import sys
from collections import OrderedDict
from pathlib import Path

from docx import Document


SOURCE_DOCX = Path("/Users/zhoujing/Downloads/马原机考题库(1)..docx")
OUT_JS = Path("mayuan_sync_questions.js")
OUT_AUDIT = Path("mayuan_sync_questions.audit.json")
INLINE_MISMATCH_OVERRIDES = {
    ("第一章", "multiple_choice", 45): "source inline marker is 1345/ACDE, but reference answer ABDE matches the option content; C says people can perfect laws.",
}

UNIT_RE = re.compile(r"^(绪论练习题|第[一二三四五六七八九十]+章课后练习题)$")
QUESTION_RE = re.compile(r"^\s*(\d+)\s*[．.、]\s*(.+)$")
TYPE_MARKERS = {
    "单项选择题": "single_choice",
    "[单项选择题]": "single_choice",
    "多项选择题": "multiple_choice",
    "[多项选择题]": "multiple_choice",
}
ANSWER_LETTERS = "ABCDE"


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.replace("\u3000", " ")).strip()


def normalize_unit(value: str) -> str:
    value = value.replace("课后练习题", "").replace("练习题", "")
    return normalize_text(value)


def answer_from_token(token: str) -> str:
    token = normalize_text(token).upper()
    if re.fullmatch(r"[1-5]+", token):
        return "".join(ANSWER_LETTERS[int(char) - 1] for char in token)
    if re.fullmatch(r"[A-E]+", token):
        return token
    raise ValueError(f"unsupported answer token: {token}")


def normalize_answer(token: str, qtype: str) -> str:
    answer = answer_from_token(token)
    letters = []
    for char in answer:
        if char not in ANSWER_LETTERS:
            raise ValueError(f"illegal answer option: {token}")
        if char not in letters:
            letters.append(char)
    normalized = "".join(letters)
    if qtype == "single_choice" and len(normalized) != 1:
        raise ValueError(f"single-choice answer must have one option: {token}")
    if qtype == "multiple_choice" and len(normalized) < 2:
        raise ValueError(f"multiple-choice answer must have at least two options: {token}")
    return normalized


def extract_inline_answer(question_text: str) -> tuple[str, str | None]:
    text = normalize_text(question_text)
    match = re.match(r"^(.*?)(?:[\s.．:：。；;、]*)(([A-E]{1,5})|([1-5]{1,5}))$", text, flags=re.I)
    if not match:
        return text, None
    stem = normalize_text(match.group(1))
    token = match.group(2).upper()
    if not stem:
        return text, None
    return stem, token


OPTION_MARKER_RE = re.compile(r"([A-E])(?:\s*[.．、，,]|\s+)", flags=re.I)


def split_body_and_options(body: str) -> tuple[str, list[str]]:
    text = normalize_text(body)
    matches = list(OPTION_MARKER_RE.finditer(text))
    if not matches:
        return text, []
    first = next((match for match in matches if match.group(1).upper() == "A"), matches[0])
    if first.group(1).upper() != "A":
        return text, []
    return normalize_text(text[:first.start()]), [normalize_text(text[first.start():])]


def parse_options(lines: list[str]) -> tuple[list[str], list[str]]:
    text = normalize_text(" ".join(lines))
    matches = list(OPTION_MARKER_RE.finditer(text))
    repairs = []
    if matches and matches[0].group(1).upper() != "A":
        prefix = normalize_text(text[:matches[0].start()])
        labels = [match.group(1).upper() for match in matches]
        if prefix and labels == list(ANSWER_LETTERS[1:len(matches) + 1]):
            repairs.append("missing A option marker repaired from text before B")
            synthetic = [type("SyntheticMatch", (), {"group": lambda self, _idx: "A", "end": lambda self: 0, "start": lambda self: 0})()]
            matches = synthetic + matches
    if len(matches) < 4 or len(matches) > 5:
        raise ValueError(f"expected 4 or 5 options, found {len(matches)} in: {text[:160]}")
    labels = [match.group(1).upper() for match in matches]
    expected = list(ANSWER_LETTERS[:len(labels)])
    reorder_by_label = False
    if labels != expected:
        if sorted(labels) == expected:
            repairs.append(f"option labels reordered from {''.join(labels)} to {''.join(expected)}")
            reorder_by_label = True
        else:
            missing = [label for label in expected if label not in labels]
            if len(missing) == 1 and len(set(labels)) == len(labels) - 1:
                repairs.append(f"duplicate/missing option label repaired by position: {''.join(labels)} -> {''.join(expected)}")
            else:
                raise ValueError(f"options are not {''.join(expected)} in order: {labels}")
    options = []
    for index, match in enumerate(matches):
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        option = normalize_text(text[start:end])
        if not option:
            raise ValueError(f"empty option {labels[index]} in: {text[:160]}")
        options.append(option)
    if reorder_by_label:
        by_label = {label: option for label, option in zip(labels, options)}
        options = [by_label[label] for label in expected]
    return options, repairs


def parse_reference_answers(lines: list[str], qtype: str) -> tuple[OrderedDict[int, str], list[str]]:
    text = normalize_text(" ".join(lines))
    pattern = re.compile(r"(\d+)\s*([A-E]{1,5}|[1-5]{1,5})", flags=re.I)
    answers: OrderedDict[int, str] = OrderedDict()
    duplicates = []
    repairs = []
    previous = 0
    for match in pattern.finditer(text):
        raw_number = match.group(1)
        number = int(raw_number)
        expected_next = previous + 1
        if previous and number != expected_next and len(raw_number) < len(str(expected_next)) and str(expected_next).endswith(raw_number):
            repairs.append(f"answer number {raw_number} repaired to {expected_next}")
            number = expected_next
        if number in answers:
            duplicates.append(number)
        answers[number] = normalize_answer(match.group(2), qtype)
        previous = number
    if duplicates:
        raise ValueError(f"duplicate answers for questions: {duplicates}")
    return answers, repairs


def blank_unit_bucket() -> dict[str, list | dict]:
    return {
        "single_choice": [],
        "multiple_choice": [],
        "answers": {
            "single_choice": OrderedDict(),
            "multiple_choice": OrderedDict(),
        },
        "answerRepairs": {
            "single_choice": [],
            "multiple_choice": [],
        },
    }


def read_source() -> tuple[OrderedDict[str, dict], list[str]]:
    paragraphs = [normalize_text(p.text) for p in Document(SOURCE_DOCX).paragraphs]
    paragraphs = [p for p in paragraphs if p]

    units: OrderedDict[str, dict] = OrderedDict()
    current_unit = None
    current_type = None
    current_question = None
    answer_unit = None
    answer_type = None
    answer_lines: list[str] = []
    errors: list[str] = []

    def finish_question() -> None:
        nonlocal current_question
        if current_unit and current_type and current_question:
            units[current_unit][current_type].append(current_question)
        current_question = None

    def finish_answers() -> None:
        nonlocal answer_unit, answer_type, answer_lines
        if not answer_unit or not answer_type:
            answer_lines = []
            return
        try:
            answers, repairs = parse_reference_answers(answer_lines, answer_type)
            units[answer_unit]["answers"][answer_type] = answers
            units[answer_unit]["answerRepairs"][answer_type] = repairs
        except Exception as exc:  # noqa: BLE001 - collect all audit failures.
            errors.append(f"{answer_unit}/{answer_type}: {exc}")
        answer_unit = None
        answer_type = None
        answer_lines = []

    def make_question(number: str, body: str) -> dict:
        stem_body, option_lines = split_body_and_options(body)
        stem, inline_answer = extract_inline_answer(stem_body)
        return {
            "number": int(number),
            "stem": stem,
            "inlineAnswer": inline_answer,
            "optionLines": option_lines,
        }

    for raw in paragraphs:
        unit_match = UNIT_RE.match(raw)
        if unit_match:
            finish_question()
            finish_answers()
            current_unit = normalize_unit(raw)
            units.setdefault(current_unit, blank_unit_bucket())
            current_type = None
            continue

        if raw in TYPE_MARKERS:
            finish_question()
            finish_answers()
            current_type = TYPE_MARKERS[raw]
            continue

        if raw == "参考答案" or raw in {"单项选择题参考答案", "多项选择题参考答案"}:
            finish_question()
            finish_answers()
            if not current_unit:
                errors.append(f"answer block without unit: {raw}")
                continue
            if raw == "单项选择题参考答案":
                answer_type = "single_choice"
            elif raw == "多项选择题参考答案":
                answer_type = "multiple_choice"
            else:
                answer_type = current_type
            if not answer_type:
                errors.append(f"answer block without type in {current_unit}: {raw}")
                continue
            answer_unit = current_unit
            answer_lines = []
            current_type = None
            continue

        if answer_unit and answer_type:
            answer_lines.append(raw)
            continue

        question_match = QUESTION_RE.match(raw)
        if current_unit and current_type and question_match:
            finish_question()
            current_question = make_question(question_match.group(1), question_match.group(2))
            continue

        if current_question:
            embedded = re.search(rf"\s+({current_question['number'] + 1})\s*[．.、]\s*(.+)$", raw)
            if embedded:
                prefix = normalize_text(raw[:embedded.start()])
                if prefix:
                    current_question["optionLines"].append(prefix)
                finish_question()
                current_question = make_question(embedded.group(1), embedded.group(2))
            else:
                current_question["optionLines"].append(raw)

    finish_question()
    finish_answers()
    return units, errors


def make_knowledge_id(unit: str) -> str:
    return f"mayuan-sync-{unit}"


def make_questions(units: OrderedDict[str, dict], errors: list[str]) -> tuple[list[dict], dict]:
    questions = []
    audit = {
        "source": str(SOURCE_DOCX),
        "totalQuestions": 0,
        "units": OrderedDict(),
        "errors": errors,
        "manualSamples": [],
    }

    for unit_index, (unit, bucket) in enumerate(units.items(), start=1):
        audit["units"][unit] = OrderedDict()
        for qtype in ("single_choice", "multiple_choice"):
            rows = bucket[qtype]
            answers: OrderedDict[int, str] = bucket["answers"][qtype]
            numbers = [row["number"] for row in rows]
            answer_numbers = list(answers.keys())
            missing = [number for number in numbers if number not in answers]
            extra = [number for number in answer_numbers if number not in numbers]
            expected_numbers = list(range(1, len(rows) + 1))
            non_contiguous = numbers != expected_numbers
            if len(rows) != len(answers):
                errors.append(f"{unit}/{qtype}: question count {len(rows)} != answer count {len(answers)}")
            if missing:
                errors.append(f"{unit}/{qtype}: missing answers {missing}")
            if extra:
                errors.append(f"{unit}/{qtype}: extra answers {extra}")
            if non_contiguous:
                errors.append(f"{unit}/{qtype}: question numbers are not contiguous: {numbers[:12]}...")

            audit["units"][unit][qtype] = {
                "questionCount": len(rows),
                "answerCount": len(answers),
                "questionRange": [numbers[0], numbers[-1]] if numbers else [],
                "answerRange": [answer_numbers[0], answer_numbers[-1]] if answer_numbers else [],
                "missingAnswers": missing,
                "extraAnswers": extra,
                "nonContiguousQuestions": non_contiguous,
                "answerRepairs": bucket["answerRepairs"][qtype],
            }

            for row in rows:
                answer = answers.get(row["number"])
                if not answer:
                    continue
                try:
                    options, option_repairs = parse_options(row["optionLines"])
                    normalized_answer = normalize_answer(answer, qtype)
                except Exception as exc:  # noqa: BLE001 - collect all audit failures.
                    errors.append(f"{unit}/{qtype}/{row['number']}: {exc}")
                    continue
                for letter in normalized_answer:
                    option_index = ord(letter) - ord("A")
                    if option_index >= len(options):
                        errors.append(
                            f"{unit}/{qtype}/{row['number']}: answer {normalized_answer} "
                            f"references option {letter}, but only {len(options)} options exist"
                        )
                        continue

                inline_answer = row["inlineAnswer"]
                if inline_answer:
                    try:
                        normalized_inline = normalize_answer(inline_answer, qtype)
                    except Exception as exc:  # noqa: BLE001
                        errors.append(f"{unit}/{qtype}/{row['number']}: invalid inline answer {inline_answer}: {exc}")
                    else:
                        if normalized_inline != normalized_answer:
                            override_reason = INLINE_MISMATCH_OVERRIDES.get((unit, qtype, row["number"]))
                            if override_reason:
                                audit["units"][unit][qtype].setdefault("inlineAnswerOverrides", []).append({
                                    "questionNumber": row["number"],
                                    "inlineAnswer": normalized_inline,
                                    "referenceAnswer": normalized_answer,
                                    "reason": override_reason,
                                })
                            else:
                                errors.append(
                                    f"{unit}/{qtype}/{row['number']}: inline answer {normalized_inline} "
                                    f"!= reference answer {normalized_answer}"
                                )

                answer_text = "；".join(
                    f"{letter}. {options[ord(letter) - ord('A')]}" for letter in normalized_answer
                )
                question_number = len(questions) + 1
                if option_repairs:
                    audit["units"][unit][qtype].setdefault("optionRepairs", []).append({
                        "questionNumber": row["number"],
                        "repairs": option_repairs,
                    })
                questions.append({
                    "id": f"MYS-{question_number:03d}",
                    "set": unit_index,
                    "title": f"{unit} 第{row['number']}题",
                    "chapter": unit,
                    "priority": "blue",
                    "sourcePoint": "马原机考题库(1)..docx",
                    "knowledgeId": make_knowledge_id(unit),
                    "type": qtype,
                    "prompt": row["stem"],
                    "options": options,
                    "answer": normalized_answer,
                    "explanation": f"来自《马原机考题库(1)..docx》{unit}。正确答案：{answer_text}。",
                })

        unit_questions = [question for question in questions if question["chapter"] == unit]
        if unit_questions:
            for qtype in ("single_choice", "multiple_choice"):
                typed = [question for question in unit_questions if question["type"] == qtype]
                if typed:
                    audit["manualSamples"].append({
                        "unit": unit,
                        "type": qtype,
                        "position": "first",
                        "id": typed[0]["id"],
                        "title": typed[0]["title"],
                        "answer": typed[0]["answer"],
                        "prompt": typed[0]["prompt"],
                    })
                    audit["manualSamples"].append({
                        "unit": unit,
                        "type": qtype,
                        "position": "last",
                        "id": typed[-1]["id"],
                        "title": typed[-1]["title"],
                        "answer": typed[-1]["answer"],
                        "prompt": typed[-1]["prompt"],
                    })

    audit["totalQuestions"] = len(questions)
    return questions, audit


def write_outputs(questions: list[dict], audit: dict) -> None:
    OUT_AUDIT.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    body = json.dumps(questions, ensure_ascii=False, indent=2)
    OUT_JS.write_text(f"const MAYUAN_SYNC_QUESTIONS = {body};\n", encoding="utf-8")


def main() -> int:
    if not SOURCE_DOCX.exists():
        print(f"Source DOCX not found: {SOURCE_DOCX}", file=sys.stderr)
        return 1

    units, parse_errors = read_source()
    questions, audit = make_questions(units, parse_errors)
    errors = audit["errors"]
    if errors:
        OUT_AUDIT.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("Question bank generation failed. Audit written to mayuan_sync_questions.audit.json", file=sys.stderr)
        for error in errors[:50]:
            print(f"- {error}", file=sys.stderr)
        if len(errors) > 50:
            print(f"... {len(errors) - 50} more errors", file=sys.stderr)
        return 1

    write_outputs(questions, audit)
    print(f"Generated {OUT_JS} with {len(questions)} questions.")
    print(f"Wrote {OUT_AUDIT}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
