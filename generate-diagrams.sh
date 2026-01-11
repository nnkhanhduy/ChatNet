#!/bin/bash

echo "========================================"
echo " ChatNet - Generate Diagrams"
echo "========================================"
echo ""

# Check if mmdc is installed
if ! command -v mmdc &> /dev/null; then
    echo "[ERROR] Mermaid CLI not found!"
    echo "Please install: npm install -g @mermaid-js/mermaid-cli"
    exit 1
fi

echo "[1/3] Generating System Architecture..."
mmdc -i diagrams/system_architecture.mmd -o assets/system_architecture.png -b transparent
if [ $? -eq 0 ]; then
    echo "[OK] system_architecture.png created"
else
    echo "[FAIL] Failed to generate system_architecture.png"
fi

echo ""
echo "[2/3] Generating Message Flow..."
mmdc -i diagrams/message_flow.mmd -o assets/MessageFlow.png -b transparent
if [ $? -eq 0 ]; then
    echo "[OK] MessageFlow.png created"
else
    echo "[FAIL] Failed to generate MessageFlow.png"
fi

echo ""
echo "[3/3] Generating Technology Stack..."
mmdc -i diagrams/technology_stack.mmd -o assets/TechnologyStack.png -b transparent
if [ $? -eq 0 ]; then
    echo "[OK] TechnologyStack.png created"
else
    echo "[FAIL] Failed to generate TechnologyStack.png"
fi

echo ""
echo "========================================"
echo " Done! Check assets/ folder"
echo "========================================"
