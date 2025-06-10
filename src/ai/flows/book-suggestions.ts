'use server';

/**
 * @fileOverview Book suggestion AI agent.
 *
 * - suggestBooks - A function that handles the book suggestion process.
 * - SuggestBooksInput - The input type for the suggestBooks function.
 * - SuggestBooksOutput - The return type for the suggestBooks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBooksInputSchema = z.object({
  issuedBookTitle: z.string().describe('The title of the book that was issued.'),
  studentName: z.string().describe('The name of the student who issued the book.'),
});
export type SuggestBooksInput = z.infer<typeof SuggestBooksInputSchema>;

const SuggestBooksOutputSchema = z.object({
  suggestedBooks: z
    .array(z.string())
    .describe('An array of suggested book titles similar to the issued book.'),
});
export type SuggestBooksOutput = z.infer<typeof SuggestBooksOutputSchema>;

export async function suggestBooks(input: SuggestBooksInput): Promise<SuggestBooksOutput> {
  return suggestBooksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBooksPrompt',
  input: {schema: SuggestBooksInputSchema},
  output: {schema: SuggestBooksOutputSchema},
  prompt: `You are a helpful librarian bot. A student named {{{studentName}}} has issued the book "{{{issuedBookTitle}}}". Suggest 3 other books they might enjoy reading. Just give the titles of the books in a JSON array.`, // Changed to only ask for titles in a JSON array
});

const suggestBooksFlow = ai.defineFlow(
  {name: 'suggestBooksFlow', inputSchema: SuggestBooksInputSchema, outputSchema: SuggestBooksOutputSchema},
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
