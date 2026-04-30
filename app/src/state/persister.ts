// AsyncStorage-backed persister for React Query. Splits out from
// queryClient.ts so the latter stays node-test-portable; only the app
// runtime imports this.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

export function createPersister() {
  return createAsyncStoragePersister({
    storage: AsyncStorage,
    key: 'heard:rq-cache',
    throttleTime: 1000,
  });
}
