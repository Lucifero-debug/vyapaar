'use client'
import React from 'react';
import ReplayIcon from '@mui/icons-material/Replay'; // or use RefreshIcon

const ReloadButton = () => {
  return (
    <button onClick={() => location.reload()}>
      <ReplayIcon sx={{ fontSize: '40px' }} />
    </button>
  );
};

export default ReloadButton;

