import styled, { css } from 'styled-components';
import { theme } from '@/theme';

interface InputProps {
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  error?: boolean;
  disabled?: boolean;
}

const getSizeStyles = (size: InputProps['size'] = 'md') => {
  switch (size) {
    case 'sm':
      return css`
        padding: ${theme.spacing[2]} ${theme.spacing[3]};
        font-size: ${theme.fonts.size.sm};
        border-radius: ${theme.borderRadius.md};
      `;
    
    case 'md':
      return css`
        padding: ${theme.spacing[3]} ${theme.spacing[4]};
        font-size: ${theme.fonts.size.base};
        border-radius: ${theme.borderRadius.lg};
      `;
    
    case 'lg':
      return css`
        padding: ${theme.spacing[4]} ${theme.spacing[5]};
        font-size: ${theme.fonts.size.lg};
        border-radius: ${theme.borderRadius.xl};
      `;
    
    default:
      return css``;
  }
};

export const Input = styled.input<InputProps>`
  display: block;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  font-family: ${theme.fonts.family.primary};
  font-size: ${theme.fonts.size.base};
  line-height: ${theme.fonts.lineHeight.normal};
  color: ${theme.colors.text.primary};
  background-color: ${theme.colors.background.primary};
  border: 1px solid ${theme.colors.neutral[300]};
  border-radius: ${theme.borderRadius.lg};
  transition: all 0.2s ease-in-out;
  box-shadow: ${theme.shadows.sm};
  
  ${({ size }) => getSizeStyles(size)}
  
  &::placeholder {
    color: ${theme.colors.text.tertiary};
  }
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
  
  ${({ error }) =>
    error &&
    css`
      border-color: ${theme.colors.error[500]};
      
      &:focus {
        border-color: ${theme.colors.error[500]};
        box-shadow: 0 0 0 3px ${theme.colors.error[100]};
      }
    `}
  
  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
      cursor: not-allowed;
      background-color: ${theme.colors.neutral[100]};
    `}
`; 