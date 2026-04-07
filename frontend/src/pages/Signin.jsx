import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { z } from "zod";
import { BottomWarning } from "../components/BottomWarning";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { InputBox } from "../components/InputBox";
import { SubHeading } from "../components/SubHeading";
import { BACKEND_URL } from "../config";

const signinSchema = z.object({
  username: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const Signin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSignin = async () => {
    const result = signinSchema.safeParse({ username, password });
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      toast.error(result.error.errors[0].message);
      return;
    }
    try {
      setLoading(true);
      setErrors({});
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/user/signin`,
        { username, password },
      );
      localStorage.setItem("token", response.data.token);
      if (response.data.firstName) {
        localStorage.setItem("userName", `${response.data.firstName} ${response.data.lastName}`);
      }
      toast.success("Signed in successfully");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signin failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-slate-300 min-h-screen flex justify-center p-4">
      <div className="flex flex-col justify-center w-full max-w-sm">
        <div className="rounded-lg bg-white w-full text-center p-2 h-max px-4">
          <Heading label="Sign in" />
          <SubHeading label="Enter your credentials to access your account" />
          <InputBox
            onChange={(e) => setUsername(e.target.value)}
            placeholder="example@gmail.com"
            label="Email"
            error={errors.username}
          />
          <InputBox
            onChange={(e) => setPassword(e.target.value)}
            placeholder="123456"
            label="Password"
            error={errors.password}
          />
          <div className="pt-4">
            <Button onClick={handleSignin} label={loading ? "Signing in..." : "Sign in"} disabled={loading} />
          </div>
          <BottomWarning
            label={"Don't have an account?"}
            buttonText={"Sign up"}
            to={"/signup"}
          />
        </div>
      </div>
    </div>
  );
};
