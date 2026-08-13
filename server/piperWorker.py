import sys
import json
import os
import wave
from piper import PiperVoice


BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


VOICES = {
    "english": {
        "id": "en_US-bryce-medium",
        "model": os.path.join(
            BASE_DIR,
            "voices",
            "en_US-bryce-medium.onnx"
        )
    },

    "hindi": {
        "id": "hi_IN-pratham-medium",
        "model": os.path.join(
            BASE_DIR,
            "voices",
            "hi_IN-pratham-medium.onnx"
        )
    }
}


voices = {}


# =========================================
# LOG TO STDERR
# =========================================

def log(message):
    print(
        message,
        file=sys.stderr,
        flush=True
    )


# =========================================
# LOAD VOICES ONCE
# =========================================

def load_voices():

    log("Loading ARES voices...")

    for language, config in VOICES.items():

        model = config["model"]

        if not os.path.exists(model):

            raise FileNotFoundError(
                f"Voice model not found: {model}"
            )

        log(
            f"Loading {config['id']}..."
        )

        voices[language] = (
            PiperVoice.load(model)
        )

        log(
            f"{config['id']} loaded"
        )

    log(
        "ARES voices ready"
    )


# =========================================
# GENERATE WAV
# =========================================

def generate_voice(
    text,
    language,
    output
):

    if language not in voices:

        raise ValueError(
            f"Unknown language: {language}"
        )

    voice = voices[language]

    output_dir = os.path.dirname(
        os.path.abspath(output)
    )

    os.makedirs(
        output_dir,
        exist_ok=True
    )

    # -------------------------------------
    # IMPORTANT:
    # Always create a NEW WAV file.
    # -------------------------------------

    with wave.open(
        output,
        "wb"
    ) as wav_file:

        voice.synthesize_wav(
            text,
            wav_file
        )

    # -------------------------------------
    # Verify file
    # -------------------------------------

    if not os.path.exists(output):

        raise RuntimeError(
            "Piper did not create WAV file"
        )

    size = os.path.getsize(
        output
    )

    if size < 1000:

        raise RuntimeError(
            f"WAV file is too small: {size} bytes"
        )

    return size


# =========================================
# MAIN WORKER
# =========================================

def main():

    # -------------------------------------
    # LOAD MODELS ONLY ONCE
    # -------------------------------------

    load_voices()

    # -------------------------------------
    # SIGNAL READY
    # -------------------------------------

    log(
        "ARES voices ready"
    )

    # -------------------------------------
    # WAIT FOR NODE REQUESTS
    # -------------------------------------

    for line in sys.stdin:

        line = line.strip()

        if not line:
            continue

        try:

            request = json.loads(
                line
            )

            text = request.get(
                "text",
                ""
            ).strip()

            language = request.get(
                "language"
            )

            output = request.get(
                "output"
            )

            # -----------------------------
            # VALIDATE
            # -----------------------------

            if not text:

                raise ValueError(
                    "Text is required"
                )

            if language not in VOICES:

                raise ValueError(
                    f"Unsupported language: {language}"
                )

            if not output:

                raise ValueError(
                    "Output path is required"
                )

            # -----------------------------
            # GENERATION
            # -----------------------------

            log(
                f"Generating {language} voice..."
            )

            size = generate_voice(
                text,
                language,
                output
            )

            # -----------------------------
            # RESPONSE
            # -----------------------------

            response = {
                "success": True,
                "output": output,
                "language": language,
                "voice": VOICES[
                    language
                ]["id"],
                "size": size
            }

            print(
                json.dumps(
                    response,
                    ensure_ascii=False
                ),
                flush=True
            )

        except Exception as error:

            response = {
                "success": False,
                "error": str(error)
            }

            print(
                json.dumps(
                    response,
                    ensure_ascii=False
                ),
                flush=True
            )


# =========================================
# START
# =========================================

if __name__ == "__main__":
    main()