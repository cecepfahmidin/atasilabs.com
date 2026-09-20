export type FocusField = 'none' | 'email' | 'password' | 'google' | 'submit';

export interface CharacterState {
  isPasswordVisible: boolean;
  focusField: FocusField;
  emailLength: number;
  passwordLength: number;
  mouseX: number;
  mouseY: number;
  isHovered: string | null;
}

export interface CourseItem {
  id: string;
  title: string;
  category: string;
  badge: {
    label: string;
    type: 'online' | 'hybrid' | 'demand';
  };
  startDate: string;
  hours: string;
  progress?: number;
  rating?: number;
  instructor?: string;
  description?: string;
}
