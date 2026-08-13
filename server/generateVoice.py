import sys
import json
import os
import wave
import argparse

from piper import PiperVoice


# =========================================
# FORCE UTF-8
# =========================================

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass


# =========================================
# ARGUMENTS
# =========================================

parser = argparse.ArgumentParser(
    description="ARES Piper Voice Generator"
)

parser.add_argument(
    "--text",
    required=True
)

parser.add_argument(
    "--language",
    required=True,
    choices=["english", "hindi"]
)

parser.add_argument(
    "--model",
    required=True
)

parser.add_argument(
    "--output",
    required=True
)

args = parser.parse_args()


# =========================================
# VALUES
# =========================================

text = args.text
language = args.language
model_path = args.model
output_file = args.output


# =========================================
# VERIFY MODEL
# =========================================

if not os.path.exists(model_path):
    print(
        f"Model not found: {model_path}",
        file=sys.stderr,
        flush=True
    )

    print(
        json.dumps({
            "success": False,
            "error": f"Model not found: {model_path}"
        }),
        flush=True
    )

    sys.exit(1)


# =========================================
# SELECT VOICE NAME
# =========================================

if language == "hindi":
    voice_name = "hi_IN-pratham-medium"
else:
    voice_name = "en_US-bryce-medium"


# =========================================
# GENERATE
# =========================================

try:

    print(
        "Loading Piper voice...",
        file=sys.stderr,
        flush=True
    )

    print(
        f"Voice: {voice_name}",
        file=sys.stderr,
        flush=True
    )

    print(
        f"Language: {language}",
        file=sys.stderr,
        flush=True
    )

    print(
        f"Model: {model_path}",
        file=sys.stderr,
        flush=True
    )

    voice = PiperVoice.load(
        model_path
    )

    print(
        "Piper voice loaded.",
        file=sys.stderr,
        flush=True
    )


    # =====================================
    # OUTPUT DIRECTORY
    # =====================================

    output_directory = os.path.dirname(
        os.path.abspath(output_file)
    )

    os.makedirs(
        output_directory,
        exist_ok=True
    )


    # =====================================
    # GENERATE WAV
    # =====================================

    print(
        "Generating WAV...",
        file=sys.stderr,
        flush=True
    )

    with wave.open(
        output_file,
        "wb"
    ) as wav_file:

        voice.synthesize_wav(
            text,
            wav_file
        )


    # =====================================
    # VERIFY WAV
    # =====================================

    if not os.path.exists(
        output_file
    ):
        raise RuntimeError(
            "Piper did not create the WAV file."
        )


    file_size = os.path.getsize(
        output_file
    )


    if file_size <= 44:
        raise RuntimeError(
            "Generated WAV file is empty."
        )


    print(
        f"WAV created successfully: {file_size} bytes",
        file=sys.stderr,
        flush=True
    )


    # =====================================
    # SUCCESS
    # =====================================

    print(
        json.dumps(
            {
                "success": True,
                "output": output_file,
                "voice": voice_name,
                "language": language,
                "size": file_size
            },
            ensure_ascii=False
        ),
        flush=True
    )


except Exception as error:

    print(
        f"Piper generation failed: {error}",
        file=sys.stderr,
        flush=True
    )

    print(
        json.dumps(
            {
                "success": False,
                "error": str(error)
            },
            ensure_ascii=False
        ),
        flush=True
    )

    sys.exit(1)