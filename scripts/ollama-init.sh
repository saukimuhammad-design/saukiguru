#!/bin/bash
# Ollama Model Initialization Script
# Runs on container startup to ensure default model is available

set -euo pipefail

MODEL="${MODEL_NAME:-llama3.1:8b}"
MAX_WAIT=120

echo "Waiting for Ollama to be ready..."
for i in $(seq 1 $MAX_WAIT); do
    if curl -sf http://localhost:11434/api/tags >/dev/null 2>&1; then
        echo "Ollama is ready"
        break
    fi
    if [[ $i -eq $MAX_WAIT ]]; then
        echo "Timeout waiting for Ollama"
        exit 1
    fi
    sleep 1
done

# Check if model exists
if curl -sf http://localhost:11434/api/tags | grep -q "\"name\":\"${MODEL}\""; then
    echo "Model ${MODEL} already available"
else
    echo "Pulling model ${MODEL}..."
    ollama pull "${MODEL}"
    echo "Model ${MODEL} ready"
fi

# Keep container running (ollama serve runs in background)
exec ollama serve