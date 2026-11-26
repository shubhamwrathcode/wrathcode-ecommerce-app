export interface Palette {
  primary: string;
  primaryDark: string;
  primarySoft: string;
  accent: string;
  accentDark: string;
  accentSoft: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textOnPrimary: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  rating: string;
  skeleton: string;
  overlay: string;
  tabInactive: string;
}

/**
 * Wrathcode brand palette (taken from the company logo):
 * royal violet #7C03B2, magenta #DE24F8, deep plum #410574 / #54018B,
 * night navy #09101C. CTAs and hero surfaces use linear gradients of these.
 */
export const brand = {
  violet: '#7C03B2',
  magenta: '#DE24F8',
  orchid: '#A218C2',
  plum: '#54018B',
  deepPlum: '#410574',
  night: '#09101C',
} as const;

export const lightColors: Palette = {
  primary: '#7C03B2',
  primaryDark: '#54018B',
  primarySoft: '#F3E8FB',
  accent: '#B11BD8',
  accentDark: '#8E0FB8',
  accentSoft: '#FBEAFE',
  background: '#F7F4FB',
  surface: '#FFFFFF',
  surfaceAlt: '#FAF7FD',
  border: '#E9E1F2',
  text: '#1A1026',
  textSecondary: '#564A6B',
  textMuted: '#8F85A1',
  textOnPrimary: '#FFFFFF',
  success: '#1E9E62',
  successSoft: '#E3F6EC',
  warning: '#C77C02',
  warningSoft: '#FFF5DB',
  danger: '#D93F5A',
  dangerSoft: '#FDE8EC',
  info: '#5B4BDB',
  rating: '#1E9E62',
  skeleton: '#EDE6F4',
  overlay: 'rgba(20,6,36,0.55)',
  tabInactive: '#8F85A1',
};

export const darkColors: Palette = {
  primary: '#B65CF0',
  primaryDark: '#9132C0',
  primarySoft: '#26153A',
  accent: '#E25BFA',
  accentDark: '#C62FE6',
  accentSoft: '#33123F',
  background: '#09101C',
  surface: '#121A2A',
  surfaceAlt: '#182236',
  border: '#28324A',
  text: '#F1ECF8',
  textSecondary: '#BCB2CC',
  textMuted: '#8A82A0',
  textOnPrimary: '#FFFFFF',
  success: '#3CC584',
  successSoft: '#163327',
  warning: '#E7A93B',
  warningSoft: '#332812',
  danger: '#F2708A',
  dangerSoft: '#3A1C25',
  info: '#8E84F5',
  rating: '#2FA56F',
  skeleton: '#1F2940',
  overlay: 'rgba(0,0,0,0.65)',
  tabInactive: '#8A82A0',
};
