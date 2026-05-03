// Phantom route. The capture flow runs as a modal (./capture.tsx at
// root); this file exists only so the (tabs) tab strip has a slot for
// the rust-circle Capture button. The button itself in (tabs)/_layout
// pushes the modal route — this file is never actually rendered.

import { Redirect } from 'expo-router';
export default function CaptureTabPhantom() {
  return <Redirect href="/" />;
}
