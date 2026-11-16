- [01 · Blackbody radiation](01_blackbody.ipynb) [![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/JasonDE03/sophon/blob/main/lab/01_blackbody.ipynb)
- [02 · Photoelectric effect](02_photoelectric.ipynb) [![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/JasonDE03/sophon/blob/main/lab/02_photoelectric.ipynb)
- [03 · Rutherford scattering](03_rutherford.ipynb) [![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/JasonDE03/sophon/blob/main/lab/03_rutherford.ipynb)

Run any notebook in Colab without installing anything; the FIRAS and Geiger–Marsden data are embedded for offline use. VS Code can open `.ipynb` files directly.
For local execution, run from the repository root:
```sh
python3 -m venv lab/.venv
lab/.venv/bin/python -m pip install -r lab/requirements.txt
lab/.venv/bin/jupyter-execute --inplace lab/01_blackbody.ipynb
lab/.venv/bin/jupyter-execute --inplace lab/02_photoelectric.ipynb
lab/.venv/bin/jupyter-execute --inplace lab/03_rutherford.ipynb
```
The headless commands use nbclient (no nbconvert) and save outputs, including plots, in each notebook.
