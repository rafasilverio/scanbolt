import { z } from 'zod';

export const ContractFileSchema = z.object({
  file: z.any().refine(
    (file) => {
      if (!(file instanceof File)) return false;
      
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      return validTypes.includes(file.type);
    },
    { message: 'Invalid file type. Please upload PDF, DOC, DOCX, or TXT files.' }
  ).refine(
    (file) => file instanceof File && file.size <= 10 * 1024 * 1024,
    { message: 'File too large. Maximum size is 10MB.' }
  )
});

export type ContractFileInput = z.infer<typeof ContractFileSchema>;
