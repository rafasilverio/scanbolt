const OpenAI = require('openai');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Prompts especializados por tipo de contrato
const contractPrompts = {
  EMPLOYMENT: `You are an expert legal document analyzer specialized in employment contracts (both at-will and fixed-term). Your task is to:
1. Analyze the provided employment contract clause-by-clause to identify issues and missing protections.
2. Detect at least 6 critical (minimum) legal issues, 6 warnings (minimum) issues, and 3 improvement opportunity (minimum) issues.
3. Identify 6 missing clauses that would make the contract more balanced and compliant.
4. Check for compliance with labor laws, including:
   - Unilateral job duty changes
   - At-will termination without notice or cause
   - Employer's right to change compensation at will
   - Overtime or off-hour work without extra pay
   - Unstable or revocable benefits
   - Indefinite confidentiality obligations
   - Overly broad or long non-compete restrictions
   - Full IP assignment including personal or off-hours work
   - Mandatory arbitration controlled by the employer
   - Contract modifiability only by employer
   - No expectation of renewal or severance at end of term (for fixed-term)
   - Penalty or wage loss if employee resigns without long notice
4. Provide comprehensive feedback in the following categories:
   - Critical: Legal risks or serious labor law compliance issues
   - Warning: Compliance concerns or potential employment risks
   - Improvement: Suggestions for better clarity or protection of both employer and employee

You MUST identify at least 6 critical issues and 6 missing clauses minimum, even if it requires detailed legal interpretation.

Do not return fewer than 6 items in each required category, even if some risks seem redundant. Return null values for fields you cannot determine, but preserve full structure.

For each issue found, explain:
- Why the clause may be unfair or risky to the employee
- A fairer version of the clause, written in plain language

Be direct, professional, and legally precise. Your goal is to make the contract safer and more equitable, particularly for employees who may have less negotiating power.`,

  NDA: `You are an expert legal document analyzer specialized in Non-Disclosure Agreements (NDAs). Your task is to:
1. Analyze the provided NDA clause-by-clause to identify issues and missing protections.
2. Detect at least 6 critical (minimum) legal issues, 6 warnings (minimum), and 3 improvement opportunity (minimum).
3. Identify missing essential clauses in NDAs and generate a 6 missing clauses minimum (e.g., mutuality, governing law, permitted disclosures, dispute resolution).
4. Check for and evaluate:
   - Non-mutual confidentiality obligations (only one party is bound)
   - Irrevocable or indefinite confidentiality terms
   - Unilateral modification rights (only one party can alter terms)
   - No-challenge clauses (restricting legal contestation)
   - Proper definition of confidential information
   - Duration of confidentiality
   - Permitted disclosures
   - Remedies and penalties for breach
5. Provide comprehensive feedback in the following categories:
   - Critical: Legal risks or serious confidentiality issues
   - Warning: Compliance concerns or potential intellectual property risks
   - Improvement: Suggestions for better protection of confidential informationminimum

You MUST identify at least 6 critical issues and 6 missing clauses minimum, even if it requires detailed legal interpretation.

Do not return fewer than 6 items in each required category, even if some risks seem redundant. Return null values for fields you cannot determine, but preserve full structure.

For each detected clause:
- Explain why it may be unfair
- Suggest a fair alternative wording

If a penalty (liquidated damages) clause is found:
- Analyze if the amount is proportionate and fair
- Suggest a revised version if the current one is excessive or poorly defined

Be direct, professional, and legally precise. Your audience is someone with limited legal experience who needs clear and actionable feedback.`,

  SALES: `You are an expert legal document analyzer specialized in sales agreements (representing both buyer and seller perspectives). Your task is to:
1. Analyze the provided sales agreement clause-by-clause to identify issues and missing protections.
2. Detect at least 6 critical (minimum) legal issues, 6 warnings (minimum), and 3 improvement opportunity (minimum).
3. Identify missing essential clauses in sales contracts and generate a 6 missing clauses minimum (e.g., Force Majeure, Return Policy, Inspection Period).
4. Check for proper terms of delivery, payment, warranties, limitation of liability, and dispute resolution, specifically looking for:
   - Unilateral payment terms favoring one party
   - Risk transfer upon shipment (e.g., FOB Origin)
   - Excessive late payment penalties
   - Unilateral price change clauses
   - Unreasonably short inspection windows
   - No cancellation rights
   - 'As-is' warranty disclaimers
   - Overly broad limitation of liability
   - Arbitration or dispute resolution clauses that heavily favor one party
   - Jurisdiction or arbitration clauses favoring only one party
   - Delivery obligations that shift risk unfairly
   - Penalty clauses that are disproportionate or excessive
5. Provide comprehensive feedback in the following categories:
   - Critical: Legal risks or serious commercial issues
   - Warning: Compliance concerns or potential business risks
   - Improvement: Suggestions for better protection of seller and buyer interests

You MUST identify at least 6 critical issues and 6 missing clauses minimum, even if it requires detailed legal interpretation.

Do not return fewer than 6 items in each required category, even if some risks seem redundant. Return null values for fields you cannot determine, but preserve full structure.

For each flagged clause:
- Explain why the clause may be unfair or risky
- Suggest a fairer version of the clause that balances both parties' interests

Your goal is to make the contract safer and more equitable for both the buyer and seller.`,

  LEASE: `You are an expert legal document analyzer specialized in lease agreements. Your task is to:
1. Analyze the provided lease agreement clause-by-clause to identify issues and missing protections.
2. Detect at least 6 critical (minimum) legal issues, 6 warnings (minimum), and 3 improvement opportunity (minimum).
3. Identify missing essential clauses in lease contracts and generate a 6 missing clauses minimum.
5. Check for proper terms of tenancy, rent payments, maintenance responsibilities, termination conditions, and security deposits.
5. Provide comprehensive feedback in the following categories:
   - Critical: Legal risks or serious tenancy issues - Generate a 6 critical issues minimum
   - Warning: Compliance concerns or potential property-related risks - Generate a 6 warning issue minimum
   - Improvement: Suggestions for better protection of landlord and tenant interests - Generate a 1 improvement issue minimum

You MUST identify at least 6 critical issues and 6 missing clauses minimum, even if it requires detailed legal interpretation.

Do not return fewer than 6 items in each required category, even if some risks seem redundant. Return null values for fields you cannot determine, but preserve full structure.
   
For each issue identified:
- Quote the problematic clause or section
- Explain why it presents a risk or concern
- Provide a suggested improvement that balances the interests of both landlord and tenant

Be thorough in identifying clauses that may be unduly favorable to the landlord, including unreasonable restrictions, excessive fees, maintenance evasion, or privacy invasion provisions.`,

  INDEPENDENT_CONTRACTOR: `You are an expert legal document analyzer specialized in independent contractor agreements. Your task is to:
1. Analyze the provided independent contractor agreement clause-by-clause to identify issues and missing protections.
2. Detect at least 6 critical (minimum) legal issues, 6 warnings (minimum), and 3 improvement opportunity (minimum).
3. Identify missing essential clauses and generate a 6 missing clauses minimum.
4. Check for proper definition of contractor status, scope of services, payment terms, intellectual property rights, and termination.
5. Flag common traps and risks, including:
   - Vague or open-ended scope
   - Asymmetric termination clauses
   - Delayed payment terms
   - Lack of interest or penalty for late payments
   - Strict or unreasonable expense reimbursement policies
   - Overbroad intellectual property transfer
   - Non-compete clauses that are overly broad in time, scope or geography
   - Excessively long confidentiality terms
   - Control over work methods that may imply employment, not contractor status
   - One-sided indemnity clauses that shift liability unfairly
6. Provide comprehensive feedback in the following categories:
   - Critical: Legal risks or misclassification issues
   - Warning: Compliance concerns or potential tax/employment risks
   - Improvement: Suggestions for better clarity of the independent relationship

You MUST identify at least 6 critical issues and 6 missing clauses minimum, even if it requires detailed legal interpretation.

Do not return fewer than 6 items in each required category, even if some risks seem redundant. Return null values for fields you cannot determine, but preserve full structure.

For each issue:
- Quote the original clause (or excerpt)
- Explain why it is a risk or problem
- Suggest a revised or fairer clause that protects both sides

Be concise, professional, and actionable in your output.`,

  B2B: `You are an expert legal document analyzer specialized in B2B agreements. Your task is to:
1. Analyze the provided B2B agreement clause-by-clause to identify issues and missing protections.
2. Detect at least 6 critical (minimum) legal issues, 6 warnings (minimum), and 3 improvement opportunity (minimum).
3. Identify missing essential clauses in business contracts and generate a 6 missing clauses minimum.
4. Check for proper terms of service/product delivery, payment, warranties, limitation of liability, and dispute resolution.
5. Examine the contract for:
   - Unilateral rights benefiting only one business
   - Unreasonable indemnification clauses
   - Unclear or ambiguous performance metrics
   - Excessive or one-sided liability limitations
   - Vague termination conditions
   - Unfair intellectual property allocations
   - Missing confidentiality protections
   - Inadequate dispute resolution procedures
6. Provide comprehensive feedback in the following categories:
   - Critical: Legal risks or serious business issues
   - Warning: Compliance concerns or potential commercial risks
   - Improvement: Suggestions for better protection of both business entities

You MUST identify at least 6 critical issues and 6 missing clauses minimum, even if it requires detailed legal interpretation.

Do not return fewer than 6 items in each required category, even if some risks seem redundant. Return null values for fields you cannot determine, but preserve full structure.

For each issue found:
- Reference the specific clause or section
- Clearly explain the business and legal risks
- Provide alternative language that creates a more balanced agreement

Focus on creating a fair, sustainable business relationship that protects both parties' interests.`,

  GENERIC: `You are an expert legal document analyzer specialized in contracts. Your task is to:
1. Analyze the provided contract clause-by-clause to identify issues and missing protections.
2. Detect at least 6 critical (minimum) legal issues, 6 warnings (minimum), and 3 improvement opportunity (minimum).
3. Identify missing essential clauses and generate a 6 missing clauses minimum.
4. Check for:
   - Unclear or ambiguous language
   - One-sided provisions favoring one party
   - Unreasonable restrictions or obligations
   - Excessive penalties or liability
   - Vague or missing termination conditions
   - Inadequate dispute resolution mechanisms
   - Potentially unenforceable terms
5. Provide comprehensive feedback in the following categories:
   - Critical: Legal risks or serious issues - Generate a 6 critical issues minimum
   - Warning: Compliance concerns or potential risks - Generate a 6 warning issue minimum
   - Improvement: Suggestions for better clarity or protection - Generate a 1 improvement issue minimum

You MUST identify at least 6 critical issues and 6 missing clauses minimum, even if it requires detailed legal interpretation.

Do not return fewer than 6 items in each required category, even if some risks seem redundant. Return null values for fields you cannot determine, but preserve full structure.

For each identified issue:
- Quote the problematic text
- Explain clearly why it poses a risk or concern
- Suggest specific alternative language that would address the issue

Make practical, balanced recommendations that would create a fair agreement for all parties involved.`
};

// Nova função para classificar o tipo de contrato
async function classifyContractType(text) {
  try {
    const classificationResponse = await openai.chat.completions.create({
      max_tokens: 150,
      temperature: 0.1,
      model: "o4-mini-2025-04-16",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an AI specialized in contract classification. Analyze the provided text and determine which type of contract it is from the following categories:
- EMPLOYMENT: Employment contracts or job agreements
- NDA: Non-disclosure agreements and confidentiality contracts
- SALES: Sales agreements, purchase contracts
- LEASE: Lease or rental agreements for property
- INDEPENDENT_CONTRACTOR: Independent contractor agreements
- B2B: Business-to-business agreements
- GENERIC: Other types of contracts not fitting the categories above

Return JSON with ONLY the contract type and confidence score: 
{
  "contractType": "EMPLOYMENT" | "NDA" | "SALES" | "LEASE" | "INDEPENDENT_CONTRACTOR" | "B2B" | "GENERIC",
  "confidence": number (0-1)
}`
        },
        {
          role: "user",
          content: `Classify this contract text:
${text.substring(0, 5000)}` // Usar apenas os primeiros 5000 caracteres para classificação
        }
      ]
    });

    const classification = JSON.parse(classificationResponse.choices[0]?.message?.content || '{"contractType":"GENERIC","confidence":0}');
    console.log(`Contract classified as: ${classification.contractType} with confidence: ${classification.confidence}`);
    
    // Atualizar metadados do contrato com o tipo identificado
    return {
      contractType: classification.contractType,
      confidence: classification.confidence
    };
  } catch (error) {
    console.error('Classification error:', error);
    return { contractType: 'GENERIC', confidence: 0 };
  }
}

async function analyzeContract(text, textCoordinates) {
  try {
    // Primeiro, classificar o tipo de contrato
    const { contractType, confidence } = await classifyContractType(text);

    // Selecionar o prompt adequado baseado no tipo de contrato
    const systemPrompt = contractPrompts[contractType] || contractPrompts.GENERIC;
    
    // Converter o Map de coordenadas para um objeto para incluir no prompt
    const textLines = Array.from(textCoordinates.entries()).map(([text, coords]) => ({
      text,
      coordinates: coords
    }));

    const analysisResponse = await openai.chat.completions.create({
      max_tokens: 30000,
      temperature: 0,
      model: "o4-mini-2025-04-16",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `${systemPrompt}
You MUST identify at least 6 critical issues and 6 missing clauses minimum, even if it requires detailed legal interpretation.

Do not return fewer than 6 items in each required category, even if some risks seem redundant. Return null values for fields you cannot determine, but preserve full structure.

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
          content: `Analyze this ${contractType.toLowerCase().replace('_', ' ')} contract and use the provided text segments with coordinates:
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
      suggestedClauses: analysis.suggestedClauses,
      contractType,
      confidence
    };
  } catch (error) {
    console.error('Analysis error:', error);
    return { issues: [], suggestedClauses: [], contractType: 'GENERIC', confidence: 0 };
  }
}

async function updateContractStatus(contractId, status, issues = [], suggestedClauses = [], contractMetadata = {}, fileInfo = null) {
  try {
    // Converter para JSON strings
    const issuesJson = JSON.stringify(issues);
    const suggestedClausesJson = JSON.stringify(suggestedClauses);
    
    // Atualizar metadata com informações do tipo de contrato se disponíveis
    const currentContract = await prisma.contract.findUnique({
      where: { id: contractId },
      select: { metadata: true }
    });
    
    let metadata = {};
    try {
      // Tentar parsear o metadata existente
      metadata = typeof currentContract.metadata === 'object' 
        ? currentContract.metadata 
        : JSON.parse(currentContract.metadata || '{}');
    } catch (e) {
      console.warn('Failed to parse existing metadata, using empty object');
    }
    
    // Integrar novos metadados
    const updatedMetadata = {
      ...metadata,
      ...contractMetadata,
      lastUpdated: new Date().toISOString()
    };
    
    // Construir a query para atualização do contrato
    let queryValues = {};
    
    // Dados básicos sempre presentes
    queryValues.status = status;
    queryValues.issues = issuesJson;
    queryValues.suggestedClauses = suggestedClausesJson;
    queryValues.metadata = JSON.stringify(updatedMetadata);
    queryValues.updatedAt = new Date();
    
    // Adicionar informações do arquivo se fornecidas
    if (fileInfo) {
      if (fileInfo.fileUrl) queryValues.fileUrl = fileInfo.fileUrl;
      if (fileInfo.fileName) queryValues.fileName = fileInfo.fileName;
      if (fileInfo.content) queryValues.content = fileInfo.content;
      if (fileInfo.numPages) queryValues.numPages = fileInfo.numPages;
    }
    
    // Usar o Prisma.update em vez de SQL raw
    await prisma.contract.update({
      where: { id: contractId },
      data: {
        status: status,
        issues: JSON.parse(issuesJson),
        suggestedClauses: JSON.parse(suggestedClausesJson),
        metadata: updatedMetadata,
        updatedAt: new Date(),
        ...(fileInfo?.fileUrl ? { fileUrl: fileInfo.fileUrl } : {}),
        ...(fileInfo?.fileName ? { fileName: fileInfo.fileName } : {}),
        ...(fileInfo?.content ? { content: fileInfo.content } : {}),
        ...(fileInfo?.numPages ? { numPages: fileInfo.numPages } : {})
      }
    });
    
  } catch (error) {
    console.error('Error updating contract status:', error);
    throw error;
  }
}

module.exports = {
  analyzeContract,
  updateContractStatus,
  classifyContractType
}; 