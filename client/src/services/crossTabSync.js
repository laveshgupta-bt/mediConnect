// Real-Time Cross-Window Synchronization via BroadcastChannel
let channel = null;

try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel('mediconnect_realtime_sync');
  }
} catch (e) {
  console.warn('BroadcastChannel not supported in this environment', e);
}

export const syncEvent = {
  broadcast(type, payload = {}) {
    try {
      if (channel) {
        channel.postMessage({ type, payload, timestamp: Date.now() });
      }
    } catch (e) {
      console.warn('Sync broadcast error:', e);
    }
  },

  listen(handler) {
    if (!channel) return () => {};
    const listener = (event) => {
      if (event.data && handler) {
        handler(event.data);
      }
    };
    channel.addEventListener('message', listener);
    return () => {
      channel.removeEventListener('message', listener);
    };
  }
};
