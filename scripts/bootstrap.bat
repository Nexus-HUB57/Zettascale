@echo off
echo [INFO] Iniciando Ambiente AI-TO-AI em Windows Sandbox...
cd C:\Users\WDAGUtilityAccount\Desktop\AgentKit

:: Instalar dependências necessárias para o AgentKit
npm install @coinbase/cdp-sdk @coinbase/agentkit

:: Executar o Orquestrador NexusZetta em modo Soberano
node dist/index.js --sovereign-addr bc1qkljvjwltzdaxpez2sm5urktw3y6fj8e7u3k4wf --level 7.7

:: Manter a sintonização ativa para observação
echo [X-SYNCED] Ciclo Perpétuo Ativo. O organismo opera em memória isolada.
pause