// Capture-tab redirector. When the user taps the Capture tab, this
// route mounts and immediately redirects to the /capture modal at the
// root stack. Faster + simpler than intercepting tabBarButton.

import { Redirect } from 'expo-router';
export default function CaptureTabRedirect() {
  return <Redirect href="/capture" />;
}
