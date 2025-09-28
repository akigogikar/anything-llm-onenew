import pytest

torch = pytest.importorskip("torch")
nn = torch.nn

from triune.adapters.tlora import TLoraAdapter, TLoraConfig


def test_tlora_forward_shape():
    base = nn.Linear(4, 3)
    adapter = TLoraAdapter(base, TLoraConfig(r=2))
    x = torch.randn(2, 4)
    out = adapter(x)
    assert out.shape == (2, 3)
