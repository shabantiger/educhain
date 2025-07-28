import { useState, useEffect, useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';

const useWeb3 = () => {
  const context = useContext(Web3Context);
  
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  
  return context;
};
