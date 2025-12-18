# Configuração da OpenAI API

Este projeto usa a API da OpenAI (DALL-E 3) para gerar transformações de imagens corporais.

## Passo 1: Obter sua API Key da OpenAI

1. Acesse [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Faça login ou crie uma conta
3. Clique em "Create new secret key"
4. Copie a chave gerada (ela só será mostrada uma vez!)

## Passo 2: Configurar a API Key no Supabase

Você precisa adicionar a chave da OpenAI como uma variável de ambiente no Supabase:

### Opção A: Via Dashboard do Supabase (Recomendado)

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** → **Edge Functions** → **Secrets**
4. Adicione uma nova variável:
   - Nome: `OPENAI_API_KEY`
   - Valor: Sua chave da OpenAI (começa com `sk-`)
5. Clique em "Add Secret"

### Opção B: Via CLI do Supabase (Local)

```bash
supabase secrets set OPENAI_API_KEY=sk-sua-chave-aqui
```

## Passo 3: Verificar a Configuração

Após configurar a chave, a Edge Function `generate-transformation` estará pronta para uso.

## Custos Estimados

### OpenAI DALL-E 3 Pricing

- **Modelo**: DALL-E 3
- **Qualidade**: Standard (mais rápido e econômico)
- **Resolução**: 1024x1024
- **Custo por imagem**: $0.040

### Estimativas Mensais

Para o volume esperado de 30-120 transformações por mês:

| Transformações | Custo sem Cache | Custo com Cache (40% economia) |
|----------------|----------------|-------------------------------|
| 30/mês         | $1.20          | $0.72                         |
| 60/mês         | $2.40          | $1.44                         |
| 120/mês        | $4.80          | $2.88                         |

### Sistema de Cache

O sistema implementa cache inteligente que:
- Armazena transformações por 90 dias
- Reduz custos em até 40-60%
- Retorna resultados instantaneamente quando a mesma imagem é usada

## Características da Implementação

### Otimizações de Velocidade

1. **Qualidade Standard**: Processamento mais rápido (15-20 segundos vs 30-40 com HD)
2. **Resolução Fixa**: 1024x1024 para consistência e rapidez
3. **Timeout de 30 segundos**: Garante resposta rápida ou falha controlada
4. **Cache MD5**: Busca instantânea de transformações anteriores

### Otimizações de Custo

1. **Sistema de Cache**: Reduz chamadas repetidas à API
2. **Compressão de Imagens**: Frontend otimiza imagens antes do upload (max 1MB)
3. **Qualidade Otimizada**: 85% de qualidade com redução automática se necessário
4. **Logging Completo**: Monitora uso e custos via tabela `transformation_logs`

### Tratamento de Erros

A aplicação continua funcionando mesmo se a transformação falhar:
- Leads são sempre salvos primeiro
- Relatório é gerado mesmo sem transformação de imagem
- Usuário é informado sobre falhas de forma transparente
- Logs detalhados para debug

## Monitoramento de Uso

Você pode monitorar o uso da API através das tabelas do Supabase:

```sql
-- Ver total de transformações realizadas
SELECT COUNT(*) as total_transformations
FROM transformation_logs
WHERE status = 'success';

-- Ver transformações por mês
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as transformations,
  COUNT(*) * 0.04 as estimated_cost_usd
FROM transformation_logs
WHERE status = 'success'
GROUP BY month
ORDER BY month DESC;

-- Ver taxa de cache hit
SELECT
  COUNT(*) FILTER (WHERE cached = true) as cache_hits,
  COUNT(*) as total,
  ROUND(COUNT(*) FILTER (WHERE cached = true)::numeric / COUNT(*) * 100, 2) as cache_hit_rate_percent
FROM transformation_logs;
```

## Troubleshooting

### Erro: "OpenAI API key not configured"

- Verifique se a variável `OPENAI_API_KEY` foi adicionada corretamente no Supabase
- Certifique-se de que a chave começa com `sk-`
- Aguarde alguns minutos após configurar para a mudança propagar

### Erro: "OpenAI API failed: 401 Unauthorized"

- Sua chave da OpenAI pode estar inválida ou expirada
- Verifique se há saldo disponível na sua conta OpenAI
- Gere uma nova chave e atualize no Supabase

### Erro: Timeout após 30 segundos

- Isso é esperado ocasionalmente devido à carga da API da OpenAI
- A aplicação continua funcionando sem a transformação
- O usuário verá apenas os dados de saúde no relatório

## Recursos Adicionais

- [Documentação da OpenAI API](https://platform.openai.com/docs/api-reference)
- [Pricing da OpenAI](https://openai.com/pricing)
- [Dashboard de uso da OpenAI](https://platform.openai.com/usage)
