import { useState } from "react";
import { storeUserData } from "../../helpers";
import StyledTextField from "../../utils/StyledTextfield";
import { Box, Button, Stack, Typography, Divider, Avatar } from "@mui/material";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";

type User = {
  email: string;
  password: string;
  google_auth: boolean;
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [progress, setProgress] = useState(false);
  const [authGoogleLoading, setAuthGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const google_auth = false;

    await authenticateAsync({ email, password, google_auth });
  };

  const authenticateAsync = async ({ email, password, google_auth }: User) => {
    try {
      setProgress(true);
      const response = await axios.post(
        `https://api.leuteriorealty.com/lr/v2/public/api/sign-in`,
        { email, password, google_auth },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { user, token } = response.data[0];

      storeUserData({
        auth_token: token,
        email: user.email,
        id: user.id,
        name: user.name,
        role: user.role.role,
      });

      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (e) {
      // to do
    } finally {
      setProgress(false);
    }
  };

  const signInWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setAuthGoogleLoading(true);
        const userInfo = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );
        const data = userInfo.data;
        const userData = {
          email: data.email,
          password: "",
          google_auth: true,
        };

        await authenticateAsync(userData);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    },
  });

  const authGoogleSignIn = () => signInWithGoogle();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "70vh",
      }}
    >
      <Box
        sx={{ p: 2, borderRadius: 3, width: 300, textAlign: "center" }}
        component="form"
        onSubmit={handleSubmit}
      >
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <img src="/rentph-logo.png" height="auto" width={150} />
        </Box>
        <Typography sx={{ my: 2 }} variant="h6">
          Sign in as Admin
        </Typography>
        <Stack spacing={1}>
          <StyledTextField
            value={email}
            name="email"
            placeholder="Email address"
            handleChange={(e) => setEmail(e.target.value)}
          />
          <StyledTextField
            type="password"
            value={password}
            name="password"
            placeholder="Password"
            handleChange={(e) => setPassword(e.target.value)}
          />
          <Button
            loading={progress}
            type="submit"
            variant="contained"
            disableElevation
            sx={{ borderRadius: 0 }}
          >
            Submit
          </Button>
        </Stack>
        <Box>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Divider sx={{ width: "40%", backgroundColor: "gray" }} />
            <Typography
              sx={{
                position: "relative",
                margin: "10px 0",
              }}
              component="div"
              variant="body2"
            >
              OR
            </Typography>
            <Divider sx={{ width: "40%", backgroundColor: "gray" }} />
          </Box>
          <Button
            loading={authGoogleLoading}
            type="button"
            variant="outlined"
            color="inherit"
            startIcon={
              <Avatar src="/google.png" sx={{ height: 25, width: 25 }} />
            }
            onClick={authGoogleSignIn}
            disableElevation
            fullWidth
            sx={{ borderRadius: 0 }}
          >
            Continue with Google
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
