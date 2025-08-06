import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import logo from '../../assets/logo.jpg';

const Login = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const { login } = useContext(AuthContext) || {};
  const navigate = useNavigate();

  useEffect(() => {
    // Add the CSS animations to the document
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@200;400;500;600;700;800;900&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;700;900&display=swap');

      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }

      @keyframes colorChange {
        0% { 
          color: #ffffff;
          text-shadow: 
            0 0 30px rgba(255, 255, 255, 0.8),
            0 4px 15px rgba(0, 0, 0, 0.6),
            0 0 10px rgba(255, 255, 255, 0.5);
        }
        25% { 
          color: #cccccc;
          text-shadow: 
            0 0 25px rgba(204, 204, 204, 0.7),
            0 4px 12px rgba(0, 0, 0, 0.5),
            0 0 8px rgba(255, 255, 255, 0.3);
        }
        50% { 
          color: #000000;
          text-shadow: 
            0 0 20px rgba(255, 255, 255, 0.9),
            0 4px 10px rgba(255, 255, 255, 0.7),
            0 0 15px rgba(255, 255, 255, 0.6);
        }
        75% { 
          color: #333333;
          text-shadow: 
            0 0 25px rgba(255, 255, 255, 0.8),
            0 4px 12px rgba(255, 255, 255, 0.6),
            0 0 12px rgba(255, 255, 255, 0.4);
        }
        100% { 
          color: #ffffff;
          text-shadow: 
            0 0 30px rgba(255, 255, 255, 0.8),
            0 4px 15px rgba(0, 0, 0, 0.6),
            0 0 10px rgba(255, 255, 255, 0.5);
        }
      }

      @keyframes underlineColorChange {
        0% { 
          background: linear-gradient(90deg, transparent, #ffffff 15%, #f0f0f0 30%, #ffffff 50%, #f0f0f0 70%, #ffffff 85%, transparent);
          opacity: 0.8; 
          transform: translateX(-50%) scaleX(0.9); 
        }
        25% { 
          background: linear-gradient(90deg, transparent, #cccccc 15%, #999999 30%, #666666 50%, #999999 70%, #cccccc 85%, transparent);
          opacity: 0.9; 
          transform: translateX(-50%) scaleX(1.0); 
        }
        50% { 
          background: linear-gradient(90deg, transparent, #666666 15%, #333333 30%, #000000 50%, #333333 70%, #666666 85%, transparent);
          opacity: 1.0; 
          transform: translateX(-50%) scaleX(1.1); 
        }
        75% { 
          background: linear-gradient(90deg, transparent, #999999 15%, #666666 30%, #333333 50%, #666666 70%, #999999 85%, transparent);
          opacity: 0.9; 
          transform: translateX(-50%) scaleX(1.0); 
        }
        100% { 
          background: linear-gradient(90deg, transparent, #ffffff 15%, #f0f0f0 30%, #ffffff 50%, #f0f0f0 70%, #ffffff 85%, transparent);
          opacity: 0.8; 
          transform: translateX(-50%) scaleX(0.9); 
        }
      }

      /* Animated gradient background when video doesn't load */
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(userId, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'relative',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      fontFamily: "'Poppins', 'Arial', sans-serif",
      background: videoLoaded 
        ? 'transparent' 
        : `
          linear-gradient(45deg, #667eea 0%, #764ba2 25%, #4568dc 50%, #b06ab3 75%, #667eea 100%),
          radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(120, 219, 226, 0.3) 0%, transparent 50%)
        `,
      backgroundSize: videoLoaded ? 'auto' : '400% 400%, 100% 100%, 100% 100%, 100% 100%',
      animation: videoLoaded ? 'none' : 'gradientShift 15s ease infinite',
      padding: '20px'
    }}>
      {/* Video Background - Try multiple sources */}
      <video 
        autoPlay 
        muted 
        loop 
        playsInline
        style={{ 
          position: 'fixed',
          top: 0, 
          left: 0, 
          width: '100vw',
          height: '100vh',
          objectFit: 'cover', 
          zIndex: videoLoaded ? -2 : -4,
          opacity: videoLoaded ? 0.7 : 0,
          transition: 'opacity 1s ease-in-out'
        }}
        onLoadedData={() => {
          console.log('Video loaded successfully');
          setVideoLoaded(true);
        }}
        onError={(e) => {
          console.log('Video failed to load, using animated background');
          setVideoLoaded(false);
        }}
        onCanPlay={() => {
          console.log('Video can play');
          setVideoLoaded(true);
        }}
      >
        {/* Try multiple video sources */}
        <source src="/assets/background-video.mp4" type="video/mp4" />
        <source src="./assets/background-video.mp4" type="video/mp4" />
        <source src="/public/assets/background-video.mp4" type="video/mp4" />
        <source src="/assets/background-video.webm" type="video/webm" />
        <source src="./assets/background-video.webm" type="video/webm" />
        {/* Fallback for browsers that don't support video */}
        Your browser does not support the video tag.
      </video>

      {/* Video Overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.4), rgba(118, 75, 162, 0.4))',
        zIndex: -1,
        backdropFilter: 'blur(2px)'
      }}></div>

      {/* Login Form Box */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.15)',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: `
          0 25px 45px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.4),
          inset 0 -1px 0 rgba(0, 0, 0, 0.1)
        `,
        width: '100%',
        maxWidth: '900px',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        opacity: 1,
        transform: 'translateY(0)',
        animation: 'slideInUp 0.8s ease-out 0.1s forwards, float 6s ease-in-out 1s infinite'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = `
          0 35px 60px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.5),
          inset 0 -1px 0 rgba(0, 0, 0, 0.1)
        `;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = `
          0 25px 45px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.4),
          inset 0 -1px 0 rgba(0, 0, 0, 0.1)
        `;
      }}
      >
        {/* Shimmer effect */}
        <div style={{
          content: '',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
          transition: 'left 0.5s'
        }}></div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '40px'
        }}>
          {/* Left Side - Logo and Title */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '30px', position: 'relative' }}>
              <img 
                src={logo} 
                alt="Logo" 
                style={{
                  maxWidth: '150px',
                  height: 'auto',
                  borderRadius: '50%',
                  boxShadow: `
                    0 15px 40px rgba(0, 0, 0, 0.4),
                    0 0 30px rgba(255, 255, 255, 0.2)
                  `,
                  transition: 'all 0.3s ease',
                  border: '3px solid rgba(255, 255, 255, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.15)';
                  e.target.style.boxShadow = `
                    0 20px 50px rgba(0, 0, 0, 0.5),
                    0 0 40px rgba(255, 255, 255, 0.4)
                  `;
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = `
                    0 15px 40px rgba(0, 0, 0, 0.4),
                    0 0 30px rgba(255, 255, 255, 0.2)
                  `;
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
              />
            </div>
            
            <h1 style={{
              textAlign: 'center',
              fontSize: '48px',
              fontWeight: '900',
              marginBottom: '40px',
              textShadow: `
                0 0 30px rgba(255, 255, 255, 0.8),
                0 4px 15px rgba(0, 0, 0, 0.6),
                0 0 10px rgba(255, 255, 255, 0.5)
              `,
              letterSpacing: '8px',
              textTransform: 'uppercase',
              position: 'relative',
              animation: 'colorChange 4s ease-in-out infinite',
              fontFamily: "'Roboto Slab', serif",
              fontStyle: 'normal',
              lineHeight: '1'
            }}>
              LOGIN
              <div style={{
                content: '',
                position: 'absolute',
                bottom: '-18px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '140px',
                height: '6px',
                background: 'linear-gradient(90deg, transparent, #ffffff 15%, #cccccc 30%, #000000 50%, #cccccc 70%, #ffffff 85%, transparent)',
                borderRadius: '3px',
                boxShadow: `
                  0 0 25px rgba(255, 255, 255, 0.7),
                  0 3px 10px rgba(0, 0, 0, 0.3)
                `,
                animation: 'underlineColorChange 4s ease-in-out infinite'
              }}></div>
            </h1>
          </div>

          {/* Right Side - Form */}
          <div style={{ flex: 1 }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {error && (
                <div style={{
                  background: 'rgba(255, 99, 132, 0.15)',
                  color: '#ff6384',
                  padding: '14px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '14px',
                  border: '1px solid rgba(255, 99, 132, 0.3)',
                  backdropFilter: 'blur(10px)',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                }}>
                  {error}
                </div>
              )}

              {/* User ID Field */}
              <div style={{ position: 'relative', marginBottom: '10px' }}>
                <label style={{
                  display: 'block',
                  color: '#e8f4fd',
                  fontWeight: '700',
                  marginBottom: '10px',
                  fontSize: '15px',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  <i className="bi bi-person-circle" style={{ 
                    marginRight: '10px', 
                    opacity: '0.9', 
                    color: '#c3e9ff',
                    filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.3))'
                  }}></i>
                  USER ID
                </label>
                <input
                  type="text"
                  placeholder="Enter your User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '16px 22px',
                    border: '2px solid rgba(232, 244, 253, 0.3)',
                    borderRadius: '12px',
                    outline: 'none',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(232, 244, 253, 0.8)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = `
                      0 10px 25px rgba(0, 0, 0, 0.2),
                      0 0 20px rgba(232, 244, 253, 0.3)
                    `;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(232, 244, 253, 0.3)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Password Field */}
              <div style={{ position: 'relative', marginBottom: '10px' }}>
                <label style={{
                  display: 'block',
                  color: '#e8f4fd',
                  fontWeight: '700',
                  marginBottom: '10px',
                  fontSize: '15px',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  <i className="bi bi-lock-closed" style={{ 
                    marginRight: '10px', 
                    opacity: '0.9', 
                    color: '#c3e9ff',
                    filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.3))'
                  }}></i>
                  PASSWORD
                </label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '16px 22px',
                    border: '2px solid rgba(232, 244, 253, 0.3)',
                    borderRadius: '12px',
                    outline: 'none',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(232, 244, 253, 0.8)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = `
                      0 10px 25px rgba(0, 0, 0, 0.2),
                      0 0 20px rgba(232, 244, 253, 0.3)
                    `;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(232, 244, 253, 0.3)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Forgot Password */}
              <div style={{ textAlign: 'right', margin: '10px 0' }}>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#c3e9ff',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    textShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
                    textTransform: 'capitalize',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#ffffff';
                    e.target.style.textShadow = '0 0 15px rgba(195, 233, 255, 0.8)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#c3e9ff';
                    e.target.style.textShadow = '0 2px 6px rgba(0, 0, 0, 0.4)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  forgot password?
                </button>
              </div>

              {/* Login Button */}
              <div style={{ marginTop: '25px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '18px',
                    fontSize: '18px',
                    fontWeight: '800',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 50%, #2c5aa0 100%)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.4s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    boxShadow: `
                      0 10px 30px rgba(74, 144, 226, 0.4),
                      inset 0 1px 0 rgba(255, 255, 255, 0.2)
                    `,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.background = 'linear-gradient(135deg, #357abd 0%, #2c5aa0 50%, #1e3f73 100%)';
                      e.target.style.transform = 'translateY(-4px)';
                      e.target.style.boxShadow = `
                        0 20px 40px rgba(74, 144, 226, 0.6),
                        inset 0 1px 0 rgba(255, 255, 255, 0.3)
                      `;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.background = 'linear-gradient(135deg, #4a90e2 0%, #357abd 50%, #2c5aa0 100%)';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = `
                        0 10px 30px rgba(74, 144, 226, 0.4),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2)
                      `;
                    }
                  }}
                  onMouseDown={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      LOGGING IN...
                    </>
                  ) : (
                    'LOGIN'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;