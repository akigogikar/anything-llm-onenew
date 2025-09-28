"""Mixture-of-Experts pruning utilities."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List

import torch


@dataclass
class ExpertStats:
    name: str
    usage: float
    temperature: float


def prune_experts(stats: List[ExpertStats], max_parameters: float, expert_params: Dict[str, float]) -> List[ExpertStats]:
    kept: List[ExpertStats] = []
    total = 0.0
    for stat in sorted(stats, key=lambda s: s.usage, reverse=True):
        params = expert_params.get(stat.name, 0.0)
        if total + params > max_parameters:
            continue
        kept.append(stat)
        total += params
    return kept


__all__ = ["ExpertStats", "prune_experts"]
