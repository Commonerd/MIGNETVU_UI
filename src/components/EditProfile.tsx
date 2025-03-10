import { useState, FormEvent } from "react"
import { LockClosedIcon } from "@heroicons/react/24/solid"
import { useMutateProfile } from "../hooks/useMutateProfile"
import { useTranslation } from "react-i18next"
import useStore from "../store"
import styled from "styled-components"
import { ProfileUpdateData } from "../types"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { ClipLoader } from "react-spinners"
// import { useRouter } from "next/router"

export const EditProfile = () => {
  const { t } = useTranslation()
  const { user, setUser } = useStore()
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmNewPw, setConfirmNewPw] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { updateProfileMutation } = useMutateProfile()
  // const router = useRouter()

  const submitProfileHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (newPw !== confirmNewPw) {
      toast.error("New passwords do not match. Please try again.")
      return
    }
    try {
      setIsLoading(true)
      const profileData: ProfileUpdateData = {
        name,
        email,
        current_password: currentPw,
        new_password: newPw,
      }
      const res = await updateProfileMutation.mutateAsync(profileData)
      setIsLoading(false)
      if (res != null) {
        toast.success("Profile updated successfully!")
        // setTimeout(() => {
        //   router.push("/") // 톱 화면으로 이동
        // }, 3000) // 3초 후에 이동
      }
    } catch {
      setIsLoading(false)
      toast.error("Failed to update profile. Please try again.")
    }
  }

  return (
    <>
      <ToastContainer position="top-center" />
      <Container>
        <ProfileBox>
          <Header>
            <LockClosedIcon className="h-8 w-8 mr-2 text-amber-800" />
            <span className="text-2xl font-extrabold">{t("editProfile")}</span>
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
              disabled={
                !email ||
                !name ||
                !currentPw ||
                !newPw ||
                !confirmNewPw ||
                isLoading
              }
            >
              {isLoading ? (
                <ClipLoader size={50} color={"#fff"} />
              ) : (
                t("updateProfile")
              )}
            </Button>
          </form>
        </ProfileBox>
      </Container>
    </>
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
