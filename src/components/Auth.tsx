import { useState, FormEvent, useEffect } from "react"
import { ArrowPathIcon, LockClosedIcon } from "@heroicons/react/24/solid"
import { useMutateAuth } from "../hooks/useMutateAuth"
import { useTranslation } from "react-i18next"
import useStore from "../store"
import styled from "styled-components"
import { CsrfToken } from "../types"
import axios from "axios"

export const Auth = () => {
  const { t, i18n } = useTranslation()
  const { setUser } = useStore()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [pw, setPw] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const { loginMutation, registerMutation } = useMutateAuth()
  const [csrfLoaded, setCsrfLoaded] = useState(false)

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
        { email, password: pw, name: "0" },
        {
          onSuccess: (res) => {
            setUser({ email: res.email, isLoggedIn: true, name: res.name })
          },
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
          <LockClosedIcon className="h-8 w-8 mr-2 text-amber-800" />{" "}
          {/* Example: Lock icon */}
          {/* Replace with login icon */}
          {/* Use the lock icon */}
          <span className="text-2xl font-extrabold">HisNetVu</span>
        </Header>
        <span className="text-xs">{t("appSubName")}</span>
        <Title>{isLogin ? t("login") : t("register")}</Title>
        <form onSubmit={submitAuthHandler}>
          {!isLogin && (
            <Input
              type="text"
              name="name"
              placeholder={t("name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
          <Button type="submit" disabled={!email || !pw || (!isLogin && !name)}>
            {isLogin ? t("login") : t("register")}
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
  min-height: 85vh;
  padding: 1rem;
  background-image: url("/hisnetvu1.png");
  background-size: contain; /* Adjust the size of the background image */
  background-color: #d1c6b1; /* Faded yellowish "aged paper" color for the sides */

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
    background: rgba(0, 0, 0, 0.2); /* Lighter dark overlay */
    backdrop-filter: blur(6px); /* Subtle blur effect */
    border-radius: 16px; /* Ensure overlay matches rounded corners */
    z-index: -1;
  }
`

const LoginBox = styled.div`
  background-color: rgba(
    229,
    231,
    235,
    0.9
  ); /* Slightly transparent background for login box */
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

const Button = styled.button`
  width: 100%;
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
