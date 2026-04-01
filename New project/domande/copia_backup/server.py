from __future__ import annotations

import argparse
import json
import threading
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


BASE_DIR = Path(__file__).resolve().parent
RESPONSES_PATH = BASE_DIR / "responses.json"
RESPONSES_LOCK = threading.Lock()
QUESTION_KEYS = ("motivation", "availability", "next_step")
ALLOWED_ANSWERS = {"Si'", "No"}


def ensure_responses_file() -> None:
    if RESPONSES_PATH.exists():
        return

    RESPONSES_PATH.write_text("[]\n", encoding="utf-8")


def load_responses() -> list[dict]:
    ensure_responses_file()

    with RESPONSES_LOCK:
        try:
            data = json.loads(RESPONSES_PATH.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            data = []

    return data if isinstance(data, list) else []


def save_responses(responses: list[dict]) -> None:
    ensure_responses_file()
    payload = json.dumps(responses, ensure_ascii=False, indent=2)
    temp_path = RESPONSES_PATH.with_suffix(".tmp")

    with RESPONSES_LOCK:
        temp_path.write_text(payload + "\n", encoding="utf-8")
        temp_path.replace(RESPONSES_PATH)


def build_record(payload: dict) -> dict:
    if not isinstance(payload, dict):
        raise ValueError("Il body deve essere un oggetto JSON.")

    answers = payload.get("answers")
    if not isinstance(answers, dict):
        raise ValueError("Il campo answers e' obbligatorio.")

    cleaned_answers = {}
    for key in QUESTION_KEYS:
        value = answers.get(key)
        if value not in ALLOWED_ANSWERS:
            raise ValueError(f"Risposta non valida per {key}.")
        cleaned_answers[key] = value

    submitted_at = payload.get("submittedAt")
    if not isinstance(submitted_at, str) or not submitted_at.strip():
        submitted_at = datetime.now(timezone.utc).isoformat()

    return {
        "submittedAt": submitted_at,
        "answers": cleaned_answers,
    }


class QuestionsHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def log_message(self, format, *args):  # noqa: A003
        return

    def _send_json(self, payload: dict | list, status: int = HTTPStatus.OK) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)

        if parsed.path == "/api/responses":
            self._send_json(load_responses())
            return

        if parsed.path in {"", "/"}:
            self.path = "/domande.html"

        super().do_GET()

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path != "/api/responses":
            self.send_error(HTTPStatus.NOT_FOUND, "Endpoint non trovato.")
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            content_length = 0

        raw_body = self.rfile.read(content_length)

        try:
            payload = json.loads(raw_body.decode("utf-8") or "{}")
            record = build_record(payload)
        except (UnicodeDecodeError, json.JSONDecodeError, ValueError) as error:
            self._send_json({"ok": False, "error": str(error)}, status=HTTPStatus.BAD_REQUEST)
            return

        responses = load_responses()
        responses.append(record)
        save_responses(responses)

        self._send_json(
            {
                "ok": True,
                "total": len(responses),
            },
            status=HTTPStatus.CREATED,
        )

    def do_DELETE(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path != "/api/responses":
            self.send_error(HTTPStatus.NOT_FOUND, "Endpoint non trovato.")
            return

        save_responses([])
        self._send_json(
            {
                "ok": True,
                "total": 0,
            },
            status=HTTPStatus.OK,
        )


def main() -> None:
    parser = argparse.ArgumentParser(description="Server per il questionario condiviso.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8030)
    args = parser.parse_args()

    ensure_responses_file()

    server = ThreadingHTTPServer((args.host, args.port), QuestionsHandler)
    print(f"Server attivo su http://{args.host}:{args.port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
