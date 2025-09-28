"""BitLinear v2 ternary linear layers."""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Optional, Tuple

import torch
from torch import nn

Ternary = torch.Tensor


def ternarize(weights: torch.Tensor, threshold: torch.Tensor) -> Tuple[Ternary, torch.Tensor]:
    """Ternarize floating-point weights with symmetric thresholding."""
    with torch.no_grad():
        sign = torch.sign(weights)
        mask = torch.abs(weights) >= threshold
        ternary = sign * mask
    return ternary, mask


@dataclass
class BitLinearState:
    ternary_weight: torch.Tensor
    scale: torch.Tensor
    bias: Optional[torch.Tensor]


class BitLinearV2(nn.Module):
    """Linear layer with ternary weights and per-row scaling."""

    def __init__(self, in_features: int, out_features: int, bias: bool = True, *, device=None, dtype=None):
        factory_kwargs = {"device": device, "dtype": dtype}
        super().__init__()
        self.in_features = in_features
        self.out_features = out_features
        self.weight = nn.Parameter(torch.empty((out_features, in_features), **factory_kwargs))
        self.bias = nn.Parameter(torch.empty(out_features, **factory_kwargs)) if bias else None
        self.register_buffer("scale", torch.ones(out_features, **factory_kwargs))
        self.register_buffer("threshold", torch.full((out_features, 1), 0.05, **factory_kwargs))
        self.reset_parameters()

    def reset_parameters(self) -> None:
        nn.init.kaiming_uniform_(self.weight, a=math.sqrt(5))
        if self.bias is not None:
            fan_in, _ = nn.init._calculate_fan_in_and_fan_out(self.weight)
            bound = 1 / math.sqrt(fan_in)
            nn.init.uniform_(self.bias, -bound, bound)

    def forward(self, input: torch.Tensor) -> torch.Tensor:
        ternary, mask = ternarize(self.weight, self.threshold)
        scale = self.scale.view(-1, 1)
        packed = ternary * scale
        output = nn.functional.linear(input, packed, self.bias)
        return output

    def extra_repr(self) -> str:
        return f"in_features={self.in_features}, out_features={self.out_features}, bias={self.bias is not None}"

    def load_state(self, state: BitLinearState) -> None:
        self.weight.data.copy_(state.ternary_weight)
        self.scale.copy_(state.scale)
        if state.bias is not None and self.bias is not None:
            self.bias.data.copy_(state.bias)


__all__ = ["BitLinearV2", "BitLinearState", "ternarize"]
