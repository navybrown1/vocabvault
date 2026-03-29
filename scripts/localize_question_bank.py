from __future__ import annotations

import json
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from deep_translator import GoogleTranslator


def batched(iterable: list[str], size: int) -> list[list[str]]:
    return [iterable[index : index + size] for index in range(0, len(iterable), size)]


def translate_unique_strings(strings: list[str], source: str = "en", target: str = "es") -> dict[str, str]:
    unique_strings = [value for value in dict.fromkeys(strings) if value]
    translated: dict[str, str] = {}
    batches = batched(unique_strings, 120)

    def translate_batch(batch_index: int, batch_values: list[str]) -> tuple[int, list[str], list[str]]:
        translator = GoogleTranslator(source=source, target=target)
        for attempt in range(4):
            try:
                batch_result = translator.translate_batch(batch_values)
                if isinstance(batch_result, str):
                    batch_result = [batch_result]
                if len(batch_result) != len(batch_values):
                    raise RuntimeError("Translation batch length mismatch.")
                return batch_index, batch_values, batch_result
            except Exception:
                if attempt == 3:
                    raise
                time.sleep(1.5 + attempt)
        raise RuntimeError("Unreachable translation failure.")

    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = [executor.submit(translate_batch, index, batch) for index, batch in enumerate(batches, start=1)]
        for completed in as_completed(futures):
            batch_index, batch_values, batch_result = completed.result()
            translated.update(zip(batch_values, batch_result))
            print(f"translated batch {batch_index}/{len(batches)}", flush=True)

    return translated


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: python localize_question_bank.py <input-json> <output-json>")

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])

    with input_path.open("r", encoding="utf-8") as handle:
        questions = json.load(handle)

    all_strings: list[str] = []
    for question in questions:
        all_strings.append(question["category"])
        all_strings.append(question["question"])
        all_strings.extend(question["choices"])
        if question.get("explanation"):
            all_strings.append(question["explanation"])

    translations = translate_unique_strings(all_strings)

    localized_questions = []
    for question in questions:
        choice_translations = [translations.get(choice, choice) for choice in question["choices"]]
        correct_index = question["choices"].index(question["correctAnswer"])
        localized_questions.append(
            {
                "id": question["id"],
                "category": translations.get(question["category"], question["category"]),
                "question": translations.get(question["question"], question["question"]),
                "choices": choice_translations,
                "correctAnswer": choice_translations[correct_index],
                "explanation": translations.get(question["explanation"], question.get("explanation", ""))
                if question.get("explanation")
                else "",
            }
        )

    with output_path.open("w", encoding="utf-8") as handle:
        json.dump(localized_questions, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


if __name__ == "__main__":
    main()
