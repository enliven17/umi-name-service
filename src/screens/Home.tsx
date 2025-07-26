import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/styled/Button';
import { Input } from '@/components/styled/Input';
import { Card } from '@/components/styled/Card';
import { theme } from '@/theme';
import { ROUTES } from '@/constants/routes';

const HomeContainer = styled.div`
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[8]} ${theme.spacing[6]};
  background: linear-gradient(135deg, ${theme.colors.primary[50]}, ${theme.colors.secondary[50]});
`;

const HeroSection = styled.div`
  text-align: center;
  max-width: 600px;
  margin-bottom: ${theme.spacing[12]};
`;

const Title = styled.h1`
  font-size: ${theme.fonts.size['5xl']};
  font-weight: ${theme.fonts.weight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[4]};
  line-height: ${theme.fonts.lineHeight.tight};
`;

const Subtitle = styled.p`
  font-size: ${theme.fonts.size.xl};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[8]};
  line-height: ${theme.fonts.lineHeight.relaxed};
`;

const SearchSection = styled(Card)`
  width: 100%;
  max-width: 500px;
  text-align: center;
`;

const SearchForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

const SearchInput = styled(Input)`
  font-size: ${theme.fonts.size.lg};
  text-align: center;
  
  &::placeholder {
    font-size: ${theme.fonts.size.lg};
  }
`;

const SearchButton = styled(Button)`
  font-size: ${theme.fonts.size.lg};
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
`;

const FeaturesSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing[6]};
  max-width: 1000px;
  width: 100%;
  margin-top: ${theme.spacing[12]};
`;

const FeatureCard = styled(Card)`
  text-align: center;
  padding: ${theme.spacing[6]};
`;

const FeatureIcon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, ${theme.colors.primary[500]}, ${theme.colors.secondary[500]});
  border-radius: ${theme.borderRadius.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${theme.spacing[4]};
  color: white;
  font-size: ${theme.fonts.size['2xl']};
`;

const FeatureTitle = styled.h3`
  font-size: ${theme.fonts.size.xl};
  font-weight: ${theme.fonts.weight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[2]};
`;

const FeatureDescription = styled.p`
  color: ${theme.colors.text.secondary};
  line-height: ${theme.fonts.lineHeight.relaxed};
`;

const ConnectPrompt = styled.div`
  background-color: ${theme.colors.warning[50]};
  border: 1px solid ${theme.colors.warning[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[4]};
  text-align: center;
`;

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
            <p>Connect your wallet to search and register domains</p>
          </ConnectPrompt>
        )}
        
        <SearchForm onSubmit={handleSearch}>
          <SearchInput
            type="text"
            placeholder="Search for a .umi name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            size="lg"
            disabled={!isConnected}
          />
          <SearchButton
            type="submit"
            fullWidth
            size="lg"
            disabled={!isConnected || !searchTerm.trim()}
          >
            Search Domain
          </SearchButton>
        </SearchForm>
      </SearchSection>

      <FeaturesSection>
        {features.map((feature, index) => (
          <FeatureCard key={index}>
            <FeatureIcon>{feature.icon}</FeatureIcon>
            <FeatureTitle>{feature.title}</FeatureTitle>
            <FeatureDescription>{feature.description}</FeatureDescription>
          </FeatureCard>
        ))}
      </FeaturesSection>
    </HomeContainer>
  );
}; 