#!/usr/bin/env python3
"""Convert raw Azure voice metadata to the app's voice-list format."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


SCRIPT_DIR = Path(__file__).resolve().parent
# raw voice from: https://eastus.api.cognitive.microsoft.com/texttospeech/acc/v3.0-beta1/vcg/voices
DEFAULT_INPUT = SCRIPT_DIR / "raw-voices.json"
DEFAULT_OUTPUT = SCRIPT_DIR / "voice-list-2.json"
CHINESE_LOCALE_PREFIX = "zh-"


STATUS_MAP = {
    "PublicGA": "GA",
    "PublicPreview": "Preview",
    "PublicDeprecated": "Deprecated",
}


VOICE_TAG_MAP = {
    "tailoredScenarios": "TailoredScenarios",
    "voicePersonalities": "VoicePersonalities",
}


def split_list(value: Any) -> list[str]:
    if isinstance(value, list):
        items = value
    elif isinstance(value, str):
        items = value.split(",")
    else:
        return []

    return [str(item).strip() for item in items if str(item).strip()]


def non_default_list(value: Any) -> list[str]:
    return [item for item in split_list(value) if item != "Default"]


def voice_tags(raw_voice: dict[str, Any], properties: dict[str, Any]) -> dict[str, list[str]]:
    tags: dict[str, list[str]] = {}

    for tag in raw_voice.get("voiceTags", []):
        mapped_name = VOICE_TAG_MAP.get(tag.get("name"))
        if mapped_name:
            values = split_list(tag.get("tags"))
            if values:
                tags[mapped_name] = values

    fallbacks = {
        "TailoredScenarios": properties.get("TailoredScenarios"),
        "VoicePersonalities": properties.get("Personality"),
    }
    for key, value in fallbacks.items():
        if key not in tags:
            values = split_list(value)
            if values:
                tags[key] = values

    return tags


def convert_voice(raw_voice: dict[str, Any]) -> dict[str, Any]:
    properties = raw_voice.get("properties", {})

    converted: dict[str, Any] = {
        "Name": raw_voice.get("name"),
        "DisplayName": properties.get("DisplayName"),
        "LocalName": properties.get("LocalName"),
        "ShortName": properties.get("ShortName") or raw_voice.get("shortName"),
        "Gender": properties.get("Gender"),
        "Locale": raw_voice.get("locale"),
        "LocaleName": properties.get("LocaleDescription"),
    }

    style_list = non_default_list(properties.get("VoiceStyleNames"))
    if style_list:
        converted["StyleList"] = style_list

    role_play_list = non_default_list(properties.get("VoiceRoleNames"))
    if role_play_list:
        converted["RolePlayList"] = role_play_list

    converted.update(
        {
            "SampleRateHertz": properties.get("SampleRateHertz"),
            "VoiceType": properties.get("FrontendVoiceType"),
            "Status": STATUS_MAP.get(
                properties.get("ReleaseScope"), properties.get("ReleaseScope")
            ),
        }
    )

    tags = voice_tags(raw_voice, properties)
    if tags:
        converted["VoiceTag"] = tags

    words_per_minute = properties.get("WordsPerMinute") or raw_voice.get("wordsPerMinute")
    if words_per_minute:
        converted["WordsPerMinute"] = str(words_per_minute)

    return {key: value for key, value in converted.items() if value not in (None, "")}


def is_chinese_voice(raw_voice: dict[str, Any]) -> bool:
    locale = raw_voice.get("locale") or raw_voice.get("properties", {}).get("Locale")
    return isinstance(locale, str) and locale.startswith(CHINESE_LOCALE_PREFIX)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate voice-list-2.json from raw-voices.json."
    )
    parser.add_argument(
        "input",
        nargs="?",
        type=Path,
        default=DEFAULT_INPUT,
        help=f"Raw voice metadata JSON file. Defaults to {DEFAULT_INPUT}.",
    )
    parser.add_argument(
        "output",
        nargs="?",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"Converted voice list JSON file. Defaults to {DEFAULT_OUTPUT}.",
    )
    return parser.parse_args()


def extract_base_name(short_name: str) -> str:
    """Extract base name from ShortName, e.g. 'zh-CN-Yunxia:DragonHDFlashLatestNeural' -> 'Yunxia'."""
    # Remove locale prefix (zh-CN-)
    if short_name.startswith("zh-CN-"):
        short_name = short_name[6:]
    # Remove any colon suffix and variant numbers
    short_name = short_name.split(":")[0]
    # Remove numbers and special suffixes like "MultilingualNeural", "Neural", etc.
    # Just keep the base name
    import re
    match = re.match(r"^([A-Z][a-z]+)", short_name)
    if match:
        return match.group(1)
    return short_name


def reorder_voices_by_base_name(voices: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Re-order voices by grouping them by base name (e.g., Yunxia, Xiaoxiao).
    Groups are ordered by the reference list; within each group, original order is preserved.
    """
    voice_order = [
        # Male voices
        "Yunxia",
        "Yunxi",
        "Yunyi",
        "Yunjie",
        "Yunfan",
        "Yunhan",
        "Yunxiao",
        "Yunhao",
        "Yunfeng",
        "Yunjian",
        "Yunye",
        "Yunze",
        # Female voices
        "Xiaoyou",
        "Xiaoshuang",
        "Xiaoyi",
        "Xiaoxiao",
        "Xiaochen",
        "Xiaohan",
        "Xiaomeng",
        "Xiaoyan",
        "Xiaozhen",
        "Xiaoyu",
        "Xiaomo",
        "Xiaorou",
        "Xiaorui",
        # Broadcast voices
        "Yunyang",
        "Xiaoqiu",
        "Yunqi",
        "Xiaoyue",
    ]

    # Group voices by base name
    grouped: dict[str, list[dict[str, Any]]] = {}
    for voice in voices:
        short_name = voice.get("ShortName", "")
        base_name = extract_base_name(short_name)
        if base_name not in grouped:
            grouped[base_name] = []
        grouped[base_name].append(voice)

    # Reorder according to voice_order, then append any unknown groups
    result: list[dict[str, Any]] = []
    seen = set()
    for base_name in voice_order:
        if base_name in grouped:
            # Sort within each group by ShortName
            sorted_group = sorted(grouped[base_name], key=lambda v: v.get("ShortName", ""))
            result.extend(sorted_group)
            seen.add(base_name)

    # Append any voices with base names not in the reference order
    for base_name in sorted(grouped.keys()):
        if base_name not in seen:
            # Sort within each group by ShortName
            sorted_group = sorted(grouped[base_name], key=lambda v: v.get("ShortName", ""))
            result.extend(sorted_group)

    return result


def main() -> None:
    args = parse_args()

    with args.input.open(encoding="utf-8") as source:
        raw_voices = json.load(source)

    converted_voices = [
        convert_voice(voice) for voice in raw_voices if is_chinese_voice(voice)
    ]

    # Re-order by base name
    converted_voices = reorder_voices_by_base_name(converted_voices)

    with args.output.open("w", encoding="utf-8") as target:
        json.dump(converted_voices, target, ensure_ascii=False, indent=2)
        target.write("\n")

    print(f"Wrote {len(converted_voices)} voices to {args.output}")


if __name__ == "__main__":
    main()
