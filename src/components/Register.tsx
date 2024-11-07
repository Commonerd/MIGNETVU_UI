import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import axios from "axios";
import { members } from "../members";

interface RegisterProps {
  setUser: React.Dispatch<
    React.SetStateAction<{ email: string; isLoggedIn: boolean }>
  >;
}

const Register: React.FC<RegisterProps> = ({ setUser }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert(t("passwordMismatch"));
      return;
    }
    // Mock API call for registration (testing without real backend)
    const mockRegister = async () => {
      const existingUser = members.find(
        (member) => member.email === formData.email,
      );
      if (existingUser) {
        throw new Error("User already exists");
      }
      members.push({
        email: formData.email,
        name: formData.name,
        password: formData.password,
      });
      return true;
    };

    try {
      await mockRegister();
      alert(t("registerSuccess"));
      setUser({ email: formData.email, isLoggedIn: true });
    } catch (error) {
      alert(t("registerError"));
    }
  };

  return (
    <Container>
      <RegisterBox>
        <Title>{t("register")}</Title>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block">
              {t("name")}
            </label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block">
              {t("email")}
            </label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block">
              {t("password")}
            </label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block">
              {t("confirmPassword")}
            </label>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit">{t("register")}</Button>
        </form>
      </RegisterBox>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  background-color: #f3f4f6;
`;

const RegisterBox = styled.div`
  background-color: ##e5e7eb;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 32px;
  width: 20rem;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
  text-align: center;
`;

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
`;

const Button = styled.button`
  width: 100%;
  margin-top: 1.5rem;
  padding: 15px;
  background-color: #2d3748;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background-color: #2563eb;
  }
`;

export default Register;
