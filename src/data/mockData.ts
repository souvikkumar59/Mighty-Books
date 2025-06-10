
import type { Book, Student, IssuedBook, User, BookRequest, ReturnRequest } from '@/types';
import { addDays, formatISO, isPast, parseISO } from 'date-fns';

export const mockBooks: Book[] = [
  { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', coverImageUrl: 'https://placehold.co/300x450.png', description: 'A story of wealth, love, and tragedy in the Jazz Age.', availableCopies: 3, totalCopies: 5 },
  { id: '2', title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', coverImageUrl: 'https://placehold.co/300x450.png', description: 'A classic of modern American literature, focusing on racial injustice.', availableCopies: 2, totalCopies: 3 },
  { id: '3', title: '1984', author: 'George Orwell', isbn: '9780451524935', coverImageUrl: 'https://placehold.co/300x450.png', description: 'A dystopian novel set in a totalitarian society.', availableCopies: 5, totalCopies: 5 },
  { id: '4', title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '9780141439518', coverImageUrl: 'https://placehold.co/300x450.png', description: 'A romantic novel that also critiques the British gentry.', availableCopies: 0, totalCopies: 2 },
  { id: '5', title: 'The Catcher in the Rye', author: 'J.D. Salinger', isbn: '9780316769488', coverImageUrl: 'https://placehold.co/300x450.png', description: 'A story about teenage angst and alienation.', availableCopies: 1, totalCopies: 4 },
  { id: '6', title: 'Brave New World', author: 'Aldous Huxley', isbn: '9780060850524', coverImageUrl: 'https://placehold.co/300x450.png', description: 'A dystopian novel about a future society.', availableCopies: 4, totalCopies: 6},
  { id: '7', title: 'Moby Dick', author: 'Herman Melville', isbn: '9781503280786', coverImageUrl: 'https://placehold.co/300x450.png', description: 'The saga of Captain Ahab and his relentless pursuit of the great white whale.', availableCopies: 2, totalCopies: 3},
];

export const mockStudents: Student[] = [
  { id: 's1', name: 'Alice Wonderland', studentId: 'S1001', password: 'password123' },
  { id: 's2', name: 'Bob The Builder', studentId: 'S1002', password: 'password123' },
  { id: 's3', name: 'Charlie Brown', studentId: 'S1003', password: 'password123' },
];

const today = new Date();
export const mockIssuedBooks: IssuedBook[] = [
  { 
    id: 'ib1', 
    bookId: '1', 
    studentName: 'Alice Wonderland', 
    studentId: 's1',
    issueDate: formatISO(addDays(today, -20)), 
    dueDate: formatISO(addDays(today, -6)), 
    returnDate: null, 
  },
  { 
    id: 'ib2', 
    bookId: '3', 
    studentName: 'Bob The Builder', 
    studentId: 's2',
    issueDate: formatISO(addDays(today, -10)), 
    dueDate: formatISO(addDays(today, 4)), 
    returnDate: null,
  },
  { 
    id: 'ib3', 
    bookId: '2', 
    studentName: 'Alice Wonderland', 
    studentId: 's1',
    issueDate: formatISO(addDays(today, -30)), 
    dueDate: formatISO(addDays(today, -16)), 
    returnDate: formatISO(addDays(today, -10)), 
    fineAmount: 6, 
  },
   { 
    id: 'ib4', 
    bookId: '5', 
    studentName: 'Charlie Brown', 
    studentId: 's3',
    issueDate: formatISO(addDays(today, -5)), 
    dueDate: formatISO(addDays(today, 9)), 
    returnDate: null,
  },
];

export const mockUsers: User[] = [
  { id: 'u1', username: 'librarian', role: 'librarian', password: 'password123' },
  { id: 'u2', username: 'admin', role: 'admin', password: 'adminpass' },
];

export const mockBookRequests: BookRequest[] = [];
export const mockReturnRequests: ReturnRequest[] = [];


export interface StudentDelinquencyStatus {
  overdueBooksCount: number;
  unpaidFinesCount: number;
  isDelinquent: boolean;
}

export function getStudentDelinquencyStatus(studentId: string): StudentDelinquencyStatus {
  const overdueBooksCount = mockIssuedBooks.filter(
    ib => ib.studentId === studentId && !ib.returnDate && isPast(parseISO(ib.dueDate))
  ).length;

  const unpaidFinesCount = mockIssuedBooks.filter(
    ib => ib.studentId === studentId && ib.returnDate && ib.fineAmount && ib.fineAmount > 0
  ).length; // Assuming any recorded fine on a returned book is "unpaid"

  return {
    overdueBooksCount,
    unpaidFinesCount,
    isDelinquent: overdueBooksCount > 0 || unpaidFinesCount > 0,
  };
}
