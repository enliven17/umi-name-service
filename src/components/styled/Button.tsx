import styled, { css } from 'styled-components';
import { theme } from '@/theme';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
}

const getVariantStyles = (variant: ButtonProps['variant'] = 'primary') => {
  switch (variant) {
    case 'primary':
      return css`
        background-color: ${theme.colors.primary[500]};
        color: ${theme.colors.text.inverse};
        border: 1px solid ${theme.colors.primary[500]};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.primary[600]};
          border-color: ${theme.colors.primary[600]};
        }
        
        &:active:not(:disabled) {
          background-color: ${theme.colors.primary[700]};
          border-color: ${theme.colors.primary[700]};
        }
      `;
    
    case 'secondary':
      return css`
        background-color: ${theme.colors.secondary[500]};
        color: ${theme.colors.text.inverse};
        border: 1px solid ${theme.colors.secondary[500]};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.secondary[600]};
          border-color: ${theme.colors.secondary[600]};
        }
        
        &:active:not(:disabled) {
          background-color: ${theme.colors.secondary[700]};
          border-color: ${theme.colors.secondary[700]};
        }
      `;
    
    case 'outline':
      return css`
        background-color: transparent;
        color: ${theme.colors.primary[500]};
        border: 1px solid ${theme.colors.primary[500]};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.primary[50]};
        }
        
        &:active:not(:disabled) {
          background-color: ${theme.colors.primary[100]};
        }
      `;
    
    case 'ghost':
      return css`
        background-color: transparent;
        color: ${theme.colors.text.primary};
        border: 1px solid transparent;
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.neutral[100]};
        }
        
        &:active:not(:disabled) {
          background-color: ${theme.colors.neutral[200]};
        }
      `;
    
    default:
      return css``;
  }
};

const getSizeStyles = (size: ButtonProps['size'] = 'md') => {
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
        padding: ${theme.spacing[4]} ${theme.spacing[6]};
        font-size: ${theme.fonts.size.lg};
        border-radius: ${theme.borderRadius.xl};
      `;
    
    default:
      return css``;
  }
};

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${theme.fonts.family.primary};
  font-weight: ${theme.fonts.weight.medium};
  line-height: ${theme.fonts.lineHeight.normal};
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: ${theme.shadows.sm};
  
  ${({ variant }) => getVariantStyles(variant)}
  ${({ size }) => getSizeStyles(size)}
  
  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}
  
  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    `}
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`; 