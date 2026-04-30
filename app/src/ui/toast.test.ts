jest.mock('burnt', () => ({
  toast: jest.fn(),
}));

import * as Burnt from 'burnt';
import { toast } from './toast';

describe('toast', () => {
  beforeEach(() => {
    (Burnt.toast as jest.Mock).mockClear();
  });

  it('error() forwards to burnt with the error preset', () => {
    toast.error('boom', { message: 'extra detail' });
    expect(Burnt.toast).toHaveBeenCalledWith({
      title: 'boom',
      message: 'extra detail',
      preset: 'error',
      duration: 3,
    });
  });

  it('success() uses the done preset', () => {
    toast.success('saved');
    expect(Burnt.toast).toHaveBeenCalledWith(
      expect.objectContaining({ preset: 'done', title: 'saved' })
    );
  });

  it('info() uses the none preset', () => {
    toast.info('loading');
    expect(Burnt.toast).toHaveBeenCalledWith(
      expect.objectContaining({ preset: 'none' })
    );
  });

  it('passes a custom duration through', () => {
    toast.error('boom', { duration: 6 });
    expect(Burnt.toast).toHaveBeenCalledWith(
      expect.objectContaining({ duration: 6 })
    );
  });
});
