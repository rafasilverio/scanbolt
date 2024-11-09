import ContractViewer from "@/components/contracts/ContractViewer";
import { Contract } from "@/types/contract";

const mockContract: Contract = {
  id: '1',
  title: 'Rental Agreement',
  content: `This Rental Agreement ("Agreement") is made and entered into on [DATE] by and between [LANDLORD NAME] ("Landlord") and [TENANT NAME] ("Tenant").

1. Property: The Landlord agrees to rent to the Tenant the property located at [ADDRESS].

2. Term: The term of this Agreement shall be for 12 months, beginning on [START DATE] and ending on [END DATE].

3. Rent: Tenant agrees to pay monthly rent of $2,000 on the first day of each month.

4. Security Deposit: Tenant shall pay a security deposit of $2,000 upon signing this Agreement.`,
  highlights: [
    {
      id: 'h1',
      type: 'critical',
      startIndex: 120,
      endIndex: 135,
      message: 'Missing specific date',
      suggestion: 'Add the specific date of the agreement'
    },
    {
      id: 'h2',
      type: 'warning',
      startIndex: 300,
      endIndex: 320,
      message: 'Rent terms need clarification',
      suggestion: 'Specify payment methods and late payment penalties'
    }
  ],
  comments: [],
  aiChanges: [
    {
      id: 'ai1',
      originalText: '[DATE]',
      suggestedText: 'November 8, 2024',
      reason: 'Specific dates are required for legal validity',
      startIndex: 120,
      endIndex: 135,
      status: 'pending',
      type: 'critical'
    },
    {
      id: 'ai2',
      originalText: '$2,000',
      suggestedText: '$2,000 (Two Thousand Dollars)',
      reason: 'Amount should be written in both numbers and words for clarity',
      startIndex: 300,
      endIndex: 320,
      status: 'pending',
      type: 'improvement'
    }
  ],
  status: 'completed',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export default function ContractPage() {
  return <ContractViewer contract={mockContract} />;
}
