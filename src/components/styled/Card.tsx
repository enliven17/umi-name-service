import styled from 'styled-components';
import { theme } from '@/theme';

interface CardProps {
  padding?: keyof typeof theme.spacing;
  elevation?: 'sm' | 'md' | 'lg';
}

const getElevationStyles = (elevation: CardProps['elevation'] = 'md') => {
  switch (elevation) {
    case 'sm':
      return `box-shadow: ${theme.shadows.sm};`;
    case 'md':
      return `box-shadow: ${theme.shadows.md};`;
    case 'lg':
      return `box-shadow: ${theme.shadows.lg};`;
    default:
      return `box-shadow: ${theme.shadows.md};`;
  }
};

export const Card = styled.div<CardProps>`
  background-color: ${theme.colors.background.primary};
  border-radius: ${theme.borderRadius.xl};
  border: 1px solid ${theme.colors.neutral[200]};
  padding: ${({ padding = '6' }) => theme.spacing[padding]};
  ${({ elevation }) => getElevationStyles(elevation)}
  transition: all 0.2s ease-in-out;
  
  &:hover {
    ${({ elevation }) => 
      elevation === 'sm' ? `box-shadow: ${theme.shadows.md};` :
      elevation === 'md' ? `box-shadow: ${theme.shadows.lg};` :
      `box-shadow: ${theme.shadows.xl};`
    }
  }
`; 