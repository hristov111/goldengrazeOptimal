import { z } from 'zod';

// Profile validation schema
export const profileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be less than 80 characters')
    .trim()
});

// Email validation schema
export const emailSchema = z.object({
  newEmail: z.string().email('Please enter a valid email address'),
  currentPassword: z.string().min(1, 'Current password is required')
});

// Password validation schema
export const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/(?=.*\d)/, 'Password must contain at least one number')
    .regex(/(?=.*[^A-Za-z0-9])/, 'Password must contain at least one special character'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
}).refine((data) => data.newPassword !== data.currentPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"]
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type EmailFormData = z.infer<typeof emailSchema>;
export type PasswordFormData = z.infer<typeof passwordSchema>;

// Support validation schemas
export const contactFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  category: z.enum(['order', 'billing', 'shipping', 'product', 'technical', 'other']),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
  orderNumber: z.string().optional(),
  priority: z.enum(['normal', 'high']).default('normal')
});

export const messageFormSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must be less than 2000 characters')
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type MessageFormData = z.infer<typeof messageFormSchema>;