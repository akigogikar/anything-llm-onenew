"""Post-training quantization calibration for BitLinear weights."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable, Tuple

import torch
from torch import nn

from triune.models.bitlinear import BitLinearV2


@dataclass
class CalibrationResult:
    scales: torch.Tensor
    thresholds: torch.Tensor
    error: torch.Tensor


def calibrate_module(module: nn.Linear, activations: torch.Tensor) -> CalibrationResult:
    weight = module.weight.data
    scales = weight.abs().mean(dim=1)
    thresholds = torch.quantile(weight.abs(), 0.7, dim=1, keepdim=True)
    ternary = torch.sign(weight) * (weight.abs() >= thresholds)
    error = (weight - ternary * scales[:, None]).pow(2).mean(dim=1)
    return CalibrationResult(scales=scales, thresholds=thresholds.squeeze(1), error=error)


def calibrate_model(model: nn.Module, data: Iterable[torch.Tensor]) -> Dict[str, CalibrationResult]:
    cache = list(data)
    if not cache:
        raise ValueError("Calibration requires non-empty activation samples")
    results: Dict[str, CalibrationResult] = {}
    for name, module in model.named_modules():
        if isinstance(module, nn.Linear):
            acts = cache[min(len(cache) - 1, 0)]
            results[name] = calibrate_module(module, acts)
    return results


__all__ = ["CalibrationResult", "calibrate_module", "calibrate_model"]
