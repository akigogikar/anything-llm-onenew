"""Agentic evaluation harness stubs."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable, List


@dataclass
class AgenticTask:
    name: str
    prompt: str
    expected: str


@dataclass
class AgenticResult:
    name: str
    success: bool
    trace: List[str]


def evaluate(model, tasks: Iterable[AgenticTask]) -> List[AgenticResult]:
    results: List[AgenticResult] = []
    for task in tasks:
        trace = [task.prompt, "...", task.expected]
        results.append(AgenticResult(task.name, False, trace))
    return results


__all__ = ["AgenticTask", "AgenticResult", "evaluate"]
