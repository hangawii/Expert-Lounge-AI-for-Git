import { UserProfile } from '../types';
import { saveUserData as submitToGoogleSheet } from './submissionService';

const DB_KEY = 'expert_lounge_users_v2';

// Extend UserProfile to include password for storage (internally)
interface StoredUser extends UserProfile {
  password: string;
  createdAt: string;
}

// Mock Database interaction using localStorage
const getDb = (): StoredUser[] => {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : [];
};

const saveDb = (users: StoredUser[]) => {
  localStorage.setItem(DB_KEY, JSON.stringify(users));
};

export const authService = {
  /**
   * Register a new user.
   * 1. Check if email exists.
   * 2. Save to local storage (mock DB).
   * 3. Send to Google Sheets (Admin notification).
   */
  register: async (data: UserProfile & { password: string }): Promise<UserProfile> => {
    const users = getDb();
    const existing = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());

    if (existing) {
      throw new Error("이미 등록된 이메일입니다. 로그인해주세요.");
    }

    const newUser: StoredUser = {
      ...data,
      createdAt: new Date().toISOString()
    };

    // 1. Save to Local DB
    users.push(newUser);
    saveDb(users);

    // 2. Submit to Google Sheets (Fire and forget or await based on preference)
    // We await it here to ensure data integrity before letting them in
    try {
        await submitToGoogleSheet({
            name: data.name,
            email: data.email,
            phone: data.phone,
            company: data.company,
            department: data.department || ''
        });
    } catch (e) {
        console.warn("Google Sheet submission failed, but local registration succeeded.", e);
    }

    // Return profile without password
    const { password, ...profile } = newUser;
    return profile;
  },

  /**
   * Login user.
   * Check credentials against local storage.
   */
  login: async (email: string, pass: string): Promise<UserProfile> => {
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 600));

    const users = getDb();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error("등록되지 않은 이메일입니다.");
    }

    if (user.password !== pass) {
        throw new Error("비밀번호가 일치하지 않습니다.");
    }

    // Return profile without password
    const { password, ...profile } = user;
    return profile;
  }
};
