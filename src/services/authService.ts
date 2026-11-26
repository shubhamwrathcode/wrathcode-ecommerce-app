import { RULES } from '@/config/rules';
import type { User } from '@/types/models';
import { uid } from '@/utils/id';
import { ApiError, simulate } from './apiClient';
import { db, LocalUser } from './db';

const strip = ({ password: _pw, ...u }: LocalUser): User => u;
const findByMobile = (mobile: string) =>
  db.get().users.find(u => u.mobile === mobile);

export const authService = {
  /** Dummy OTP: nothing is sent, the demo OTP is always RULES.auth.demoOtp. */
  async sendOtp(
    mobile: string,
  ): Promise<{ sent: true; isRegistered: boolean }> {
    return simulate(() => ({
      sent: true as const,
      isRegistered: !!findByMobile(mobile),
    }));
  },

  /** Returns the user, or `null` for a new mobile (goes to profile setup). */
  async verifyOtp(mobile: string, otp: string): Promise<User | null> {
    return simulate(() => {
      if (otp !== RULES.auth.demoOtp)
        throw new ApiError('INVALID_OTP', 'Invalid OTP. Please try again');
      const u = findByMobile(mobile);
      return u ? strip(u) : null;
    });
  },

  async loginWithEmail(email: string, password: string): Promise<User> {
    return simulate(() => {
      const u = db
        .get()
        .users.find(x => x.email.toLowerCase() === email.trim().toLowerCase());
      if (!u || u.password !== password)
        throw new ApiError(
          'INVALID_CREDENTIALS',
          'Incorrect email or password',
        );
      return strip(u);
    });
  },

  async signUp(input: {
    name: string;
    mobile: string;
    email: string;
    password: string;
  }): Promise<User> {
    return simulate(() => {
      if (findByMobile(input.mobile))
        throw new ApiError(
          'EXISTS',
          'An account with this mobile number already exists',
        );
      if (
        input.email &&
        db
          .get()
          .users.some(u => u.email.toLowerCase() === input.email.toLowerCase())
      ) {
        throw new ApiError(
          'EXISTS',
          'An account with this email already exists',
        );
      }
      const user: LocalUser = {
        id: uid('u_'),
        name: input.name.trim(),
        mobile: input.mobile,
        email: input.email.trim(),
        password: input.password,
        gender: '',
        dob: '',
        avatar: null,
        createdAt: new Date().toISOString(),
      };
      db.update(s => {
        s.users.push(user);
      });
      return strip(user);
    });
  },

  /** Profile setup after first OTP login for a new mobile (Flow A). */
  async completeProfile(input: {
    mobile: string;
    name: string;
    email: string;
  }): Promise<User> {
    return authService.signUp({ ...input, password: '' });
  },

  async resetPassword(mobile: string, password: string): Promise<void> {
    return simulate(() => {
      if (!findByMobile(mobile))
        throw new ApiError(
          'NOT_FOUND',
          'No account found with this mobile number',
        );
      db.update(s => {
        const u = s.users.find(x => x.mobile === mobile);
        if (u) u.password = password;
      });
    });
  },

  async updateProfile(user: User): Promise<User> {
    return simulate(() => {
      const clash = db
        .get()
        .users.find(
          u =>
            u.id !== user.id &&
            user.email &&
            u.email.toLowerCase() === user.email.toLowerCase(),
        );
      if (clash)
        throw new ApiError(
          'EXISTS',
          'This email is already used by another account',
        );
      db.update(s => {
        const u = s.users.find(x => x.id === user.id);
        if (u) Object.assign(u, user);
      });
      return user;
    });
  },
};
