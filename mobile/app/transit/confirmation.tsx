import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useTicketsStore } from '@/lib/stores/tickets';

export default function TransitConfirmation() {
  const router = useRouter();
  const latest = useTicketsStore((s) => s.tickets[0]);
  useEffect(() => {
    if (latest) {
      router.replace(`/transit/ticket/${latest.id}`);
    } else {
      router.replace('/(tabs)/tickets');
    }
  }, [router, latest]);
  return null;
}
