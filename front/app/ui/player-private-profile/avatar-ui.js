'use client';
import { useState, useRef } from 'react';
import { useAuth } from '../../context/auth-context';
import { useTranslation } from '../../hooks/use-translation';
import { Button } from '../base';
import Loader from '../loader/loader-ui';

export default function AvatarUpload() {
  const { user, authLoading } = useAuth();
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { t } = useTranslation(); 
  const fileInputRef = useRef(null);
  
  // Imagen por defecto si no hay una previa ni una nueva seleccionada
  const defaultAvatar =  user?.avatarUrl || "/avatar/default-avatar.webp"; 
  const displayImage = preview || defaultAvatar;

const getCookie = (name) => {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='))
        ?.split('=')[1];
};


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Crear una URL temporal para ver la imagen antes de subirla
      setPreview(URL.createObjectURL(file));
      uploadFile(file);
    }
  };

  const uploadFile = async (file) => {
    if (!user) return;
    
    setUploading(true);
    const formData = new FormData();
    // Importante: El nombre 'avatar' debe coincidir con lo que espere tu backend
    formData.append('uploads/avatars/', file);

    try {
        const rawCookie = getCookie('csrf_token');
        const csrfToken = rawCookie ? decodeURIComponent(rawCookie) : '';

        if (!csrfToken) {
            setServerError('CSRF token missing');
            return;
        }

        const response = await fetch('/api/profile/avatar', {
            method: 'POST',
            body: formData, // El navegador se encarga del Content-Type
            credentials: 'include',
            headers: {
                'x-csrf-token': csrfToken, // <-- para el middleware de CSRF
            }
        });

        if (!response.ok)
        {
          console.error("Fallo en la subida. Status: ", response.status, "Error: ", response.error);

          if(response.status === 413)
           setServerError(t.avatar.error.tooLarge);
          else if (response.status === 400)
           setServerError(t.avatar.error.invalidImageFile);
          else if(response.error === 2)
            setServerError(t.avatar.error.invalidFormat);
          else
            setServerError(t.avatar.error.unknownError);
          return;
        }
        console.info("Avatar uploaded: ", response);
        if (user) {
          user.avatarURL = `/uploads/avatars/${user.id}.webp`;
        }
    } catch (error) {
      console.error("Error avatar: ", error);
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current && !uploading) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
    { authLoading ? (<Loader />) : (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="relative w-32 h-32 overflow-hidden rounded-full border-2 border-gray-300">
        <img 
          src={displayImage} 
          alt="Avatar" 
          className="w-full h-full object-cover"
        />
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">
            {t.common?.uploading || "Uploading..."}
          </div>
        )}
      </div>

      <Button
        variant="secondary"
        size="md"
        disabled={uploading}
        type="button"
        onClick={handleButtonClick}
      >
        {uploading ? (t.common?.loading || 'Loading...') : (t.avatar?.changeImage || 'Change Image')}
      </Button>
      <input 
        ref={fileInputRef}
        type="file" 
        className="hidden" 
        accept="image/png, image/jpeg" 
        onChange={handleFileChange}
        disabled={uploading}
      />
      <div className="error-message-space">
        {serverError && (
          <p className="error-message">{serverError}</p>
        )}
      </div>
    </div>
    )}
  </>
  );
}