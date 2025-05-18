"use client";
import styles from './page.module.css';
import { useState, memo } from "react";
import Iridescence from "@/Backgrounds/Iridescence/Iridescence";
import { useRouter } from "next/navigation";

const IridescenceBackground = memo(() => (
  <Iridescence
    className={styles.container_left}
    color={[1, 1, 1]}
    mouseReact={false}
    amplitude={0.1}
    speed={1.0}
  >
    <div className={styles.text}>
      <h1>Welcome to Streakfy!</h1>
      <p>Turn daily actions into life-changing habits.
        Track, grow and never break the chain.
      </p>
    </div>
  </Iridescence>
));

IridescenceBackground.displayName = 'IridescenceBackground';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const dataToSend = {
      name: `${formData.first_name} ${formData.last_name}`,
      email: formData.email,
      password: formData.password,
    };

    try {
      const registerResponse = await fetch("http://localhost:3001/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!registerResponse.ok) {
        throw new Error("Failed to create account");
      }

      const loginResponse = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!loginResponse.ok) {
        throw new Error("Failed to login");
      }

      const data = await loginResponse.json();
      localStorage.setItem("token", data.access_token);
      router.push("/profile");

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };


  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className={styles.container}>
      <IridescenceBackground />
      <div className={styles.container_right}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2>Register</h2>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.form_name}>
            <div className={styles.form_group}>
              <label htmlFor="first_name">Full name:</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                placeholder="Enter your first name"
              />
            </div>
            <div className={styles.form_group} >
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                placeholder="Enter your last name"
              />
            </div>
          </div>
          <div className={styles.form_group}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className={styles.form_group}>
            <label htmlFor="password">Password:</label>
            <div className={styles.password_input_container}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
              <button
                type="button"
                className={styles.password_toggle}
                onClick={togglePasswordVisibility}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🐵" : "🙈"}
              </button>
            </div>
          </div>
          <button type="submit" disabled={isLoading} className={styles.submit_button}>
            {isLoading ? "Registering..." : "Register"}
          </button>
          <p>Already have an account?</p>
          <a href="/login" className={styles.login_link}>Login</a>
        </form>
      </div>
    </div>
  );
}