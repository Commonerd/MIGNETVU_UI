import { useState, FormEvent } from 'react'
import { CheckBadgeIcon, ArrowPathIcon } from '@heroicons/react/24/solid'
import { useMutateAuth } from '../hooks/useMutateAuth'
import { useTranslation } from 'react-i18next'
import useStore from '../store'
import styled from 'styled-components'

export const Auth = () => {
  const { t, i18n } = useTranslation()
  const { setUser } = useStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const { loginMutation, registerMutation } = useMutateAuth()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  const submitAuthHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLogin) {
      loginMutation.mutate(
        { email, password: pw, name },
        {
          onSuccess: () => setUser({ email, isLoggedIn: true, name }),
        },
      )
    } else {
      await registerMutation
        .mutateAsync({ name, email, password: pw })
        .then(() =>
          loginMutation.mutate(
            { email, password: pw, name },
            {
              onSuccess: () => setUser({ email, isLoggedIn: true, name }),
            },
          ),
        )
    }
  }

  return (
    <Container>
      <LoginBox>
        <Header>
          <CheckBadgeIcon className="h-8 w-8 mr-2 text-blue-500" />
          <span className="text-2xl font-extrabold">MigNetVu</span>
        </Header>
        <span className="text-xs">{t('appSubName')}</span>
        <Title>{isLogin ? t('login') : t('register')}</Title>
        <form onSubmit={submitAuthHandler}>
          {!isLogin && (
            <Input
              type="text"
              name="name"
              placeholder={t('name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <Input
            type="email"
            name="email"
            placeholder={t('email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            name="password"
            placeholder={t('password')}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            required
          />
          <Button type="submit" disabled={!email || !pw || (!isLogin && !name)}>
            {isLogin ? t('login') : t('register')}
          </Button>
        </form>
        <IconWrapper>
          <SwitchModeIcon onClick={() => setIsLogin(!isLogin)} />
        </IconWrapper>
      </LoginBox>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  background-color: #f3f4f6;
  padding: 1rem;
`

const LoginBox = styled.div`
  background-color: #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 32px;
  width: 20rem;
  height: auto;
  text-align: center;

  @media (max-width: 600px) {
    padding: 20px;
    width: 90%;
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;

  span {
    font-size: 1.5rem;

    @media (max-width: 600px) {
      font-size: 1.25rem;
    }
  }
`

const Title = styled.h2`
  font-size: 1.6rem;
  font-weight: bold;
  margin-bottom: 16px;

  @media (max-width: 600px) {
    font-size: 1.2rem;
  }
`

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  margin-bottom: 16px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }

  @media (max-width: 600px) {
    padding: 10px;
  }
`

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #2d3748;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background-color: #2563eb;
  }

  @media (max-width: 600px) {
    padding: 10px;
    font-size: 0.9rem;
  }
`

const SwitchModeIcon = styled(ArrowPathIcon)`
  width: 1.5rem;
  height: 1.5rem;
  color: #3b82f6;
  cursor: pointer;

  &:hover {
    color: #2563eb;
  }
`

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 1rem;
`

export default Auth
