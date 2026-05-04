// Root redirect — sends the launching app to the Front tab.
// Without this, opening "/" shows nothing because the (tabs) group
// has no default index of its own.
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/front" />;
}
