'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {createClient} from '@/lib/supabase/client';

interface Props {
  permisionarioId: string;
}

export default function RealtimeUpdater({permisionarioId}: Props) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`parking-sessions-${permisionarioId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'parking_sessions',
          filter: `permisionario_id=eq.${permisionarioId}`,
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [permisionarioId, router]);

  return null;
}
