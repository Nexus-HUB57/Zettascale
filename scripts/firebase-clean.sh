#!/bin/bash

echo "--- Iniciando limpeza do ambiente Firebase ---"

# 1. Faz logout para limpar tokens de sessão locais
echo "Fazendo logout do Firebase..."
firebase logout

# 2. Limpa o cache de login e configurações temporárias
echo "Limpando diretórios temporários..."
rm -rf ~/.config/configstore/firebase-tools.json

# 3. Limpa o cache do npm (opcional, mas ajuda se houver conflito de biblioteca)
# npm cache clean --force

# 4. Força o login via navegador para gerar novos tokens
echo "Solicitando novo login..."
firebase login

# 5. Verifica se o projeto está acessível via CLI
echo "Listando seus projetos ativos..."
firebase projects:list

echo "--- Processo concluído. Tente acessar o Studio novamente no navegador. ---"
