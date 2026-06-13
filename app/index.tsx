import { Redirect } from 'expo-router';

/**
 * Root index — redirects to the Sales tab (the most-used screen).
 */
export default function Index() {
  return <Redirect href="/(tabs)/sales" />;
}
