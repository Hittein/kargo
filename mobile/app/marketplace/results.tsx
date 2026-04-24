import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function MarketplaceResults() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/marketplace/search');
  }, [router]);
  return null;
}
