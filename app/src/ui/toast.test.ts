jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));

import Toast from 'react-native-toast-message';
import { toast } from './toast';

describe('toast', () => {
  beforeEach(() => {
    (Toast.show as jest.Mock).mockClear();
  });

  it('error() forwards to Toast.show with type=error', () => {
    toast.error('boom', { message: 'extra detail' });
    expect(Toast.show).toHaveBeenCalledWith({
      type: 'error',
      text1: 'boom',
      text2: 'extra detail',
      visibilityTime: 3000,
    });
  });

  it('success() uses success type', () => {
    toast.success('saved');
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'success', text1: 'saved' })
    );
  });

  it('info() uses info type', () => {
    toast.info('loading');
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'info' })
    );
  });

  it('passes a custom duration', () => {
    toast.error('boom', { duration: 6 });
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ visibilityTime: 6000 })
    );
  });
});
