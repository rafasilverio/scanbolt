import { Contract } from '@/types/contract';

export const mockContract: Contract = {
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
      type: 'warning',
      startIndex: 120,
      endIndex: 135,
      message: 'Missing specific date'
    },
    {
      id: 'h2',
      type: 'critical',
      startIndex: 300,
      endIndex: 320,
      message: 'Rent terms need clarification'
    }
  ],
  suggestions: [
    {
      id: 's1',
      type: 'improvement',
      message: 'Add specific payment methods',
      recommendation: 'Include accepted payment methods (e.g., bank transfer, check) and payment processing details.'
    },
    {
      id: 's2',
      type: 'critical',
      message: 'Missing late payment terms',
      recommendation: 'Add clause specifying late payment fees and grace period.'
    }
  ],
  status: 'completed',
  createdAt: new Date().toISOString()
};
