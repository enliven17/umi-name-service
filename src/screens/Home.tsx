import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/styled/Button';
import { Input } from '@/components/styled/Input';
import { Card } from '@/components/styled/Card';
import { theme } from '@/theme';
import { ROUTES } from '@/constants/routes';
import { useInView } from 'react-intersection-observer';

const HomeContainer = styled.div`
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[24]} ${theme.spacing[6]} ${theme.spacing[8]};
  background: linear-gradient(135deg, 
    ${theme.colors.primary[50]} 0%, 
    ${theme.colors.secondary[50]} 50%, 
    ${theme.colors.primary[100]} 100%);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    pointer-events: none;
  }
`;

const HeroSection = styled.div`
  text-align: center;
  max-width: 700px;
  margin-bottom: ${theme.spacing[8]};
  position: relative;
  z-index: 1;
`;

const Title = styled.h1`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: ${theme.fonts.weight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[6]};
  line-height: ${theme.fonts.lineHeight.tight};
  background: linear-gradient(135deg, 
    ${theme.colors.primary[600]} 0%, 
    ${theme.colors.secondary[600]} 25%, 
    ${theme.colors.primary[500]} 50%, 
    ${theme.colors.secondary[500]} 75%, 
    ${theme.colors.primary[600]} 100%);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fadeInUp 0.8s ease-out, gradientShift 3s ease-in-out infinite;
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

const Subtitle = styled.p`
  font-size: clamp(1.1rem, 2vw, 1.25rem);
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[10]};
  line-height: ${theme.fonts.lineHeight.relaxed};
  animation: fadeInUp 0.8s ease-out 0.2s both;
`;

const SearchSection = styled(Card)`
  width: 100%;
  max-width: 600px;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[8]};
  animation: fadeInUp 0.8s ease-out 0.4s both;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  }
`;

const SearchForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
`;

const SearchInput = styled(Input)`
  font-size: ${theme.fonts.size.xl};
  text-align: center;
  border: 2px solid ${theme.colors.neutral[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  transition: all 0.3s ease;
  
  &:focus {
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    font-size: ${theme.fonts.size.xl};
    color: ${theme.colors.text.secondary};
  }
`;

const SearchButton = styled(Button)`
  font-size: ${theme.fonts.size.xl};
  padding: ${theme.spacing[5]} ${theme.spacing[8]};
  background: linear-gradient(135deg, ${theme.colors.primary[500]}, ${theme.colors.secondary[500]});
  border: none;
  border-radius: ${theme.borderRadius.lg};
  font-weight: ${theme.fonts.weight.semibold};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
    
    &::before {
      left: 100%;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
  margin-top: ${theme.spacing[6]};
`;

const MyDomainsButton = styled(Button)`
  font-size: ${theme.fonts.size.lg};
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  background: rgba(255, 255, 255, 0.8);
  color: ${theme.colors.text.primary};
  border: 2px solid ${theme.colors.neutral[200]};
  border-radius: ${theme.borderRadius.lg};
  font-weight: ${theme.fonts.weight.medium};
  transition: all 0.3s ease;
  
  &:hover {
    background: ${theme.colors.neutral[50]};
    border-color: ${theme.colors.primary[300]};
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
`;

const FeaturesSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${theme.spacing[8]};
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  margin-top: ${theme.spacing[16]};
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1);
  &.visible {
    opacity: 1;
    transform: translateY(0);
  }
`;

const FeatureCard = styled(Card)`
  text-align: center;
  padding: ${theme.spacing[8]};
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: ${theme.borderRadius.xl};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, ${theme.colors.primary[500]}, ${theme.colors.secondary[500]});
  }
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
`;

const FeatureIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, ${theme.colors.primary[500]}, ${theme.colors.secondary[500]});
  border-radius: ${theme.borderRadius.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${theme.spacing[6]};
  color: white;
  font-size: ${theme.fonts.size['3xl']};
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
  
  ${FeatureCard}:hover & {
    transform: scale(1.1) rotate(5deg);
  }
`;

const FeatureTitle = styled.h3`
  font-size: ${theme.fonts.size.xl};
  font-weight: ${theme.fonts.weight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[4]};
`;

const FeatureDescription = styled.p`
  color: ${theme.colors.text.secondary};
  line-height: ${theme.fonts.lineHeight.relaxed};
  font-size: ${theme.fonts.size.base};
`;

const ConnectPrompt = styled.div`
  background: linear-gradient(135deg, ${theme.colors.warning[50]}, ${theme.colors.warning[100]});
  border: 2px solid ${theme.colors.warning[200]};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[6]};
  margin-bottom: ${theme.spacing[6]};
  text-align: center;
  font-weight: ${theme.fonts.weight.medium};
  color: ${theme.colors.warning[700]};
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1);
`;

const FeatureCards: React.FC = () => {
  const features = [
    {
      icon: '🔗',
      title: 'Decentralized Names',
      description: 'Own your digital identity with .umi domains on the Umi network',
    },
    {
      icon: '⚡',
      title: 'Fast & Secure',
      description: 'Built on Umi\'s Layer 2 solution for Ethereum with enhanced security',
    },
    {
      icon: '💎',
      title: 'Affordable',
      description: 'Low-cost domain registration and management fees',
    },
  ];

  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <FeaturesSection ref={ref} className={inView ? 'visible' : ''}>
      {features.map((feature, index) => (
        <FeatureCard key={index}>
          <FeatureIcon>{feature.icon}</FeatureIcon>
          <FeatureTitle>{feature.title}</FeatureTitle>
          <FeatureDescription>{feature.description}</FeatureDescription>
        </FeatureCard>
      ))}
    </FeaturesSection>
  );
};

export const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { isConnected } = useWallet();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleMyDomains = () => {
    navigate(ROUTES.MY_DOMAINS);
  };

  return (
    <HomeContainer>
      <HeroSection>
        <Title>Your Web3 Identity</Title>
        <Subtitle>
          Secure, decentralized domain names for the Umi network. 
          One name for all your crypto addresses and decentralized websites.
        </Subtitle>
      </HeroSection>

      <SearchSection>
        {!isConnected && (
          <ConnectPrompt>
            <p>🔗 Connect your wallet to search and register domains</p>
          </ConnectPrompt>
        )}
        
        <SearchForm onSubmit={handleSearch}>
                         <SearchInput
                 type="text"
                 placeholder="Search for a .umi name"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 $fullWidth
                 $size="lg"
                 disabled={!isConnected}
               />
               <SearchButton
                 type="submit"
                 $fullWidth
                 $size="lg"
                 disabled={!isConnected || !searchTerm.trim()}
               >
                 Search Domain
               </SearchButton>
             </SearchForm>
             
             {isConnected && (
               <ActionButtons>
                 <MyDomainsButton onClick={handleMyDomains} $fullWidth>
                   👤 View My Domains
                 </MyDomainsButton>
          </ActionButtons>
        )}
      </SearchSection>

      {/* Özellik kutucukları çok derinde konumlandırılıyor */}
      <div style={{ height: '300px' }} />
      <FeatureCards />
      <div style={{ height: '100px' }} />
    </HomeContainer>
  );
}; 