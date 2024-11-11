import { Contract } from '@/types/contract';

export const mockContract: Contract = {
  id: "1",
  title: "Software Development Agreement",
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

7.1 Either party may terminate this Agreement with 30 days written notice.

8. GOVERNING LAW

8.1 This Agreement shall be governed by the laws of [JURISDICTION].

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.

[SIGNATURES]`,
  fileUrl: "/mock-contract.pdf",
  fileType: "application/pdf",
  highlights: [
    // Critical Issues (8)
    {
      id: "c1",
      type: "critical",
      message: "Missing specific jurisdiction definition",
      suggestion: "Define specific jurisdiction (e.g., 'State of California, United States')",
      startIndex: 150,
      endIndex: 165,
    },
    // ... (previous 7 critical issues)

    // Warnings (9)
    {
      id: "w1",
      type: "warning",
      message: "Vague project timeline",
      suggestion: "Add specific dates or durations",
      startIndex: 400,
      endIndex: 450,
    },
    // ... (previous 8 warning issues)

    // Improvements (8)
    {
      id: "i1",
      type: "improvement",
      message: "Consider adding milestone payments",
      suggestion: "Break down payment schedule into smaller milestones",
      startIndex: 850,
      endIndex: 900,
    },
    // ... (previous 7 improvement issues)
  ],
  changes: [
    {
      id: "change1",
      content: "State of California, United States",
      originalContent: "California",
      explanation: "Specify the jurisdiction explicitly",
      suggestion: "Define specific jurisdiction (e.g., 'State of California, United States')",
      status: 'pending' as const,
      reason: "Adding explicit jurisdiction helps avoid ambiguity in legal interpretation",
      type: "critical" as const,
      startIndex: 123,
      endIndex: 145,
    },
    {
      id: "change2",
      content: "Planning and Design: 4 weeks\nDevelopment: 12 weeks\nTesting: 3 weeks\nDeployment: 1 week",
      originalContent: "4 weeks\n12 weeks\n3 weeks\n1 week",
      explanation: "Add specific timeline durations",
      suggestion: "Add specific dates or durations",
      status: 'pending' as const,
      reason: "Adding specific durations helps avoid ambiguity in project timelines",
      type: "warning" as const,
      startIndex: 400,
      endIndex: 450,
    },
    {
      id: "change3",
      content: "Payment milestones:\n- 20% upon signing\n- 20% after requirements approval\n- 30% after development\n- 20% after testing\n- 10% after deployment",
      originalContent: "30% after development\n20% after testing\n10% after deployment",
      explanation: "More granular payment schedule",
      suggestion: "Break down payment schedule into smaller milestones",
      status: 'pending' as const,
      reason: "Breaking down payment schedule into smaller milestones helps avoid ambiguity in payment terms",
      type: "improvement" as const,
      startIndex: 850,
      endIndex: 900,
    }
  ],
  createdAt: "2024-03-20T10:00:00Z",
  updatedAt: "2024-03-20T10:00:00Z",
  status: "under_review"
};
