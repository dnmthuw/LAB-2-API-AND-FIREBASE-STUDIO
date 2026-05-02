import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';
import CuteButton from '../components/ui/CuteButton';

const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/chat');
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    setError('');
  }, [isRegistering]);

  if (checkingAuth) {
    return (
      <div className="h-screen bg-[#fdf2f8] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#f9a8d4] animate-spin" />
      </div>
    );
  }

  const handleAuthAction = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let userCredential;
      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      
      const idToken = await userCredential.user.getIdToken();
      localStorage.setItem('token', idToken);
      navigate('/chat');
    } catch (err) {
      console.error(err);
      const errorCode = err.code || '';
      let message = 'Oops! Something went wrong. 🐾';
      
      if (errorCode.includes('auth/invalid-credential')) message = 'Meow! Invalid email or password.';
      else if (errorCode.includes('auth/email-already-in-use')) message = 'Email is already in our cat-alog!';
      else if (errorCode.includes('auth/weak-password')) message = 'Password needs to be stronger (min 6 chars).';
      else message = 'Meow! Something went wrong. 🐾';
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      localStorage.setItem('token', idToken);
      navigate('/chat');
    } catch (err) {
      setError(err.message?.replace('Firebase:', '') || 'Google login failed 😿');
    } finally {
      setLoading(false);
    }
  };

  // Cat Ear Component
  const CatEars = () => (
    <>
      <div className="absolute -top-10 left-8 w-16 h-16 bg-white rounded-t-full transform -rotate-12 border-t-4 border-l-4 border-pink-100 shadow-sm animate-bounce [animation-duration:3s]">
        <div className="absolute top-4 left-4 w-8 h-8 bg-pink-100 rounded-t-full" />
      </div>
      <div className="absolute -top-10 right-8 w-16 h-16 bg-white rounded-t-full transform rotate-12 border-t-4 border-r-4 border-pink-100 shadow-sm animate-bounce [animation-duration:3s] [animation-delay:0.5s]">
        <div className="absolute top-4 right-4 w-8 h-8 bg-pink-100 rounded-t-full" />
      </div>
    </>
  );

  // Background Cat Icons
  const BackgroundCats = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
      <div className="absolute top-10 left-[10%] text-6xl animate-float">🐱</div>
      <div className="absolute top-20 right-[15%] text-5xl animate-float [animation-delay:1s]">😸</div>
      <div className="absolute top-40 left-[25%] text-4xl animate-float [animation-delay:2s]">🐾</div>
      <div className="absolute top-10 right-[35%] text-4xl animate-float [animation-delay:1.5s]">🐈</div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-[#fdf2f8] flex flex-col items-center justify-center p-4 overflow-hidden relative font-['Nunito']">
      <BackgroundCats />

      {/* Top Left Branding */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-20 flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-1000">
        <div className="h-12 w-12 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-cute border border-white group hover:rotate-6 transition-transform">
          <img src="/src/assets/login.png" alt="DocuMeow" className="h-10 w-10 image-pixelated" />
        </div>
        <div className="flex flex-col">
          <span className="font-pixel text-2xl text-pink-600 tracking-tighter leading-none">DOCUMEOW</span>
          <span className="text-[10px] text-pink-400 font-black uppercase tracking-widest mt-1">Pixel PDF Assistant</span>
        </div>
      </div>
      
      {/* Soft color blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-100/40 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="w-full max-w-[700px] relative z-10 mt-12">
        {/* Cat Ears */}
        <CatEars />

        <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] p-6 md:p-10 shadow-[0_20px_50px_rgba(249,168,212,0.2)] border-4 border-white relative">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-[#4a4a4a] mb-2 font-pixel tracking-wider uppercase">
              {isRegistering ? 'Join the Clowder' : 'Welcome Back'}
            </h1>
            <p className="text-pink-400 font-bold text-xs uppercase tracking-widest">
              {isRegistering ? 'Create a cat-count' : 'Login to your paw-file'}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-10">
            {/* Left side: Main Form */}
            <div className="flex-1 space-y-6">
              <form className="space-y-4" onSubmit={handleAuthAction}>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#4a4a4a]/60 ml-2 uppercase tracking-tighter">
                    Cat Mail
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-pink-300 group-focus-within:text-pink-400 transition-colors">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 bg-pink-50/50 border-2 border-pink-100 rounded-2xl text-[#4a4a4a] placeholder-pink-200 focus:outline-none focus:ring-0 focus:border-pink-300 transition-all font-bold text-sm"
                      placeholder="kitty@cat.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#4a4a4a]/60 ml-2 uppercase tracking-tighter">
                    Secret Paw-word
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-pink-300 group-focus-within:text-pink-400 transition-colors">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 bg-pink-50/50 border-2 border-pink-100 rounded-2xl text-[#4a4a4a] placeholder-pink-200 focus:outline-none focus:ring-0 focus:border-pink-300 transition-all font-bold text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  {/* Error message below password */}
                  <div className="h-4 px-2">
                    {error && (
                      <p className="text-[10px] font-bold text-red-400 animate-in fade-in slide-in-from-top-1 truncate">
                        {error}
                      </p>
                    )}
                  </div>
                </div>

                <CuteButton
                  onClick={handleAuthAction}
                  disabled={loading}
                  className="w-full py-3.5 text-sm"
                  variant="primary"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span>{isRegistering ? 'SIGN UP MEOW' : 'LOGIN NOW'}</span>
                  )}
                </CuteButton>
              </form>
            </div>

            {/* Divider (only on desktop) */}
            <div className="hidden md:flex flex-col items-center justify-center">
              <div className="w-[2px] h-full bg-pink-50" />
              <span className="py-4 bg-white text-[10px] font-black text-pink-200 uppercase rotate-90 whitespace-nowrap">OR</span>
              <div className="w-[2px] h-full bg-pink-50" />
            </div>

            {/* Right side: Other methods */}
            <div className="w-full md:w-[200px] flex flex-col justify-center gap-4">
              <div className="md:hidden relative text-center mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-pink-50" />
                </div>
                <span className="relative px-4 bg-white text-[10px] font-black text-pink-300 uppercase tracking-widest">Or pounce with</span>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border-2 border-pink-100 hover:bg-pink-50 text-[#4a4a4a] font-black rounded-2xl transition-all active:scale-[0.98] shadow-sm text-sm"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              
              <div className="mt-2 text-center">
                <button
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-[10px] font-black text-pink-300 hover:text-pink-400 transition-colors underline decoration-2 underline-offset-4 uppercase tracking-wider"
                >
                  {isRegistering ? 'Back to login?' : 'Need a paw-file?'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default LoginPage;

