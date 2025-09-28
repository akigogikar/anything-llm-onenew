"""Ternary LoRA adapters."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List, Tuple

import torch
from torch import nn

from triune.models.bitlinear import BitLinearV2, ternarize


@dataclass
class TLoraConfig:
    r: int = 8
    alpha: float = 16.0
    dropout: float = 0.0


class TLoraAdapter(nn.Module):
    """Ternary LoRA adapter with straight-through gradients."""

    def __init__(self, base: nn.Linear, config: TLoraConfig):
        super().__init__()
        self.base = base
        self.config = config
        self.lora_a = nn.Parameter(torch.zeros((config.r, base.in_features)))
        self.lora_b = nn.Parameter(torch.zeros((base.out_features, config.r)))
        self.register_buffer("scale", torch.tensor(config.alpha / config.r))
        self.dropout = nn.Dropout(config.dropout)
        self.reset_parameters()

    def reset_parameters(self) -> None:
        nn.init.kaiming_uniform_(self.lora_a, a=5 ** 0.5)
        nn.init.zeros_(self.lora_b)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        base_out = self.base(x)
        lora_out = self.dropout(x) @ self.lora_a.t()
        ternary_b, _ = ternarize(self.lora_b, torch.full_like(self.lora_b, 0.05))
        adapted = lora_out @ ternary_b.t()
        return base_out + adapted * self.scale

    def merge(self) -> None:
        update = (self.scale * (self.lora_b @ self.lora_a)).to(self.base.weight)
        self.base.weight.data.add_(update)

    def unmerge(self) -> None:
        update = (self.scale * (self.lora_b @ self.lora_a)).to(self.base.weight)
        self.base.weight.data.sub_(update)


def attach_tlora(model: nn.Module, config: TLoraConfig) -> List[Tuple[str, TLoraAdapter]]:
    adapters: List[Tuple[str, TLoraAdapter]] = []
    for name, module in list(model.named_modules()):
        if isinstance(module, nn.Linear):
            parent, attr = _resolve_parent(model, name)
            adapter = TLoraAdapter(module, config)
            setattr(parent, attr, adapter)
            adapters.append((name, adapter))
    return adapters


def _resolve_parent(module: nn.Module, path: str) -> Tuple[nn.Module, str]:
    parts = path.split(".")
    parent = module
    for part in parts[:-1]:
        parent = getattr(parent, part)
    return parent, parts[-1]


__all__ = ["TLoraConfig", "TLoraAdapter", "attach_tlora"]
