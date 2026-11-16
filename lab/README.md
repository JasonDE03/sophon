- [01 · Blackbody radiation](01_blackbody.ipynb) [![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/JasonDE03/sophon/blob/main/lab/01_blackbody.ipynb)
- [02 · Photoelectric effect](02_photoelectric.ipynb) [![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/JasonDE03/sophon/blob/main/lab/02_photoelectric.ipynb)
- [03 · Rutherford scattering](03_rutherford.ipynb) [![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/JasonDE03/sophon/blob/main/lab/03_rutherford.ipynb)
- [04 · The Bohr model and hydrogen spectrum](04_bohr.ipynb) [![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/JasonDE03/sophon/blob/main/lab/04_bohr.ipynb)
- [05 · Stern–Gerlach](05_stern_gerlach.ipynb) [![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/JasonDE03/sophon/blob/main/lab/05_stern_gerlach.ipynb)

Run any notebook in Colab without installing anything; the FIRAS, Geiger–Marsden and NIST hydrogen data are embedded for offline use. VS Code can open `.ipynb` files directly.
For local execution, run from the repository root:
```sh
python3 -m venv lab/.venv
lab/.venv/bin/python -m pip install -r lab/requirements.txt
lab/.venv/bin/jupyter-execute --inplace lab/01_blackbody.ipynb
lab/.venv/bin/jupyter-execute --inplace lab/02_photoelectric.ipynb
lab/.venv/bin/jupyter-execute --inplace lab/03_rutherford.ipynb
lab/.venv/bin/jupyter-execute --inplace lab/04_bohr.ipynb
lab/.venv/bin/jupyter-execute --inplace lab/05_stern_gerlach.ipynb
```
The headless commands use nbclient (no nbconvert) and save outputs, including plots, in each notebook.
