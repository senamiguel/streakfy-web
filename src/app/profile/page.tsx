"use client";
import styles from './profile.module.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('streaks');
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; image_path: string; } | null>(null);
  const [error, setError] = useState("");
  
  // Todo : guardar erro session storage

  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const handleLoad = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Usuário não autenticado");
      setIsLoading(false);
      router.push('/');
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/users/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Sessão expirada. Faça login novamente.");
          router.push('/login');
          return;
        }
        throw new Error("Erro ao carregar dados do usuário");
      }

      const data = await response.json();
      setUser(data);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar usuário");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    handleLoad();
  }, []);
  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.profile_info}>
          <div className={styles.avatar}>
            <img src={user?.image_path ?? "/assets/default-avatar.png"} alt="Profile" />
            <button className={styles.edit_avatar}>Edit</button>
          </div>
          <h2>{user?.name ?? "Carregando..."}</h2>
          <p className={styles.email}>{user?.email ?? "..."}</p>
          <div className={styles.stats}>
            <div className={styles.stat_item}>
              <span className={styles.stat_value}>12</span>
              <span className={styles.stat_label}>Active Streaks</span>
            </div>
            <div className={styles.stat_item}>
              <span className={styles.stat_value}>45</span>
              <span className={styles.stat_label}>Total Days</span>
            </div>
            <div className={styles.stat_item}>
              <span className={styles.stat_value}>8</span>
              <span className={styles.stat_label}>Achievements</span>
            </div>
          </div>
        </div>
        <nav className={styles.navigation}>
          <div className={styles.nav_items}>
            <button
              className={`${styles.nav_item} ${activeTab === 'streaks' ? styles.active : ''}`}
              onClick={() => setActiveTab('streaks')}
            >
              My Streaks
            </button>
            <button
              className={`${styles.nav_item} ${activeTab === 'achievements' ? styles.active : ''}`}
              onClick={() => setActiveTab('achievements')}
            >
              Achievements
            </button>
            <button
              className={`${styles.nav_item} ${activeTab === 'settings' ? styles.active : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </div>
          <button
            className={styles.logout_button}
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </div>

      <main className={styles.main_content}>
        {activeTab === 'streaks' && (
          <div className={styles.streaks_section}>
            <div className={styles.section_header}>
              <h1>My Streaks</h1>
              <button className={styles.add_button}>+ New Streak</button>
            </div>
            <div className={styles.streaks_grid}>
              {[1, 2, 3, 4].map((streak) => (
                <div key={streak} className={styles.streak_card}>
                  <div className={styles.streak_header}>
                    <h3>Morning Meditation</h3>
                    <span className={styles.streak_days}>7 days</span>
                  </div>
                  <div className={styles.streak_progress}>
                    <div className={styles.progress_bar}>
                      <div className={styles.progress} style={{ width: '70%' }}></div>
                    </div>
                    <span>70%</span>
                  </div>
                  <div className={styles.streak_stats}>
                    <div className={styles.stat}>
                      <span className={styles.stat_value}>7</span>
                      <span className={styles.stat_label}>Current</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.stat_value}>14</span>
                      <span className={styles.stat_label}>Longest</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.stat_value}>21</span>
                      <span className={styles.stat_label}>Total</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className={styles.achievements_section}>
            <h1>Achievements</h1>
            <div className={styles.achievements_grid}>
              {[1, 2, 3, 4, 5, 6].map((achievement) => (
                <div key={achievement} className={styles.achievement_card}>
                  <div className={styles.achievement_icon}>🏆</div>
                  <h3>7 Day Streak</h3>
                  <p>Maintain a streak for 7 consecutive days</p>
                  <span className={styles.achievement_date}>Earned on Jan 15, 2024</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className={styles.settings_section}>
            <h1>Settings</h1>
            <div className={styles.settings_form}>
              <div className={styles.form_group}>
                <label>Display Name</label>
                <input type="text" defaultValue="John Doe" />
              </div>
              <div className={styles.form_group}>
                <label>Email</label>
                <input type="email" defaultValue="john.doe@example.com" />
              </div>
              <div className={styles.form_group}>
                <label>Password</label>
                <div className={styles.password_input_container}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className={styles.password_toggle}
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
              <div className={styles.form_group}>
                <label>Notifications</label>
                <div className={styles.toggle}>
                  <input type="checkbox" id="notifications" defaultChecked />
                  <label htmlFor="notifications">Enable daily reminders</label>
                </div>
              </div>
              <button className={styles.save_button}>Save Changes</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}