import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = 3001;

// =========================================
// PATHS
// =========================================

const TEMP_DIR = path.join(
  __dirname,
  "temp"
);

const PYTHON_SCRIPT = path.join(
  __dirname,
  "generateVoice.py"
);

// =========================================
// CREATE TEMP DIRECTORY
// =========================================

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, {
    recursive: true,
  });
}

// =========================================
// MIDDLEWARE
// =========================================

app.use(cors());

app.use(
  express.json({
    limit: "1mb",
  })
);

// =========================================
// VOICE CONFIGURATION
// =========================================

const VOICES = {
  english: {
    id: "en_US-bryce-medium",

    model: path.join(
      __dirname,
      "voices",
      "en_US-bryce-medium.onnx"
    ),

    config: path.join(
      __dirname,
      "voices",
      "en_US-bryce-medium.onnx.json"
    ),
  },

  hindi: {
    id: "hi_IN-pratham-medium",

    model: path.join(
      __dirname,
      "voices",
      "hi_IN-pratham-medium.onnx"
    ),

    config: path.join(
      __dirname,
      "voices",
      "hi_IN-pratham-medium.onnx.json"
    ),
  },
};

// =========================================
// CHECK VOICE MODELS
// =========================================

function checkVoiceModels() {
  console.log("");
  console.log(
    "ARES voice model check"
  );

  for (const [language, voice] of Object.entries(
    VOICES
  )) {
    const modelExists =
      fs.existsSync(
        voice.model
      );

    const configExists =
      fs.existsSync(
        voice.config
      );

    const languageName =
      language === "english"
        ? "English"
        : "Hindi";

    console.log(
      `${languageName}: ${voice.id}`
    );

    console.log(
      `Model: ${
        modelExists
          ? "OK"
          : "MISSING"
      }`
    );

    console.log(
      `Config: ${
        configExists
          ? "OK"
          : "MISSING"
      }`
    );

    if (!modelExists) {
      console.error(
        `Missing model: ${voice.model}`
      );
    }

    if (!configExists) {
      console.error(
        `Missing config: ${voice.config}`
      );
    }
  }

  console.log("");
}

// =========================================
// DETECT LANGUAGE
// =========================================

function detectLanguage(text) {
  if (
    /[\u0900-\u097F]/.test(text)
  ) {
    return "hindi";
  }

  return "english";
}

// =========================================
// GET LANGUAGE FROM VOICE
// =========================================

function getLanguageFromVoice(
  voice
) {
  if (
    voice ===
    VOICES.english.id
  ) {
    return "english";
  }

  if (
    voice ===
    VOICES.hindi.id
  ) {
    return "hindi";
  }

  return null;
}

// =========================================
// WAIT FOR FILE TO BE RELEASED
// =========================================

async function waitForFileReady(
  filePath,
  attempts = 20
) {
  for (
    let i = 0;
    i < attempts;
    i++
  ) {
    try {
      const handle =
        await fs.promises.open(
          filePath,
          "r"
        );

      await handle.close();

      return true;
    } catch {
      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            100
          )
      );
    }
  }

  return false;
}

// =========================================
// SAFE DELETE
// =========================================

async function safeDelete(
  filePath
) {
  if (
    !filePath ||
    !fs.existsSync(filePath)
  ) {
    return;
  }

  for (
    let attempt = 0;
    attempt < 10;
    attempt++
  ) {
    try {
      await fs.promises.unlink(
        filePath
      );

      console.log(
        "Temporary WAV deleted"
      );

      return;
    } catch (error) {
      if (
        error.code ===
        "ENOENT"
      ) {
        return;
      }

      if (
        error.code ===
        "EBUSY" ||
        error.code ===
        "EPERM"
      ) {
        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              250
            )
        );

        continue;
      }

      console.error(
        "Temporary file delete error:",
        error
      );

      return;
    }
  }

  console.warn(
    "Could not delete temporary WAV yet:",
    filePath
  );
}

// =========================================
// GENERATE VOICE
// =========================================

function generateVoice(
  text,
  language,
  outputFile
) {
  return new Promise(
    (resolve, reject) => {
      const voice =
        VOICES[language];

      if (!voice) {
        reject(
          new Error(
            `Unknown voice language: ${language}`
          )
        );

        return;
      }

      // -------------------------------------
      // CHECK MODEL
      // -------------------------------------

      if (
        !fs.existsSync(
          voice.model
        )
      ) {
        reject(
          new Error(
            `Voice model not found: ${voice.model}`
          )
        );

        return;
      }

      // -------------------------------------
      // REMOVE OLD OUTPUT
      // -------------------------------------

      if (
        fs.existsSync(
          outputFile
        )
      ) {
        try {
          fs.unlinkSync(
            outputFile
          );
        } catch {
          // Ignore
        }
      }

      console.log("");
      console.log(
        "Starting Piper generation..."
      );

      console.log(
        `Language: ${language}`
      );

      console.log(
        `Voice: ${voice.id}`
      );

      console.log(
        `Model: ${voice.model}`
      );

      console.log(
        `Output: ${outputFile}`
      );

      // -------------------------------------
      // PYTHON ARGUMENTS
      // -------------------------------------

      const args = [
        PYTHON_SCRIPT,

        "--text",
        text,

        "--language",
        language,

        "--model",
        voice.model,

        "--output",
        outputFile,
      ];

      console.log(
        "Python arguments:"
      );

      console.log(
        args
      );

      // -------------------------------------
      // START PYTHON
      // -------------------------------------

      const startTime =
        Date.now();

      const python =
        spawn(
          "python",
          args,
          {
            cwd: __dirname,
            windowsHide: true,
          }
        );

      let stdout = "";
      let stderr = "";

      // -------------------------------------
      // PYTHON STDOUT
      // -------------------------------------

      python.stdout.on(
        "data",
        (data) => {
          const message =
            data.toString();

          stdout += message;

          const lines =
            message.split(
              /\r?\n/
            );

          for (
            const line of lines
          ) {
            if (
              line.trim()
            ) {
              console.log(
                `PYTHON: ${line}`
              );
            }
          }
        }
      );

      // -------------------------------------
      // PYTHON STDERR
      // -------------------------------------

      python.stderr.on(
        "data",
        (data) => {
          const message =
            data.toString();

          stderr += message;

          const lines =
            message.split(
              /\r?\n/
            );

          for (
            const line of lines
          ) {
            if (
              line.trim()
            ) {
              console.log(
                `PYTHON ERROR: ${line}`
              );
            }
          }
        }
      );

      // -------------------------------------
      // PYTHON PROCESS ERROR
      // -------------------------------------

      python.on(
        "error",
        (error) => {
          reject(error);
        }
      );

      // -------------------------------------
      // PYTHON PROCESS CLOSED
      // -------------------------------------

      python.on(
        "close",
        async (code) => {
          const elapsed =
            Date.now() -
            startTime;

          console.log(
            `Python process exited with code ${code}`
          );

          console.log(
            `Generation completed in ${elapsed} ms`
          );

          // ---------------------------------
          // PYTHON FAILED
          // ---------------------------------

          if (code !== 0) {
            reject(
              new Error(
                stderr ||
                  stdout ||
                  `Python process exited with code ${code}`
              )
            );

            return;
          }

          // ---------------------------------
          // WAV DOES NOT EXIST
          // ---------------------------------

          if (
            !fs.existsSync(
              outputFile
            )
          ) {
            reject(
              new Error(
                "Piper finished but did not create the WAV file."
              )
            );

            return;
          }

          // ---------------------------------
          // WAIT FOR WAV RELEASE
          // ---------------------------------

          const ready =
            await waitForFileReady(
              outputFile
            );

          if (!ready) {
            reject(
              new Error(
                "WAV file is still locked by Python."
              )
            );

            return;
          }

          // ---------------------------------
          // CHECK WAV SIZE
          // ---------------------------------

          let stats;

          try {
            stats =
              await fs.promises.stat(
                outputFile
              );
          } catch (error) {
            reject(error);

            return;
          }

          console.log(
            `WAV created: ${stats.size} bytes`
          );

          if (
            stats.size < 1000
          ) {
            reject(
              new Error(
                `Generated WAV is too small: ${stats.size} bytes`
              )
            );

            return;
          }

          console.log(
            "Piper audio generated successfully"
          );

          resolve(
            outputFile
          );
        }
      );
    }
  );
}

// =========================================
// HEALTH CHECK
// =========================================

app.get(
  "/api/voice/health",
  (req, res) => {
    res.json({
      status: "ok",

      service:
        "ARES Local Voice Server",

      engine:
        "Piper",

      ready: true,

      voices: {
        english:
          VOICES.english.id,

        hindi:
          VOICES.hindi.id,
      },
    });
  }
);

// =========================================
// AVAILABLE VOICES
// =========================================

app.get(
  "/api/voice/voices",
  (req, res) => {
    res.json({
      voices: [
        {
          id:
            VOICES.english.id,

          name:
            "ARES English",

          engine:
            "Piper",

          language:
            "English (US)",

          localService: true,
        },

        {
          id:
            VOICES.hindi.id,

          name:
            "ARES Hindi",

          engine:
            "Piper",

          language:
            "Hindi",

          localService: true,
        },
      ],
    });
  }
);

// =========================================
// ARES VOICE API
// =========================================

app.post(
  "/api/voice",
  async (req, res) => {
    const {
      text,
      voice,
    } = req.body;

    // -------------------------------------
    // VALIDATE TEXT
    // -------------------------------------

    if (
      typeof text !==
        "string" ||
      !text.trim()
    ) {
      return res
        .status(400)
        .json({
          error:
            "Text is required.",
        });
    }

    // -------------------------------------
    // DETERMINE LANGUAGE
    // -------------------------------------

    const selectedLanguage =
      getLanguageFromVoice(
        voice
      );

    const language =
      selectedLanguage ||
      detectLanguage(text);

    // -------------------------------------
    // CHECK VOICE
    // -------------------------------------

    const selectedVoice =
      VOICES[language];

    if (!selectedVoice) {
      return res
        .status(400)
        .json({
          error:
            `No ARES voice configured for ${language}.`,
        });
    }

    // -------------------------------------
    // CREATE UNIQUE FILE
    // -------------------------------------

    const id =
      crypto.randomUUID();

    const outputFile =
      path.join(
        TEMP_DIR,
        `ares-${id}.wav`
      );

    // -------------------------------------
    // LOG REQUEST
    // -------------------------------------

    console.log("");
    console.log(
      "========================================="
    );

    console.log(
      "ARES generating voice"
    );

    console.log(
      `Voice: ${selectedVoice.id}`
    );

    console.log(
      `Language: ${language}`
    );

    console.log(
      `Text: ${text}`
    );

    console.log(
      "========================================="
    );

    try {
      // -----------------------------------
      // GENERATE AUDIO
      // -----------------------------------

      await generateVoice(
        text.trim(),
        language,
        outputFile
      );

      // -----------------------------------
      // FINAL FILE CHECK
      // -----------------------------------

      if (
        !fs.existsSync(
          outputFile
        )
      ) {
        throw new Error(
          "Generated WAV file does not exist."
        );
      }

      const stats =
        await fs.promises.stat(
          outputFile
        );

      console.log(
        `WAV size: ${stats.size} bytes`
      );

      // -----------------------------------
      // SEND WAV
      // -----------------------------------

      console.log(
        "Sending WAV to browser..."
      );

      res.setHeader(
        "Content-Type",
        "audio/wav"
      );

      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
      );

      res.setHeader(
        "Pragma",
        "no-cache"
      );

      res.setHeader(
        "Expires",
        "0"
      );

      res.setHeader(
        "Accept-Ranges",
        "bytes"
      );

      res.sendFile(
        outputFile,
        {
          dotfiles: "deny",
        },
        async (error) => {
          if (error) {
            console.error(
              "Audio send error:",
              error
            );
          }

          // --------------------------------
          // SAFE CLEANUP
          // --------------------------------

          await safeDelete(
            outputFile
          );
        }
      );
    } catch (error) {
      console.error(
        "ARES Voice Error:",
        error
      );

      await safeDelete(
        outputFile
      );

      if (
        !res.headersSent
      ) {
        res
          .status(500)
          .json({
            error:
              "Failed to generate ARES voice.",

            details:
              error.message,
          });
      }
    }
  }
);

// =========================================
// START SERVER
// =========================================

checkVoiceModels();

app.listen(
  PORT,
  () => {
    console.log("");
    console.log(
      "ARES Local Voice Server"
    );

    console.log(
      `http://localhost:${PORT}`
    );

    console.log(
      "English voice: Bryce"
    );

    console.log(
      "Hindi voice: Pratham"
    );

    console.log(
      "Fresh Piper process per request"
    );

    console.log(
      "Cost: FREE"
    );

    console.log("");
  }
);