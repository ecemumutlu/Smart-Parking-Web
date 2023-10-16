import React from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import './loading.css'; // Bu stil dosyası LoadingIcon bileşeni ile aynı dizinde bulunmalı

function LoadingIcon() {
  return (
    <div className="centered-container"> {/* Yeni bir kapsayıcı */}
      <div className="waiting-icon">
        <h1>Loading..</h1>
        <br />
        <AiOutlineLoading3Quarters className="loading-icon" />
      </div>
    </div>
  );
}

export default LoadingIcon;
