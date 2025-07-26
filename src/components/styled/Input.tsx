import styled from 'styled-components';
import { theme } from '@/theme';

interface InputProps {
  $fullWidth?: boolean;
  $size?: 'sm' | 'md' | 'lg';
}

export const Input = styled.input<InputProps>`
  padding: ${({ $size = 'md' }) => {
    switch ($size) {
      case 'sm': return theme.spacing[2];
      case 'lg': return theme.spacing[4];
      default: return theme.spacing[3];
    }
  }};
  border: 2px solid ${theme.colors.neutral[200]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fonts.size.base};
  transition: all 0.2s ease;
  background: white;
  color: ${theme.colors.text.primary};
  width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'auto'};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
  
  &:disabled {
    background: ${theme.colors.neutral[100]};
    color: ${theme.colors.neutral[500]};
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: ${theme.colors.neutral[400]};
  }
`; 