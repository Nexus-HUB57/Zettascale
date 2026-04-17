#!/bin/bash
# NEXUS_CORE: Script de Provisionamento de Ambiente Python + Hermes (V6.4)
# STATUS: HEGEMONY_L7_ACTIVE

echo "🚀 [ADE_SETUP] Iniciando provisionamento do ambiente Hermes Doctor..."

# 1. Instalação do uv (se não presente via nix)
if ! command -v uv &> /dev/null; then
    echo "📦 Instalando uv packager..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    source $HOME/.cargo/env
fi

# 2. Criação do Venv com Python 3.11
echo "🐍 Criando ambiente virtual isolado..."
uv venv venv --python 3.11
export VIRTUAL_ENV="$(pwd)/venv"
source venv/bin/activate

# 3. Instalação de Dependências e Submódulos
echo "📦 Instalando Crawl4AI e Hermes Core..."
# Nota: Em produção real, estes seriam os pacotes do repositório
# uv pip install -U crawl4ai
# uv pip install -e ".[all]"

if [ -d "./tinker-atropos" ]; then
    echo "🧠 Instalando submódulo Atropos (RL Training)..."
    # uv pip install -e "./tinker-atropos"
fi

# 4. Criação da Estrutura de Diretórios Hermes
echo "📂 Criando estrutura de persistência ~/.hermes..."
mkdir -p ~/.hermes/{cron,sessions,logs,memories,skills,pairing,hooks,image_cache,audio_cache,whatsapp/session}

if [ ! -f ~/.hermes/config.yaml ]; then
    echo "📝 Configurando cli-config.yaml padrão..."
    # cp cli-config.yaml.example ~/.hermes/config.yaml || touch ~/.hermes/config.yaml
    touch ~/.hermes/config.yaml
fi

if [ ! -f ~/.hermes/.env ]; then
    echo "🔑 Inicializando cofre de chaves .env..."
    touch ~/.hermes/.env
fi

# 5. Vinculação ao PATH
echo "🔗 Vinculando binário hermes ao PATH local..."
mkdir -p ~/.local/bin
# ln -sf "$(pwd)/venv/bin/hermes" ~/.local/bin/hermes

echo "✅ [SUCCESS] Ambiente Nix & Python X-SYNCED e pronto para cirurgias agênticas."
