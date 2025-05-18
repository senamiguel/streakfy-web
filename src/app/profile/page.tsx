"use client";
import styles from './profile.module.css';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/modal/modal';
import { supabase } from '@/lib/supabase';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('streaks');
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; imagePath: string; } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleCloseModal = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsOpen(false);
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      
      if (user?.imagePath) {
        try {
          const url = new URL(user.imagePath);
          const pathParts = url.pathname.split('/');
          const fileName = pathParts[pathParts.length - 1];
          const imagePath = `profile-images/${fileName}`;

          console.log('Deletando imagem:', { imagePath });

          const { error: deleteError } = await supabase.storage
            .from('users-images')
            .remove([imagePath]);
          
          if (deleteError) {
            console.error('Erro ao deletar imagem antiga:', deleteError);
          } else {
            console.log('Imagem antiga deletada com sucesso');
          }
        } catch (err) {
          console.error('Erro ao processar URL da imagem antiga:', err);
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('users-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('users-images')
        .getPublicUrl(filePath);

      if (!data?.publicUrl) throw new Error("Erro ao obter URL da imagem");
  
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token de autenticação ausente');

      console.log('Token:', token);
      console.log('URL da imagem:', data.publicUrl);
    
      const response = await fetch("http://localhost:3001/users/me", {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          imagePath: data.publicUrl,
          name: user?.name,
          email: user?.email
        })
      });
    
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Erro na resposta:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error('Erro ao atualizar imagem de perfil');
      }

      const updatedUser = await response.json();
      console.log('Usuário atualizado:', updatedUser);
    
      setUser(prev => prev ? { ...prev, imagePath: data.publicUrl } : null);
      await handleLoad();
      handleCloseModal();

    } catch (err) {
      console.error('Erro completo:', err);
      setError(err instanceof Error ? err.message : 'Falha ao enviar imagem');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.profile_info}>
          <div className={styles.avatar}>
            <img src={user?.imagePath ?? "/assets/default-avatar.png"} alt="Profile" />
            <button onClick={() => { setIsOpen(true) }} className={styles.edit_avatar}>Edit</button>
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
        <Modal isOpen={isOpen} onClose={handleCloseModal}>
          <div className={styles.modal_content}>
            <h2>Change Profile Picture</h2>
            <div className={styles.upload_section}>
              <div className={styles.preview_image}>
                <img 
                  src={selectedImage ?? user?.imagePath ?? "/assets/default-avatar.png"} 
                  alt="Profile Preview" 
                />
                <label className={styles.edit_overlay}>
                  <span className={styles.edit_icon}>✏️</span>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setSelectedImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              <div className={styles.modal_actions}>
                <button 
                  className={styles.save_button}
                  onClick={async () => {
                    if (selectedImage) {
                      const file = fileInputRef.current?.files?.[0];
                      if (file) {
                        await handleImageUpload(file);
                      }
                    }
                  }}
                  disabled={isUploading || !selectedImage}
                >
                  {isUploading ? 'Uploading...' : 'Save'}
                </button>
                <button 
                  className={styles.cancel_button}
                  onClick={handleCloseModal}
                  disabled={isUploading}
                >
                  Cancel
                </button>
              </div>
              {error && <p className={styles.error_message}>{error}</p>}
            </div>
          </div>
        </Modal>
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
                    {showPassword ? "🐵" : "🙈"}
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