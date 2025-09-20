import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
export {icons} from './icons';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
