[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/JasonDE03/sophon/blob/main/lab/02_photoelectric.ipynb)

Run the photoelectric notebook in Colab without installing anything. VS Code can open `.ipynb` files directly.
For local execution, run from the repository root:
```sh
python3 -m venv lab/.venv
lab/.venv/bin/python -m pip install -r lab/requirements.txt
lab/.venv/bin/jupyter-execute --inplace lab/02_photoelectric.ipynb
```
The headless command uses nbclient (no nbconvert) and saves outputs, including the plot, in the notebook.
