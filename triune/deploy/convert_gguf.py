"""GGUF exporter stubs."""

from __future__ import annotations

import json
from pathlib import Path


def export_to_gguf(model, path: Path) -> None:
    payload = {"model": model.__class__.__name__}
    path.write_text(json.dumps(payload, indent=2))


__all__ = ["export_to_gguf"]
