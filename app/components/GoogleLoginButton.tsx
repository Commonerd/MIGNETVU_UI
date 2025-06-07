import { GoogleLogin } from "@react-oauth/google"

const GoogleLoginButton = ({
  onSuccess,
}: {
  onSuccess: (token: string) => void
}) => (
  <GoogleLogin
    onSuccess={(credentialResponse) => {
      if (credentialResponse.credential) {
        // 백엔드에 토큰 전달
        onSuccess(credentialResponse.credential)
      }
    }}
    onError={() => {
      alert("Google Login Failed")
    }}
    size="large"
    logo_alignment="center"
  />
)

export default GoogleLoginButton
