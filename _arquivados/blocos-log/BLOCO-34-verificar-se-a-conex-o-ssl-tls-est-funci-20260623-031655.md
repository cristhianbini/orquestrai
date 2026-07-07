---
tipo: licao-automatica
bloco: BLOCO-34
title: "Auto: Verificar se a conexão SSL/TLS está funcionando"
sha256: 348ddb5c8d66267919971dae5098f37e2525d96971decfd53a078884d33e2ee0
created: 2026-06-23T03:16:55.851Z
---

# BLOCO-34 - Verificar se a conexão SSL/TLS está funcionando

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
# Verificar se a conexão SSL/TLS está funcionando
pytest tests/integration/test_db_connection.py::test_ssl_connection_timeout
# Validar: timeout respeitado (60s), SSL negociado com sucesso
# PASS: conexão estabelecida em < 5s com ssl_mode=require
# FAIL: timeout > 65s ou erro de certificado SSL
~~~
