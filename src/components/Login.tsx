import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { members } from '../members' // 회원 목데이터 import
import { useNavigate } from 'react-router-dom' // 페이지 이동용
import styled from 'styled-components' // styled-components import

interface LoginProps {
  setUser: React.Dispatch<
    React.SetStateAction<{ email: string; isLoggedIn: boolean }>
  >
}

const Login: React.FC<LoginProps> = ({ setUser }) => {
  const { t } = useTranslation()
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const navigate = useNavigate() // 페이지 이동을 위해 useNavigate 사용

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 회원 데이터에서 이메일과 비밀번호 일치 확인
    const user = members.find(
      (member) =>
        member.email === credentials.email &&
        member.password === credentials.password,
    )

    if (user) {
      sessionStorage.setItem('isLoggedIn', 'true') // 로그인 상태 저장
      setUser({ email: user.email, isLoggedIn: true }) // 사용자 이름과 로그인 상태 설정
      alert(t('loginSuccess'))
      navigate('/') // 홈으로 리다이렉트
    } else {
      alert(t('loginError'))
    }
  }

  return (
    <Container>
      <LoginBox>
        <Title>{t('login')}</Title>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block">
              {t('email')}
            </label>
            <Input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block">
              {t('password')}
            </label>
            <Input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit">{t('login')}</Button>
        </form>
      </LoginBox>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh; /* 화면 높이 조정 */
  background-color: #f3f4f6; /* 배경색 */
`

const LoginBox = styled.div`
  background-color: ##e5e7eb; /* 배경색 */

  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 32px;
  width: 20rem; /* 박스 너비 */
  height: 20rem; /* 박스 높이 - 정사각형으로 만들기 */
`

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
  text-align: center;
`

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db; /* 테두리 색상 */
  border-radius: 8px;
  margin-bottom: 16px;
  &:focus {
    outline: none;
    border-color: #3b82f6; /* 포커스 시 테두리 색상 */
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5); /* 포커스 시 그림자 */
  }
`

const Button = styled.button`
  width: 100%;
  margin-top: 1.5rem;
  padding: 15px;
  background-color: #2d3748; /* 버튼 배경색 */
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background-color: #2563eb; /* 버튼 호버 시 색상 */
  }
`

export default Login
