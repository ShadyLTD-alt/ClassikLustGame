import * as storage from './storage';

const ENERGY_REGEN_INTERVAL = 60 * 1000; // 1 min
let energyInterval: NodeJS.Timeout | null = null;

function regenerateEnergy() {
  try {
    if (!storage.isDBReady()) {
      console.warn('[Energy Regen] DB not ready, skipping...');
      return;
    }
    const users = storage.getAllUsers();
    for (const user of users) {
      storage.updateUserEnergy(user.id);
    }
    console.log(`[Energy Regen] Updated ${users.length} users`);
  } catch (err) {
    console.error('[Energy Regen] Error:', err);
  }
}

export function startEnergyRegen() {
  if (energyInterval) return;
  energyInterval = setInterval(regenerateEnergy, ENERGY_REGEN_INTERVAL);
  console.log('[Energy Regen] Started.');
}