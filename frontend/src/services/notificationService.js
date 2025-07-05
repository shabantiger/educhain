class NotificationService {
  constructor() {
    this.notifications = [];
    this.listeners = [];
  }

  // Subscribe to notifications
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  // Add a notification
  addNotification(notification) {
    const id = Date.now().toString();
    const newNotification = {
      id,
      timestamp: new Date(),
      ...notification
    };
    
    this.notifications.unshift(newNotification);
    this.notifyListeners();
    
    // Auto-remove after timeout if specified
    if (notification.timeout) {
      setTimeout(() => {
        this.removeNotification(id);
      }, notification.timeout);
    }
    
    return id;
  }

  // Remove a notification
  removeNotification(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  // Clear all notifications
  clearAll() {
    this.notifications = [];
    this.notifyListeners();
  }

  // Convenience methods for different notification types
  success(message, options = {}) {
    return this.addNotification({
      type: 'success',
      message,
      timeout: 5000,
      ...options
    });
  }

  error(message, options = {}) {
    return this.addNotification({
      type: 'error',
      message,
      timeout: 8000,
      ...options
    });
  }

  warning(message, options = {}) {
    return this.addNotification({
      type: 'warning',
      message,
      timeout: 6000,
      ...options
    });
  }

  info(message, options = {}) {
    return this.addNotification({
      type: 'info',
      message,
      timeout: 4000,
      ...options
    });
  }

  // Loading notification (doesn't auto-remove)
  loading(message, options = {}) {
    return this.addNotification({
      type: 'loading',
      message,
      ...options
    });
  }

  // Update an existing notification
  updateNotification(id, updates) {
    this.notifications = this.notifications.map(n => 
      n.id === id ? { ...n, ...updates } : n
    );
    this.notifyListeners();
  }

  // Show transaction progress
  showTransactionProgress(message, txHash) {
    return this.addNotification({
      type: 'transaction',
      message,
      txHash,
      actions: [
        {
          label: 'View on Explorer',
          action: () => {
            window.open(`https://basescan.org/tx/${txHash}`, '_blank');
          }
        }
      ]
    });
  }

  // Show certificate verification result
  showVerificationResult(isValid, certificateData) {
    if (isValid) {
      return this.success(
        `Certificate verified successfully for ${certificateData.studentName}`,
        {
          timeout: 10000,
          actions: [
            {
              label: 'View Details',
              action: () => {
                // Could open a modal or navigate to details page
                console.log('Certificate details:', certificateData);
              }
            }
          ]
        }
      );
    } else {
      return this.error('Certificate verification failed or certificate not found');
    }
  }

  // Show wallet connection status
  showWalletStatus(isConnected, account) {
    if (isConnected) {
      return this.success(
        `Wallet connected: ${account.slice(0, 6)}...${account.slice(-4)}`,
        { timeout: 3000 }
      );
    } else {
      return this.warning('Wallet disconnected');
    }
  }

  // Show network switch notification
  showNetworkSwitch(networkName) {
    return this.info(`Switched to ${networkName} network`);
  }

  // Show upload progress
  showUploadProgress(filename, progress) {
    return this.addNotification({
      type: 'upload',
      message: `Uploading ${filename}`,
      progress,
      filename
    });
  }
}

export default new NotificationService();