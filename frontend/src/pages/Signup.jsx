import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { z } from "zod";
import { BACKEND_URL } from "../config";
import { BottomWarning } from "../components/BottomWarning";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { InputBox } from "../components/InputBox";
import { SubHeading } from "../components/SubHeading";

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSignup = async () => {
    const result = signupSchema.safeParse({
      firstName,
      lastName,
      username,
      password,
    });
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
      const response = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
        username,
        firstName,
        lastName,
        password,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userName", `${firstName} ${lastName}`);
      toast.success("Account created successfully");
      navigate("/signin");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-300 min-h-screen flex justify-center p-4">
      <div className="flex flex-col justify-center w-full max-w-sm">
        <div className="rounded-lg bg-white w-full text-center p-2 h-max px-4">
          <Heading label="Sign up" />
          <SubHeading label="Enter your information to create an account" />
          <InputBox
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            label="First Name"
            error={errors.firstName}
          />
          <InputBox
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            label="Last Name"
            error={errors.lastName}
          />
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
            <Button
              onClick={handleSignup}
              label={loading ? "Creating account..." : "Sign up"}
              disabled={loading}
            />
          </div>
          <BottomWarning
            label={"Already have an account?"}
            buttonText={"Sign in"}
            to={"/signin"}
          />
        </div>
      </div>
    </div>
  );
};
