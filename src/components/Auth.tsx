import { useState, FormEvent, useEffect } from "react"
import { ArrowPathIcon, LockClosedIcon } from "@heroicons/react/24/solid"
import { useMutateAuth } from "../hooks/useMutateAuth"
import { useTranslation } from "react-i18next"
import useStore from "../store"
import styled from "styled-components"
import { CsrfToken } from "../types"
import axios from "axios"
import GoogleLoginButton from "./GoogleLoginButton"
import { useNavigate } from "react-router-dom"

export const Auth = () => {
  const { t, i18n } = useTranslation()
  const { setUser } = useStore()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [pw, setPw] = useState("")
  const [role, setRole] = useState("Researcher")
  const [isLogin, setIsLogin] = useState(true)
  const { loginMutation, registerMutation } = useMutateAuth()
  const [csrfLoaded, setCsrfLoaded] = useState(false)
  const navigate = useNavigate()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        const { data } = await axios.get<CsrfToken>(
          `${process.env.REACT_APP_API_URL}/csrf`,
        )
        axios.defaults.headers.common["X-CSRF-Token"] = data.csrf_token
        setCsrfLoaded(true)
      } catch (err) {
        alert(err)
      }
    }
    axios.defaults.withCredentials = true
    getCsrfToken()
  }, [])

  const submitAuthHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!csrfLoaded) {
      alert(
        "The CSRF token hasn't loaded yet. Please wait for just 30 seconds!",
      )
      return
    }
    if (isLogin) {
      loginMutation.mutate(
        { id: 0, email, password: pw, role: "", name: "" },
        {
          onSuccess: (res) => {
            setUser({
              id: res.id,
              email: res.email,
              isLoggedIn: true,
              name: res.name,
              role: res.role,
            })
          },
        },
      )
    } else {
      await registerMutation
        .mutateAsync({ id: 0, name, email, password: pw, role }) // role 추가
        .then(() =>
          loginMutation.mutate(
            { id: 0, email, password: pw, name, role },
            {
              onSuccess: (res) =>
                setUser({
                  id: res.id,
                  email: res.email,
                  isLoggedIn: true,
                  name: res.name,
                  role: res.role,
                }),
            },
          ),
        )
    }
  }

  // 구글 로그인 성공 시 처리 함수
  const handleGoogleLogin = async (token: string) => {
    if (!csrfLoaded) {
      alert(
        "The CSRF token hasn't loaded yet. Please wait for just 30 seconds!",
      )
      return
    }
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/google`,
        { id_token: token },
        { withCredentials: true },
      )
      // 로그인 성공 시 전역 상태에 사용자 정보 저장
      console.log(res.data)
      setUser({
        id: res.data.user.id,
        email: res.data.user.email,
        isLoggedIn: true,
        name: res.data.user.name,
        role: res.data.user.role,
      })
      navigate("/") // 메인화면으로 이동
    } catch (err) {
      alert(
        "로그인에 실패했습니다.\n" +
          (err instanceof Error ? err.message : JSON.stringify(err)),
      )
    }
  }

  return (
    <Container>
      <LoginBox>
        <Header>
          <LockClosedIcon className="h-8 w-8 mr-2 text-amber-800" />{" "}
          <span className="text-2xl font-extrabold">HisNetVu</span>
        </Header>
        <span className="text-xs">{t("appSubName")}</span>
        <Title>{isLogin ? t("login") : t("register")}</Title>
        <form onSubmit={submitAuthHandler}>
          {!isLogin && (
            <>
              <Input
                type="text"
                name="name"
                placeholder={t("name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Select
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="Researcher">{t("Researcher")}</option>
                <option value="Teacher">{t("Teacher")}</option>
                <option value="Student">{t("Student")}</option>
              </Select>
            </>
          )}
          <Input
            type="email"
            name="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            name="password"
            placeholder={t("password")}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            required
          />
          <Button
            type="submit"
            disabled={!email || !pw || (!isLogin && (!name || !role))}
          >
            {isLogin ? t("login") : t("register")}
          </Button>
        </form>
        <GoogleButtonWrapper>
          <GoogleLoginButton onSuccess={handleGoogleLogin} />
        </GoogleButtonWrapper>
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
  min-height: 86vh;
  padding: 1rem;
  background-image: url("/hisnetvu1.png");
  background-size: contain;
  background-color: #d1c6b1;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(6px);
    border-radius: 16px;
    z-index: -1;
  }
`

const LoginBox = styled.div`
  background-color: rgba(229, 231, 235, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 32px;
  width: 20rem;
  height: auto;
  text-align: center;
  position: relative;

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

const Select = styled.select`
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
  width: 50%;
  padding: 12px;
  background-color: #800020;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background-color: #455a64;
  }

  @media (max-width: 600px) {
    padding: 10px;
    font-size: 0.9rem;
  }
`

const GoogleButtonWrapper = styled.div`
  width: 100%;
  margin: 16px 0;

  // Google 버튼 내부 iframe에도 높이 적용
  > div {
    width: 100% !important;
    min-width: 100% !important;
    height: 48px !important; // Button과 동일하게
    display: flex;
    align-items: center;
    justify-content: center;
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
