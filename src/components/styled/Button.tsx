import styled from 'styled-components';
import { theme } from '@/theme';

interface ButtonProps {
  $variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  $size?: 'sm' | 'md' | 'lg';
  $fullWidth?: boolean;
}

const getVariantStyles = (variant: ButtonProps['$variant'] = 'primary') => {
  switch (variant) {
    case 'secondary':
      return `
        background: ${theme.colors.secondary[500]};
        color: white;
        &:hover {
          background: ${theme.colors.secondary[600]};
        }
      `;
    case 'outline':
      return `
        background: transparent;
        color: ${theme.colors.primary[500]};
        border: 2px solid ${theme.colors.primary[500]};
        &:hover {
          background: ${theme.colors.primary[50]};
        }
      `;
    case 'ghost':
      return `
        background: transparent;
        color: ${theme.colors.text.secondary};
        &:hover {
          background: ${theme.colors.neutral[100]};
        }
      `;
    default:
      return `
        background: ${theme.colors.primary[500]};
        color: white;
        &:hover {
          background: ${theme.colors.primary[600]};
        }
      `;
  }
};

const getSizeStyles = (size: ButtonProps['$size'] = 'md') => {
  switch (size) {
    case 'sm':
      return `
        padding: ${theme.spacing[2]} ${theme.spacing[3]};
        font-size: ${theme.fonts.size.sm};
      `;
    case 'lg':
      return `
        padding: ${theme.spacing[4]} ${theme.spacing[6]};
        font-size: ${theme.fonts.size.lg};
      `;
    default:
      return `
        padding: ${theme.spacing[3]} ${theme.spacing[4]};
        font-size: ${theme.fonts.size.base};
      `;
  }
};

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: ${theme.borderRadius.lg};
  font-weight: ${theme.fonts.weight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'auto'};
  
  ${({ $variant }) => getVariantStyles($variant)}
  ${({ $size }) => getSizeStyles($size)}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`; 