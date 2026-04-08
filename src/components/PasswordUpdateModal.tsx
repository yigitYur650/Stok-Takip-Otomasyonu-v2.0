import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { SlideOver } from './SlideOver';
import { Lock, ShieldCheck, AlertCircle, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PasswordUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  isForced?: boolean;
}

export function PasswordUpdateModal({ isOpen, onClose, isForced = false }: PasswordUpdateModalProps) {
  const { signOut, setRecovering } = useAuth();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccess(true);
      
      // Kullanıcıya başarı mesajını görmesi için kısa bir süre tanıyalım
      setTimeout(async () => {
        setRecovering(false);
        await signOut();
        navigate('/login');
        onClose();
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Şifre güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SlideOver 
      isOpen={isOpen} 
      onClose={isForced ? () => {} : onClose} 
      title={isForced ? "Şifrenizi Belirleyin" : "Şifre Değiştir"}
    >
      <div className="space-y-8">
        <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-[24px] flex items-start gap-4">
           <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600 shrink-0">
              <ShieldCheck size={24} />
           </div>
           <div>
              <h4 className="font-bold text-slate-800 text-sm">Güvenlik Kontrolü</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {isForced 
                  ? "Hesap kurtarma işleminiz başarıyla tamamlandı. Lütfen yeni ve güvenli bir şifre belirleyin."
                  : "Hesap güvenliğiniz için şifrenizi düzenli aralıklarla değiştirmenizi öneririz."}
              </p>
           </div>
        </div>

        {success ? (
          <div className="py-12 text-center space-y-4">
             <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-lg shadow-emerald-100">
                ✅
             </div>
             <h3 className="text-xl font-black text-slate-800">Şifre Başarıyla Güncellendi</h3>
             <p className="text-sm text-slate-500">Oturumunuz kapatılıyor, lütfen yeni şifrenizle tekrar giriş yapın...</p>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-6">
             {error && (
               <div className="p-4 bg-rose-50/80 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-bold animate-shake">
                  <AlertCircle size={18} className="shrink-0" />
                  {error}
               </div>
             )}

             <div className="space-y-4">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Yeni Şifre</label>
                   <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                        placeholder="••••••••"
                      />
                   </div>
                </div>

                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Yeni Şifre (Tekrar)</label>
                   <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                        placeholder="••••••••"
                      />
                   </div>
                </div>
             </div>

             <button 
               type="submit" disabled={loading}
               className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
             >
                {loading ? "GÜNCELLENİYOR..." : (
                  <>
                    <Save size={18} />
                    ŞİFREYİ KAYDET VE YENİDEN BAŞLAT
                  </>
                )}
             </button>

             {!isForced && (
               <button 
                 type="button" onClick={onClose}
                 className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
               >
                 İşlemi İptal Et
               </button>
             )}
          </form>
        )}
      </div>
    </SlideOver>
  );
}
