import * as yup from 'yup';
import { t } from '@/i18n';
import {
  DOB_REGEX,
  EMAIL_REGEX,
  MOBILE_REGEX,
  PASSWORD_REGEX,
  PINCODE_REGEX,
} from './validators';

/** Validation schemas for every form (React Hook Form + Yup, section 3.1 / 7.8). */
const v = t.validation;

export const mobileField = yup
  .string()
  .required(v.mobile)
  .matches(MOBILE_REGEX, v.mobile);
export const emailField = yup
  .string()
  .trim()
  .required(v.email)
  .matches(EMAIL_REGEX, v.email);
export const optionalEmail = yup
  .string()
  .trim()
  .default('')
  .test('email', v.email, val => !val || EMAIL_REGEX.test(val));
export const passwordField = yup
  .string()
  .required(v.password)
  .matches(PASSWORD_REGEX, v.password);
export const nameField = yup.string().trim().required(v.name).min(2, v.name);

export const mobileSchema = yup.object({ mobile: mobileField });
export const emailLoginSchema = yup.object({
  email: emailField,
  password: yup.string().required(t.common.required),
});
export const signUpSchema = yup.object({
  name: nameField,
  mobile: mobileField,
  email: optionalEmail,
  password: passwordField,
});
export const resetPasswordSchema = yup.object({
  password: passwordField,
  confirm: yup
    .string()
    .required(t.common.required)
    .oneOf([yup.ref('password')], t.auth.passwordsDontMatch),
});
export const profileSetupSchema = yup.object({
  name: nameField,
  email: optionalEmail,
});
export const editProfileSchema = yup.object({
  name: nameField,
  email: optionalEmail,
  gender: yup.string().oneOf(['male', 'female', 'other', '']).default(''),
  dob: yup
    .string()
    .default('')
    .test('dob', v.dob, val => !val || DOB_REGEX.test(val)),
});

export const addressSchema = yup.object({
  name: nameField,
  mobile: mobileField,
  pincode: yup.string().required(v.pincode).matches(PINCODE_REGEX, v.pincode),
  line1: yup.string().trim().required(t.common.required),
  line2: yup.string().trim().required(t.common.required),
  landmark: yup.string().trim().default(''),
  city: yup.string().trim().required(t.common.required),
  state: yup.string().trim().required(t.common.required),
  type: yup
    .mixed<'Home' | 'Work' | 'Other'>()
    .oneOf(['Home', 'Work', 'Other'])
    .required(),
  isDefault: yup.boolean().default(false),
});

export type MobileForm = yup.InferType<typeof mobileSchema>;
export type EmailLoginForm = yup.InferType<typeof emailLoginSchema>;
export type SignUpForm = yup.InferType<typeof signUpSchema>;
export type ResetPasswordForm = yup.InferType<typeof resetPasswordSchema>;
export type ProfileSetupForm = yup.InferType<typeof profileSetupSchema>;
export type EditProfileForm = yup.InferType<typeof editProfileSchema>;
export type AddressForm = yup.InferType<typeof addressSchema>;
