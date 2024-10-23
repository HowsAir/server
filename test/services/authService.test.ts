/**
 * @file authService.test.ts
 * @brief Unit tests for the authentication service
 * @author Manuel Borregales
 */
import { expect, test, vi } from 'vitest'; // Import vitest functions for testing and mocking
import { authService } from '../../src/services/authService'; // Import the authService to be tested
import prisma from '../../src/libs/__mocks__/prisma';  // Import the Prisma mock
import bcrypt from 'bcryptjs'; // Import bcrypt for password comparison
import { UserRole } from '@prisma/client'; // Import user roles from Prisma

// Mock the prisma and bcrypt libraries using Vitest's mock functions
vi.mock('../../src/libs/prisma'); // Mock Prisma to avoid database calls
vi.mock('bcryptjs'); // Mock bcrypt to avoid actual password hashing

test('login should return the user when credentials are valid', async () => {
  const mockUser = {
    email: 'user@prisma.io', 
    name: 'Prisma Fan', 
    password: 'hashed_password', 
    role: UserRole.BASIC
  };

  // Mock the database call to find the user by email, returning the mockUser
  prisma.user.findUnique.mockResolvedValue({ ...mockUser, id: 1 });

  // Mock bcrypt comparison to simulate a successful password check
  bcrypt.compare = vi.fn().mockResolvedValue(true);

  // Test inputs
  const email = 'user@prisma.io';
  const password = 'hello'; // The plain-text password the user provides

  // Call the login function
  const user = await authService.login(email, password);

  // Assert that the user is returned with the expected data
  expect(user).toStrictEqual({ ...mockUser, id: 1 });
});

test('login should return null when user is not found', async () => {
   // Mock the database call to return null, simulating a non-existent user
   prisma.user.findUnique.mockResolvedValue(null);

   // Test inputs
   const email = 'nonexistent@example.com';
   const password = 'plaintext_password';
 
   // Call the login function
   const user = await authService.login(email, password);
 
   // Assert that null is returned when no user is found
   expect(user).toBeNull();
});

test('login should return null when password is invalid', async () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashed_password',
    name: "pepe",
    role: UserRole.BASIC,
  };

  // Mock the database call to return the mockUser
  prisma.user.findUnique.mockResolvedValue(mockUser);

  // Mock bcrypt comparison to simulate an incorrect password
  bcrypt.compare = vi.fn().mockResolvedValue(false);

  // Test inputs
  const email = 'test@example.com';
  const password = 'wrong_password'; // Incorrect password input

  // Call the login function
  const user = await authService.login(email, password);

  // Assert that null is returned when the password is incorrect
  expect(user).toBeNull();
});
