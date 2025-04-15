Aqui está uma documentação do fluxo atual de upload e análise de contratos por IA:
Fluxo de Upload e Análise de Contratos

Interface do Usuário (Upload):
O processo geralmente começa na página /contracts/upload (arquivo src/app/(protected)/contracts/upload/page.tsx), que utiliza o componente UploadZone (src/components/contracts/upload/UploadZone.tsx).

Dentro da UploadZone, o componente ContractUploader (src/components/contracts/upload/ContractUploader.tsx) gerencia a lógica de upload.
Quando o usuário seleciona um arquivo, a função handleFileChange é acionada, chamando uploadContract.
uploadContract envia o arquivo (File) como FormData para o endpoint da API /api/contracts/upload.
Enquanto o upload e a análise ocorrem, o componente exibe um estado de carregamento (uploading, progress) e possíveis erros (error).
API Endpoint (Recepção do Upload):
O endpoint /api/contracts/upload/route.ts recebe a requisição POST com o arquivo.
Inferido: Este endpoint provavelmente autentica o usuário e, em seguida, chama a função processContractInBackground (de src/lib/process.ts) para iniciar o processamento assíncrono.
Ele retorna uma resposta imediata para o frontend, incluindo o ID do contrato recém-criado ou referenciado (data.contract.id).
Processamento em Background (Início):
A função processContractInBackground em src/lib/process.ts é o ponto central do processamento inicial:
Cria ou encontra um registro de Contract no banco de dados (Prisma), definindo um status inicial (provavelmente 'analyzing' ou similar).
Faz o upload do arquivo PDF para o Supabase Storage em um bucket chamado contracts, usando o ID do contrato como nome do arquivo (ex: contracts/<contractId>.pdf).
Atualiza o registro do contrato no Prisma com a URL pública do arquivo no Supabase (fileUrl) e o nome do arquivo (fileName).
Converte o conteúdo do arquivo (File) para uma string base64.
Adiciona um "job" (trabalho) à fila de processamento gerenciada pelo Redis (Upstash), usando a função addToQueue de src/lib/queue.common.js. Este job contém o contractId, os dados do arquivo (buffer base64, nome, tipo, tamanho), userId e um flag isPreview.
Fila de Processamento (Redis):
O arquivo src/lib/queue.common.js implementa uma fila FIFO (First-In, First-Out) simples usando Redis via @upstash/redis.
Jobs são adicionados (addToQueue) e recuperados (getNextJob) por um processo separado (worker).
Worker de Processamento (Execução da Análise - Implícito):
Inferido: Um processo worker (não explicitamente mostrado nos arquivos lidos, mas necessário para consumir a fila) monitora a fila Redis (getNextJob).
Ao receber um job:
Decodifica o buffer base64 de volta para um formato utilizável.
Utiliza a função extractTextFromPDF (definida em src/lib/process.ts, usando a biblioteca pdf2json) para extrair o texto completo do PDF e, crucialmente, as coordenadas (x, y, largura, altura, página) de cada segmento de texto detectado.
Chama a função analyzeContract de src/lib/ai.ts.
Análise por IA (OpenAI):
A função analyzeContract em src/lib/ai.ts:
Recebe o texto extraído e o Map de coordenadas.
Formata um prompt detalhado para a API da OpenAI (usando o modelo gpt-4o). O prompt instrui a IA a agir como um analista legal, identificar problemas (issues) e cláusulas ausentes (suggestedClauses), e retornar os resultados em um formato JSON específico. O prompt também inclui os segmentos de texto com suas coordenadas para que a IA possa referenciar a localização exata dos problemas.
Envia a requisição para a API da OpenAI.
Processa a resposta JSON da IA. Para cada issue identificada, ela tenta associar as coordenadas corretas do Map original com base no originalText fornecido pela IA.
Retorna um objeto contendo as listas de issues e suggestedClauses.
Finalização do Processamento (Worker):
Inferido: Após receber os resultados da analyzeContract, o worker chama a função updateContractStatus (também de src/lib/ai.ts).
updateContractStatus atualiza o registro do Contract no Prisma:
Define o status para 'under_review'.
Salva os arrays issues e suggestedClauses (como JSONB) no banco de dados.
Atualiza o updatedAt.
Monitoramento de Status (Frontend):
Após iniciar o upload, o ContractUploader.tsx chama waitForAnalysis, que começa a fazer polling (requisições periódicas) ao endpoint /api/contracts/[id]/status.
O endpoint /api/contracts/[id]/status/route.ts busca o contrato no Prisma e retorna seu status atual e um booleano isAnalysisComplete (que verifica se o status é 'under_review' e se há issues).
O polling continua até que o status seja 'under_review' (ou 'error', ou timeout).
Quando a análise está completa ('under_review'), o ContractUploader redireciona o usuário para a página de detalhes/revisão do contrato (/contracts/[id]).
Na página do contrato, o componente ContractProcessingMonitor.tsx pode exibir um modal (ProcessingModal) se detectar (via localStorage ou initialStatus) que o contrato ainda está sendo processado quando a página é carregada. Ele também pode fazer verificações de status para atualizar a UI ou redirecionar quando o processo finaliza.
Resumo do Fluxo de Dados:
UI (UploadZone/ContractUploader) -> API (/api/contracts/upload) -> processContractInBackground -> Supabase Storage & Redis Queue -> Worker Process -> extractTextFromPDF -> analyzeContract (OpenAI) -> updateContractStatus (Prisma) -> API (/api/contracts/[id]/status) -> UI (Polling/ContractProcessingMonitor)