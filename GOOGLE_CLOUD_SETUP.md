# Configuração do Google Cloud Vertex AI

## Passo 1: Criar Projeto no Google Cloud

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Anote o **Project ID** (você vai precisar dele)

## Passo 2: Ativar APIs Necessárias

1. No console, vá em "APIs & Services" > "Library"
2. Procure e ative as seguintes APIs:
   - **Vertex AI API**
   - **Cloud Storage API**

## Passo 3: Criar Service Account

1. Vá em "IAM & Admin" > "Service Accounts"
2. Clique em "Create Service Account"
3. Dê um nome (ex: "bella-imagen")
4. Adicione as seguintes roles:
   - **Vertex AI User**
   - **Storage Object Admin**
5. Clique em "Create Key" > "JSON"
6. Salve o arquivo JSON (você vai precisar dele)

## Passo 4: Configurar Variáveis de Ambiente

Abra o arquivo JSON baixado e adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# Google Cloud Vertex AI
GOOGLE_CLOUD_PROJECT_ID=seu-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_CLOUD_CLIENT_EMAIL=seu-service-account@seu-projeto.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Importante:**
- O `GOOGLE_CLOUD_PRIVATE_KEY` deve manter as quebras de linha (`\n`)
- Copie todo o conteúdo do campo `private_key` do JSON
- Mantenha as aspas duplas ao redor da chave

## Passo 5: Preços

O Vertex AI Imagen 3 tem os seguintes custos (aproximados):
- **Geração de imagem**: ~$0.04 por imagem (1024x1024)
- **Edição de imagem**: ~$0.08 por edição

Para mais detalhes: https://cloud.google.com/vertex-ai/pricing

## Pronto!

Depois de configurar tudo, me avise e eu atualizo a Edge Function para usar o Google Cloud.
