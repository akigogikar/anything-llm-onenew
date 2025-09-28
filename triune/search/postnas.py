"""Simple post-NAS search over attention/SSM mix."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List


@dataclass
class LayerSpec:
    layer_index: int
    kind: str
    memory_cost: float
    latency_cost: float


@dataclass
class SearchBudget:
    max_memory: float
    max_latency: float


@dataclass
class SearchResult:
    layers: List[LayerSpec]
    total_memory: float
    total_latency: float


def search(layers: List[LayerSpec], budget: SearchBudget) -> SearchResult:
    selected: List[LayerSpec] = []
    total_memory = 0.0
    total_latency = 0.0
    for spec in sorted(layers, key=lambda s: s.latency_cost):
        if total_memory + spec.memory_cost > budget.max_memory:
            continue
        if total_latency + spec.latency_cost > budget.max_latency:
            continue
        selected.append(spec)
        total_memory += spec.memory_cost
        total_latency += spec.latency_cost
    return SearchResult(selected, total_memory, total_latency)


__all__ = ["LayerSpec", "SearchBudget", "SearchResult", "search"]
