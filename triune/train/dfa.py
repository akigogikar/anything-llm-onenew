"""Training pipeline orchestration entrypoints."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List

import torch

from triune.adapters.tlora import TLoraConfig, attach_tlora
from triune.models.swapper import SwapConfig, convert_model, save_manifest
from triune.quant.ptq_calib import calibrate_model


@dataclass
class PipelineConfig:
    output_dir: Path
    tlora: TLoraConfig = TLoraConfig()
    swap: SwapConfig = SwapConfig()


def run_pipeline(model: torch.nn.Module, activations: Iterable[torch.Tensor], config: PipelineConfig) -> None:
    config.output_dir.mkdir(parents=True, exist_ok=True)
    manifest = convert_model(model, config=config.swap)
    save_manifest(manifest, config.output_dir / "swap_manifest.json")
    calibration = calibrate_model(model, activations)
    torch.save({k: v.scales for k, v in calibration.items()}, config.output_dir / "calibration.pt")
    attach_tlora(model, config.tlora)


__all__ = ["PipelineConfig", "run_pipeline"]
