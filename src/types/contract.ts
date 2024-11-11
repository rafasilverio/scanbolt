export type HighlightType = 'critical' | 'warning' | 'improvement';

export interface Highlight {
  id: string;
  type: HighlightType;
  message: string;
  suggestion?: string;
  startIndex: number;
  endIndex: number;
}

export interface AIChange {
  id: string;
  content: string;
  originalContent: string;
  explanation: string;
  suggestion: string;
  status: 'accepted' | 'rejected' | 'pending';
  reason: string;
  type: 'critical' | 'warning' | 'improvement';
  startIndex: number;
  endIndex: number;
}

export interface Contract {
  id: string;
  title: string;
  content: string;
  fileUrl: string;  // Add this
  fileType: string; // Add this
  highlights: Highlight[];
  changes: AIChange[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'under_review' | 'approved' | 'rejected' | 'generating';
}

// Example contract with 25 issues
export const exampleContract: Contract = {
  id: "1",
  title: "Software Development Agreement",
  fileUrl: "äaa",
  fileType: "äaaaaa",
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
    {
      id: "c2",
      type: "critical",
      message: "Incomplete payment terms",
      suggestion: "Specify currency and payment method",
      startIndex: 800,
      endIndex: 850,
    },
    {
      id: "c3",
      type: "critical",
      message: "Undefined warranty period",
      suggestion: "Specify exact warranty duration (e.g., '12 months')",
      startIndex: 1200,
      endIndex: 1250,
    },
    {
      id: "c4",
      type: "critical",
      message: "Missing dispute resolution clause",
      suggestion: "Add arbitration or mediation procedures",
      startIndex: 1500,
      endIndex: 1550,
    },
    {
      id: "c5",
      type: "critical",
      message: "Incomplete intellectual property transfer terms",
      suggestion: "Specify the exact scope of IP rights transfer",
      startIndex: 900,
      endIndex: 950,
    },
    {
      id: "c6",
      type: "critical",
      message: "Undefined acceptance criteria",
      suggestion: "Add specific criteria for software acceptance",
      startIndex: 600,
      endIndex: 650,
    },
    {
      id: "c7",
      type: "critical",
      message: "Missing force majeure clause",
      suggestion: "Add force majeure provisions",
      startIndex: 1400,
      endIndex: 1450,
    },
    {
      id: "c8",
      type: "critical",
      message: "Incomplete termination consequences",
      suggestion: "Specify the effects of contract termination",
      startIndex: 1300,
      endIndex: 1350,
    },

    // Warnings (9)
    {
      id: "w1",
      type: "warning",
      message: "Vague project timeline",
      suggestion: "Add specific dates or durations",
      startIndex: 400,
      endIndex: 450,
    },
    {
      id: "w2",
      type: "warning",
      message: "Unclear maintenance terms",
      suggestion: "Define maintenance scope and response times",
      startIndex: 1100,
      endIndex: 1150,
    },
    {
      id: "w3",
      type: "warning",
      message: "Broad confidentiality clause",
      suggestion: "Specify types of confidential information",
      startIndex: 1000,
      endIndex: 1050,
    },
    {
      id: "w4",
      type: "warning",
      message: "Unspecified testing procedures",
      suggestion: "Define testing methodology and acceptance criteria",
      startIndex: 500,
      endIndex: 550,
    },
    {
      id: "w5",
      type: "warning",
      message: "Missing change request procedure",
      suggestion: "Add process for handling scope changes",
      startIndex: 700,
      endIndex: 750,
    },
    {
      id: "w6",
      type: "warning",
      message: "Unclear bug fixing responsibilities",
      suggestion: "Define bug severity levels and response times",
      startIndex: 1150,
      endIndex: 1200,
    },
    {
      id: "w7",
      type: "warning",
      message: "Vague delivery format specification",
      suggestion: "Specify delivery format and documentation requirements",
      startIndex: 550,
      endIndex: 600,
    },
    {
      id: "w8",
      type: "warning",
      message: "Incomplete contact information",
      suggestion: "Add primary contact details for both parties",
      startIndex: 200,
      endIndex: 250,
    },
    {
      id: "w9",
      type: "warning",
      message: "Missing escalation procedures",
      suggestion: "Define escalation path for disputes",
      startIndex: 1450,
      endIndex: 1500,
    },

    // Improvements (8)
    {
      id: "i1",
      type: "improvement",
      message: "Consider adding milestone payments",
      suggestion: "Break down payment schedule into smaller milestones",
      startIndex: 850,
      endIndex: 900,
    },
    {
      id: "i2",
      type: "improvement",
      message: "Add version control requirements",
      suggestion: "Specify version control system and branching strategy",
      startIndex: 450,
      endIndex: 500,
    },
    {
      id: "i3",
      type: "improvement",
      message: "Consider adding performance metrics",
      suggestion: "Define specific performance requirements",
      startIndex: 650,
      endIndex: 700,
    },
    {
      id: "i4",
      type: "improvement",
      message: "Add documentation requirements",
      suggestion: "Specify required documentation deliverables",
      startIndex: 750,
      endIndex: 800,
    },
    {
      id: "i5",
      type: "improvement",
      message: "Consider adding security requirements",
      suggestion: "Specify security standards and compliance needs",
      startIndex: 950,
      endIndex: 1000,
    },
    {
      id: "i6",
      type: "improvement",
      message: "Add data backup provisions",
      suggestion: "Specify backup requirements and procedures",
      startIndex: 1050,
      endIndex: 1100,
    },
    {
      id: "i7",
      type: "improvement",
      message: "Consider adding training requirements",
      suggestion: "Specify training deliverables and schedule",
      startIndex: 350,
      endIndex: 400,
    },
    {
      id: "i8",
      type: "improvement",
      message: "Add maintenance SLA details",
      suggestion: "Define specific service level agreements",
      startIndex: 250,
      endIndex: 300,
    },
  ],
  changes: [],
  createdAt: "2024-03-20T10:00:00Z",
  updatedAt: "2024-03-20T10:00:00Z",
  status: "under_review",
};
