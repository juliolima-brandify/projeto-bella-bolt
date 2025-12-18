# Deploy da Edge Function - generate-transformation

## Opções de Deploy

Existem duas formas de fazer deploy da Edge Function para o Supabase:

### Opção 1: Via Interface Bolt.new (Mais Fácil)

A plataforma Bolt.new pode fazer o deploy automaticamente usando ferramentas MCP:

```
Use o comando: "Deploy the edge function generate-transformation to Supabase"
```

O sistema irá automaticamente:
1. Ler o código da função em `supabase/functions/generate-transformation/index.ts`
2. Fazer upload para o Supabase
3. Configurar as permissões necessárias

### Opção 2: Via Supabase CLI (Manual)

Se preferir fazer manualmente:

#### 1. Instalar Supabase CLI

```bash
npm install -g supabase
```

#### 2. Login no Supabase

```bash
supabase login
```

#### 3. Link ao Projeto

```bash
supabase link --project-ref seu-project-ref
```

Para encontrar seu `project-ref`:
- Acesse o Dashboard do Supabase
- Vá em Settings → General
- Copie o "Reference ID"

#### 4. Deploy da Function

```bash
supabase functions deploy generate-transformation
```

#### 5. Configurar Secrets (Se ainda não configurou)

```bash
supabase secrets set OPENAI_API_KEY=sk-sua-chave-aqui
```

## Verificar o Deploy

Após o deploy, você pode testar a função:

### Via Dashboard do Supabase

1. Vá em **Edge Functions** no menu lateral
2. Clique em `generate-transformation`
3. Use a aba "Invoke" para testar
4. Cole um JSON de teste:

```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "currentWeight": 75,
  "goalWeight": 65,
  "height": 165,
  "leadId": "optional-uuid-here"
}
```

### Via código (JavaScript/TypeScript)

```typescript
const { data, error } = await supabase.functions.invoke('generate-transformation', {
  body: {
    imageBase64: "data:image/jpeg;base64,...",
    currentWeight: 75,
    goalWeight: 65,
    height: 165,
    leadId: "optional-uuid"
  }
});

if (error) {
  console.error('Error:', error);
} else {
  console.log('Success:', data);
  // data.transformedImage conterá a URL da imagem transformada
  // data.cached indica se veio do cache
}
```

## Estrutura de Resposta

### Sucesso

```json
{
  "transformedImage": "https://your-project.supabase.co/storage/v1/object/public/transformed-images/uuid.png",
  "cached": false
}
```

### Erro

```json
{
  "error": "Mensagem de erro",
  "fallback": true
}
```

## Logs e Monitoramento

### Ver Logs em Tempo Real

```bash
supabase functions logs generate-transformation
```

### Verificar Logs no Dashboard

1. Vá em **Edge Functions**
2. Clique em `generate-transformation`
3. Clique na aba "Logs"
4. Veja execuções em tempo real

### Consultar Logs no Banco de Dados

```sql
-- Ver últimas transformações
SELECT *
FROM transformation_logs
ORDER BY created_at DESC
LIMIT 10;

-- Ver transformações com erro
SELECT *
FROM transformation_logs
WHERE status = 'error'
ORDER BY created_at DESC;

-- Tempo médio de processamento
SELECT
  AVG(processing_time_ms) as avg_time_ms,
  AVG(processing_time_ms) / 1000.0 as avg_time_seconds
FROM transformation_logs
WHERE status = 'success';
```

## Troubleshooting

### Erro: "Failed to deploy function"

- Verifique se você está logado: `supabase login`
- Verifique se o projeto está linkado: `supabase link --project-ref ref`
- Verifique se a função não tem erros de sintaxe

### Erro: "Permission denied"

- Certifique-se de que você tem permissões de admin no projeto
- Faça logout e login novamente: `supabase logout` → `supabase login`

### Erro: "OPENAI_API_KEY not configured"

- Configure o secret: `supabase secrets set OPENAI_API_KEY=sua-chave`
- Aguarde 1-2 minutos para propagação
- Teste novamente

### Function muito lenta

A função deve levar 15-20 segundos. Se estiver mais lenta:
- Verifique os logs para identificar o gargalo
- Confirme que está usando qualidade "standard" (não "hd")
- Verifique se a API da OpenAI não está sobrecarregada

## Atualizar a Function

Para fazer deploy de mudanças:

```bash
# Edite o arquivo
vim supabase/functions/generate-transformation/index.ts

# Deploy novamente
supabase functions deploy generate-transformation
```

As mudanças entram em vigor imediatamente após o deploy.

## Variáveis de Ambiente Disponíveis

A Edge Function tem acesso automático às seguintes variáveis:

- `SUPABASE_URL` - URL do projeto
- `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço com permissões completas
- `SUPABASE_ANON_KEY` - Chave anônima para acesso público
- `OPENAI_API_KEY` - Sua chave da OpenAI (configurada manualmente)

## Custos

Edge Functions do Supabase:
- **Free tier**: 500.000 invocações/mês
- **Após free tier**: $2 por 1 milhão de invocações

Para 30-120 transformações/mês, você estará bem dentro do free tier.

## Recursos Adicionais

- [Documentação Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Referência da CLI](https://supabase.com/docs/reference/cli/introduction)
- [Deploy via GitHub Actions](https://supabase.com/docs/guides/functions/deploy)
