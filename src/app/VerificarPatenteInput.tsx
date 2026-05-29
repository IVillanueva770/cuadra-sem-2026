'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Search} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';

export default function VerificarPatenteInput() {
  const router = useRouter();
  const [patente, setPatente] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const p = patente.toUpperCase().replace(/\s/g, '');
    if (p.length < 5) return;
    router.push(`/verificar/${p}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label htmlFor="patente-check" className="text-sm font-medium" style={{color: 'var(--fg2)'}}>
        Verificar mi patente
      </label>
      <div className="flex gap-2">
        <Input
          id="patente-check"
          value={patente}
          onChange={(e) => setPatente(e.target.value.toUpperCase())}
          placeholder="ABC123 o AB123CD"
          maxLength={7}
          className="h-12 text-base font-mono tracking-wider uppercase"
          aria-label="Patente a verificar"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
        />
        <Button
          type="submit"
          className="h-12 px-4 shrink-0"
          disabled={patente.trim().length < 5}
          aria-label="Verificar patente"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}
