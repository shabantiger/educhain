export const CERTIFICATE_TYPES = [
  'Certificate',
  'Diploma',
  'Degree',
  'Transcript',
  'Award'
];

export const GRADE_OPTIONS = [
  'First Class',
  'Second Class Upper',
  'Second Class Lower',
  'Pass',
  'A+', 'A', 'A-',
  'B+', 'B', 'B-',
  'C+', 'C', 'C-',
  'D+', 'D', 'D-',
  'F'
];

export const FILE_TYPES = {
  ALLOWED: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
};

export const NETWORKS = {
  BASE: {
    chainId: '0x2105',
    chainName: 'Base',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org/'],
  },
  BASE_GOERLI: {
    chainId: '0x14A33',
    chainName: 'Base Goerli',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://goerli.base.org'],
    blockExplorerUrls: ['https://goerli.basescan.org/'],
  }
};

export const API_ENDPOINTS = {
  AUTH: '/auth',
  INSTITUTIONS: '/institutions',
  CERTIFICATES: '/certificates',
  HEALTH: '/health'
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ISSUE: '/issue',
  VERIFY: '/verify',
  STUDENT: '/student',
  CERTIFICATES: '/certificates'
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  WALLET_ADDRESS: 'walletAddress'
};

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ETHEREUM_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  IPFS_HASH: /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/
};
