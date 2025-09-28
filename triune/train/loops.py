"""High-level training loop utilities."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

import torch

from triune.train.dfa import PipelineConfig, run_pipeline


@dataclass
class TrainLoopConfig:
    pipeline: PipelineConfig
    epochs: int = 1


def train(model: torch.nn.Module, data: Iterable[torch.Tensor], config: TrainLoopConfig) -> None:
    for epoch in range(config.epochs):
        run_pipeline(model, data, config.pipeline)


__all__ = ["TrainLoopConfig", "train"]
