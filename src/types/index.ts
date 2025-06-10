
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  coverImageUrl?: string;
  description?: string;
  availableCopies: number;
  totalCopies: number;
}

export interface Student {
  id: string;
  name: string;
  studentId: string; // e.g., university ID
  password?: string; // Added for login
}

export interface IssuedBook {
  id: string;
  bookId: string;
  studentName: string; // For simplicity, directly storing name - or could be studentId
  studentId?: string; // To link back to the student record
  issueDate: string; // ISO Date string
  dueDate: string; // ISO Date string
  returnDate?: string | null; // ISO Date string
  fineAmount?: number;
}

export interface User {
  id: string;
  username: string;
  role: 'librarian' | 'admin';
  password?: string; // Added for login
}

export interface BookRequest {
  id: string;
  bookId: string;
  studentId: string;
  studentName: string;
  requestDate: string; // ISO Date string
  status: 'pending' | 'approved' | 'rejected';
}

export interface ReturnRequest {
  id: string;
  issuedBookId: string; // Reference to the specific issued book
  studentId: string;
  studentName: string; // Denormalized for easier display
  bookTitle: string; // Denormalized for easier display
  requestDate: string; // ISO Date string
  status: 'pending' | 'approved' | 'rejected';
}
