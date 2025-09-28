"""Model graph rewriting utilities for BitLinear conversion."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Set, Tuple

import torch
from torch import nn

from .bitlinear import BitLinearV2


@dataclass
class SwapConfig:
    """Configuration for module conversion."""

    allow_modules: Set[str] = field(default_factory=lambda: {"Linear"})
    block_modules: Set[str] = field(default_factory=lambda: {"Embedding", "LayerNorm", "RMSNorm"})
    include_bias: bool = True


@dataclass
class SwapRecord:
    module_path: str
    original_cls: str
    replaced_cls: str
    scale: List[float]


def iter_named_modules(module: nn.Module, prefix: str = "") -> Iterable[Tuple[str, nn.Module]]:
    for name, child in module.named_children():
        child_prefix = f"{prefix}.{name}" if prefix else name
        yield child_prefix, child
        yield from iter_named_modules(child, child_prefix)


def should_convert(name: str, module: nn.Module, config: SwapConfig) -> bool:
    if module.__class__.__name__ in config.block_modules:
        return False
    if module.__class__.__name__ not in config.allow_modules:
        return False
    if isinstance(module, nn.Linear):
        return True
    return False


def linear_to_bitlinear(linear: nn.Linear, *, device: Optional[torch.device] = None) -> BitLinearV2:
    bit = BitLinearV2(linear.in_features, linear.out_features, bias=linear.bias is not None, device=device)
    with torch.no_grad():
        bit.weight.copy_(linear.weight.data.sign())
        scales = linear.weight.data.abs().mean(dim=1)
        bit.scale.copy_(scales)
        if linear.bias is not None and bit.bias is not None:
            bit.bias.copy_(linear.bias.data)
    return bit


def convert_model(model: nn.Module, *, config: Optional[SwapConfig] = None) -> Dict[str, SwapRecord]:
    """Convert linear layers in the model and return a manifest."""
    config = config or SwapConfig()
    manifest: Dict[str, SwapRecord] = {}
    for name, module in iter_named_modules(model):
        if should_convert(name, module, config):
            parent, attr = _resolve_parent(model, name)
            replacement = linear_to_bitlinear(module)
            setattr(parent, attr, replacement)
            manifest[name] = SwapRecord(
                module_path=name,
                original_cls=module.__class__.__name__,
                replaced_cls=replacement.__class__.__name__,
                scale=replacement.scale.detach().cpu().tolist(),
            )
    return manifest


def _resolve_parent(module: nn.Module, path: str) -> Tuple[nn.Module, str]:
    parts = path.split(".")
    parent = module
    for part in parts[:-1]:
        parent = getattr(parent, part)
    return parent, parts[-1]


def save_manifest(manifest: Dict[str, SwapRecord], path: Path) -> None:
    serializable = {
        name: {
            "original": record.original_cls,
            "replacement": record.replaced_cls,
            "scale": record.scale,
        }
        for name, record in manifest.items()
    }
    path.write_text(json.dumps(serializable, indent=2))


__all__ = [
    "SwapConfig",
    "SwapRecord",
    "convert_model",
    "save_manifest",
]
