import { useState, FormEvent, useEffect } from "react"
import { LockClosedIcon } from "@heroicons/react/24/solid"
import { useMutateAuth } from "../hooks/useMutateAuth"
import { useTranslation } from "react-i18next"
import useStore from "../store"
import styled from "styled-components"
import { CsrfToken } from "../types"
import axios from "axios"

export const EditProfile = () => {
  const { t, i18n } = useTranslation()
  const { user, setUser } = useStore()
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmNewPw, setConfirmNewPw] = useState("")
  const { updateProfileMutation } = useMutateAuth()
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

  const submitProfileHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!csrfLoaded) {
      alert(
        "The CSRF token hasn't loaded yet. Please wait for just 30 seconds!",
      )
      return
    }
    if (newPw !== confirmNewPw) {
      alert("New passwords do not match. Please try again.")
      return
    }
    await updateProfileMutation
      .mutateAsync({
        name,
        email,
        currentPassword: currentPw,
        newPassword: newPw,
      })
      .then((res) => {
        setUser({ email: res.email, isLoggedIn: true, name: res.name })
        alert("Profile updated successfully!")
      })
      .catch((err) => {
        alert("Failed to update profile. Please try again.")
      })
  }

  return (
    <Container>
      <ProfileBox>
        <Header>
          <LockClosedIcon className="h-8 w-8 mr-2 text-amber-800" />
          <span className="text-2xl font-extrabold">Edit Profile</span>
        </Header>
        <form onSubmit={submitProfileHandler}>
          <Input
            type="text"
            name="name"
            placeholder={t("name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
            name="currentPassword"
            placeholder={t("currentPassword")}
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            required
          />
          <Input
            type="password"
            name="newPassword"
            placeholder={t("newPassword")}
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            required
          />
          <Input
            type="password"
            name="confirmNewPassword"
            placeholder={t("confirmNewPassword")}
            value={confirmNewPw}
            onChange={(e) => setConfirmNewPw(e.target.value)}
            required
          />
          <Button
            type="submit"
            disabled={!email || !name || !currentPw || !newPw || !confirmNewPw}
          >
            {t("updateProfile")}
          </Button>
        </form>
      </ProfileBox>
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

const ProfileBox = styled.div`
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

export default EditProfile
