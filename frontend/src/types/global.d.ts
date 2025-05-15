interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (eventName: string, callback: (...args: any[]) => void) => void;
    removeAllListeners: (eventName: string) => void;
  };
}
