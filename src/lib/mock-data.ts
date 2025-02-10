import { Contract } from '@/types/contract';

export const mockContract: Contract = {
  id: "1",
  userId: "user123",
  fileName: "Software Development Agreement",
  fileType: "application/pdf",
  content: `SOFTWARE DEVELOPMENT AGREEMENT

This Software Development Agreement (the "Agreement") is made and entered into on [DATE] by and between:

[CLIENT NAME], a company organized and existing under the laws of [JURISDICTION], with its principal place of business at [ADDRESS] (hereinafter referred to as the "Client")

and

[DEVELOPER NAME], a software development company organized and existing under the laws of [JURISDICTION], with its principal place of business at [ADDRESS] (hereinafter referred to as the "Developer")

1. SCOPE OF WORK

1.1 The Developer agrees to design, develop, and deliver a software application (the "Software") according to the specifications provided in Appendix A.

1.2 The Software shall include the following features and functionalities: [LIST OF FEATURES]

2. TIMELINE AND DELIVERABLES

2.1 The development process shall be divided into the following phases:
- Planning and Design: [DURATION]
- Development: [DURATION]
- Testing: [DURATION]
- Deployment: [DURATION]

3. PAYMENT TERMS

3.1 The total cost for the development of the Software shall be [AMOUNT].

3.2 Payment schedule:
- 30% upon signing this Agreement
- 40% upon completion of development phase
- 30% upon final delivery and acceptance

4. INTELLECTUAL PROPERTY

4.1 Upon full payment, all intellectual property rights to the Software shall be transferred to the Client.

5. WARRANTY AND MAINTENANCE

5.1 The Developer warrants that the Software will be free from material defects for a period of [DURATION] from the date of final delivery.

6. CONFIDENTIALITY

6.1 Both parties agree to maintain the confidentiality of any proprietary information shared during the development process.

7. TERMINATION

7.1 Either party may terminate this Agreement with 60 days written notice.

8. GOVERNING LAW

8.1 This Agreement shall be governed by the laws of [JURISDICTION].

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.

Client:
_______________________
[CLIENT NAME]
[TITLE]
[DATE]

Developer:
_______________________  
[DEVELOPER NAME]
[TITLE] 
[DATE]`,
  fileUrl: "/mock-contract.pdf",
  issues: [
    {
      id: "issue1",
      type: "critical",
      originalText: "Either party may terminate this Agreement with 30 days written notice.",
      newText: "Either party may terminate this Agreement with 60 days written notice.",
      explanation: "Standard industry practice requires 60 days notice for termination.",
      riskType: "legal",
      status: "pending",
      position: {
        startIndex: 1500,
        endIndex: 1570,
        pageNumber: 1,
        x1: 50,
        y1: 500,
        x2: 500,
        y2: 520,
        width: 450,
        height: 20
      }
    }
  ],
  suggestedClauses: [
    {
      id: "clause1",
      title: "Force Majeure",
      explanation: "Add protection against unforeseen circumstances",
      suggestedText: "Neither party shall be liable for any failure or delay...",
      riskType: "legal",
      status: "pending",
      suggestedPosition: {
        afterClause: "7. TERMINATION",
        pageNumber: 2
      }
    }
  ],
  status: "analyzing",
  metadata: {
    pageCount: 3,
    createdAt: new Date("2024-03-20T10:00:00Z"),
    updatedAt: new Date("2024-03-20T10:00:00Z")
  }
};
