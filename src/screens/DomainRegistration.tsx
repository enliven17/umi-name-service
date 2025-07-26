import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useWallet } from '@/hooks/useWallet';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setLoading, setError, addOwnedDomain } from '@/store/slices/domainSlice';
import { Button } from '@/components/styled/Button';
import { Input } from '@/components/styled/Input';
import { Card } from '@/components/styled/Card';
import { nameServiceContract } from '@/api/contracts';
import { theme } from '@/theme';
import { ROUTES } from '@/constants/routes';
import { MIN_REGISTRATION_YEARS, MAX_REGISTRATION_YEARS } from '@/config/umi';

const RegistrationContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: ${theme.spacing[8]} ${theme.spacing[6]};
`;

const RegistrationHeader = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing[8]};
`;

const RegistrationTitle = styled.h1`
  font-size: ${theme.fonts.size['4xl']};
  font-weight: ${theme.fonts.weight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[4]};
`;

const RegistrationForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const Label = styled.label`
  font-size: ${theme.fonts.size.base};
  font-weight: ${theme.fonts.weight.medium};
  color: ${theme.colors.text.primary};
`;

const Select = styled.select`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  font-size: ${theme.fonts.size.base};
  border: 1px solid ${theme.colors.neutral[300]};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.background.primary};
  color: ${theme.colors.text.primary};
  font-family: ${theme.fonts.family.primary};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const PriceDisplay = styled.div`
  background-color: ${theme.colors.primary[50]};
  border: 1px solid ${theme.colors.primary[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[4]};
  text-align: center;
`;

const PriceLabel = styled.div`
  font-size: ${theme.fonts.size.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[1]};
`;

const PriceValue = styled.div`
  font-size: ${theme.fonts.size['2xl']};
  font-weight: ${theme.fonts.weight.bold};
  color: ${theme.colors.primary[600]};
`;

const TotalPrice = styled.div`
  font-size: ${theme.fonts.size.lg};
  font-weight: ${theme.fonts.weight.semibold};
  color: ${theme.colors.text.primary};
  margin-top: ${theme.spacing[2]};
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error[500]};
  text-align: center;
  padding: ${theme.spacing[4]};
  background-color: ${theme.colors.error[50]};
  border: 1px solid ${theme.colors.error[200]};
  border-radius: ${theme.borderRadius.lg};
`;

const SuccessMessage = styled.div`
  color: ${theme.colors.success[500]};
  text-align: center;
  padding: ${theme.spacing[4]};
  background-color: ${theme.colors.success[50]};
  border: 1px solid ${theme.colors.success[200]};
  border-radius: ${theme.borderRadius.lg};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing[8]};
  
  &::after {
    content: '';
    width: 32px;
    height: 32px;
    border: 3px solid ${theme.colors.neutral[200]};
    border-top: 3px solid ${theme.colors.primary[500]};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const DomainRegistration: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isConnected, address } = useWallet();
  const { isLoading, error } = useAppSelector((state) => state.domains);
  
  const [domainName, setDomainName] = useState(searchParams.get('name') || '');
  const [duration, setDuration] = useState(MIN_REGISTRATION_YEARS);
  const [basePrice, setBasePrice] = useState('0');
  const [totalPrice, setTotalPrice] = useState('0');
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected) {
      navigate(ROUTES.HOME);
      return;
    }

    if (domainName) {
      calculatePrice();
    }
  }, [domainName, duration, isConnected]);

  const calculatePrice = async () => {
    if (!domainName) return;

    try {
      const domainInfo = await nameServiceContract.getDomainInfo(domainName);
      if (domainInfo) {
        const basePriceValue = parseFloat(domainInfo.price);
        const totalPriceValue = basePriceValue * duration;
        setBasePrice(basePriceValue.toFixed(4));
        setTotalPrice(totalPriceValue.toFixed(4));
      }
    } catch (error) {
      console.error('Error calculating price:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      dispatch(setError('Please connect your wallet first'));
      return;
    }

    if (!domainName.trim()) {
      dispatch(setError('Please enter a domain name'));
      return;
    }

    const validation = nameServiceContract.validateDomainName(domainName);
    if (!validation.isValid) {
      dispatch(setError(validation.error || 'Invalid domain name'));
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const tx = await nameServiceContract.registerDomain({
        name: domainName,
        owner: address,
        duration,
      });

      await tx.wait();
      
      setSuccess(`Domain ${domainName}.umi registered successfully!`);
      
      // Add to owned domains
      const domainInfo = await nameServiceContract.getDomainInfo(domainName);
      if (domainInfo) {
        dispatch(addOwnedDomain(domainInfo));
      }

      // Redirect to profile after a delay
      setTimeout(() => {
        navigate(ROUTES.MY_DOMAINS);
      }, 3000);

    } catch (err: any) {
      dispatch(setError(err.message || 'Failed to register domain'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const durationOptions = [];
  for (let i = MIN_REGISTRATION_YEARS; i <= MAX_REGISTRATION_YEARS; i++) {
    durationOptions.push(i);
  }

  if (!isConnected) {
    return (
      <RegistrationContainer>
        <ErrorMessage>
          Please connect your wallet to register domains
        </ErrorMessage>
      </RegistrationContainer>
    );
  }

  return (
    <RegistrationContainer>
      <RegistrationHeader>
        <RegistrationTitle>Register Domain</RegistrationTitle>
      </RegistrationHeader>

      <Card>
        <RegistrationForm onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="domainName">Domain Name</Label>
            <Input
              id="domainName"
              type="text"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              placeholder="Enter domain name (e.g., myname)"
              fullWidth
              disabled={isLoading}
            />
            <div style={{ fontSize: theme.fonts.size.sm, color: theme.colors.text.secondary }}>
              Your domain will be: {domainName ? `${domainName}.umi` : 'example.umi'}
            </div>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="duration">Registration Duration</Label>
            <Select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              disabled={isLoading}
            >
              {durationOptions.map((years) => (
                <option key={years} value={years}>
                  {years} {years === 1 ? 'year' : 'years'}
                </option>
              ))}
            </Select>
          </FormGroup>

          <PriceDisplay>
            <PriceLabel>Registration Price</PriceLabel>
            <PriceValue>{basePrice} ETH</PriceValue>
            <TotalPrice>Total: {totalPrice} ETH</TotalPrice>
          </PriceDisplay>

          {error && (
            <ErrorMessage>{error}</ErrorMessage>
          )}

          {success && (
            <SuccessMessage>{success}</SuccessMessage>
          )}

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={!domainName.trim() || !isConnected}
            >
              Register Domain
            </Button>
          )}
        </RegistrationForm>
      </Card>
    </RegistrationContainer>
  );
}; 