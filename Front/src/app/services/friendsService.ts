import { Friend, mockFriends } from '../data/mockData';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const friendService = {
  // Simular la carga inicial de amigos
  getFriends: async (): Promise<Friend[]> => {
    await delay(500);
    return [...mockFriends];
  },

  // Función para simular movimiento aleatorio (ideal para el radar)
  simulateMovement: (friends: Friend[]): Friend[] => {
    return friends.map(f => ({
      ...f,
      position: {
        // Movemos ligeramente la posición x e y (-1% a +1%)
        x: Math.max(0, Math.min(100, f.position.x + (Math.random() * 2 - 1))),
        y: Math.max(0, Math.min(100, f.position.y + (Math.random() * 2 - 1)))
      }
    }));
  }
};