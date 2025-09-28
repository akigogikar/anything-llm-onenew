import pytest

torch = pytest.importorskip("torch")
nn = torch.nn

from triune.models.bitlinear import BitLinearV2
from triune.models.swapper import convert_model


def test_convert_model_replaces_linear():
    model = nn.Sequential(nn.Linear(4, 2))
    manifest = convert_model(model)
    assert isinstance(model[0], BitLinearV2)
    assert manifest
