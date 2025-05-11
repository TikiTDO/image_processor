#!/usr/bin/env bash
set -euo pipefail

# Bootstrap local development environment:
# - create Python venv and install pre-commit & yamllint
# - install Git pre-commit hooks
# - install frontend dependencies

# Ensure Python 3 is available
if ! command -v python3 &> /dev/null; then
  echo "Error: python3 is not installed. Please install Python 3." >&2
  exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
  echo "Creating Python virtual environment at .venv..."
  python3 -m venv .venv
fi

# Activate virtual environment
echo "Activating Python virtual environment..."
source .venv/bin/activate

# Upgrade pip and install Python tools
echo "Installing Python dependencies (pre-commit, yamllint)..."
pip install --upgrade pip
pip install pre-commit yamllint

# Install Git pre-commit hooks
echo "Installing Git pre-commit hooks..."
pre-commit install

# Install frontend dependencies
if [ -d "frontend" ]; then
  echo "Installing frontend dependencies..."
  (cd frontend && npm install)
fi

echo "Setup complete. To activate the Python environment, run 'source .venv/bin/activate'."