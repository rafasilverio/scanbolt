const OpenAI = require('openai');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeContract(text, textCoordinates) {
  try {
    // Converter o Map de coordenadas para um objeto para incluir no prompt
    const textLines = Array.from(textCoordinates.entries()).map(([text, coords]) => ({
      text,
      coordinates: coords
    }));

    const analysisResponse = await openai.chat.completions.create({
      max_tokens: 4000,
      temperature: 0.2,
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an expert legal document analyzer specialized in contracts. Your task is to:
1. Analyze the provided contract text for issues and improvements.
2. Identify missing essential clauses and generate a 3 missing clauses minimum.
3. Provide comprehensive feedback in the following categories:
   - Critical: Legal risks or serious issues - Generate a 3 critical issues minimum
   - Warning: Compliance concerns or potential risks - Generate a 1 warning issue minimum
   - Improvement: Suggestions for better clarity or protection - Generate a 1 improvement issue minimum
Return a JSON with the following structure:
{
  "issues": [
    {
      "id": "uuid-string",
      "type": "critical" | "warning" | "improvement",
      "originalText": "EXACT text from the provided segments",
      "newText": "Suggested replacement text",
      "explanation": "Clear explanation of the issue",
      "riskType": "legal" | "financial" | "compliance" | "operational",
      "status": "pending",
      "position": {
        "startIndex": number,
        "endIndex": number,
        "pageNumber": number,
        "x1": number,
        "y1": number,
        "x2": number,
        "y2": number,
        "width": number,
        "height": number
      }
    }
  ],
  "suggestedClauses": [
    {
      "id": "uuid-string",
      "title": "Clause title",
      "explanation": "Why this clause is needed",
      "suggestedText": "Complete text of suggested clause",
      "riskType": "legal" | "financial" | "compliance" | "operational",
      "status": "pending",
      "suggestedPosition": {
        "afterClause": "Text of clause to insert after",
        "pageNumber": number
      }
    }
  ]
}`
        },
        {
          role: "user",
          content: `Analyze this contract text and use the provided text segments with coordinates:
${JSON.stringify(textLines, null, 2)}`
        }
      ]
    });

    const analysis = JSON.parse(analysisResponse.choices[0]?.message?.content || '{"issues":[],"suggestedClauses":[]}');

    // Processar issues mantendo as coordenadas originais
    const processedIssues = analysis.issues.map((issue) => {
      // Tenta decodificar o originalText se estiver codificado em URL
      let originalText = issue.originalText || '';
      
      // Verifica se o texto parece estar codificado em URL (contém % seguido de dois caracteres hexadecimais)
      if (originalText.includes('%') && /%.{2}/.test(originalText)) {
        try {
          originalText = decodeURIComponent(originalText);
        } catch (e) {
          console.warn('Failed to decode issue originalText, using original version');
          // Continua usando a versão original
        }
      }
      
      // Procura pelas coordenadas do texto, tentando com o texto original e decodificado
      const coordinates = textCoordinates.get(originalText.trim()) || 
                          textCoordinates.get(issue.originalText?.trim() || '') || 
                          null;
      
      return {
        ...issue,
        id: issue.id || crypto.randomUUID(),
        status: 'pending',
        originalText: originalText, // Usa o texto processado
        position: {
          ...issue.position,
          ...(coordinates || {})
        }
      };
    });

    return {
      issues: processedIssues,
      suggestedClauses: analysis.suggestedClauses
    };
  } catch (error) {
    console.error('Analysis error:', error);
    return { issues: [], suggestedClauses: [] };
  }
}

async function updateContractStatus(contractId, status, issues = [], suggestedClauses = []) {
  try {
    await prisma.contract.update({
      where: { id: contractId },
      data: {
        status,
        issues: JSON.stringify(issues),
        suggestedClauses: JSON.stringify(suggestedClauses)
      }
    });
  } catch (error) {
    console.error('Error updating contract status:', error);
    throw error;
  }
}

module.exports = {
  analyzeContract,
  updateContractStatus
}; 