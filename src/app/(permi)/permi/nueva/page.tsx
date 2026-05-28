import type {Metadata} from 'next';
import NuevaSesionForm from './NuevaSesionForm';

export const metadata: Metadata = {
  title: 'Registrar cobro · Cuadra',
};

export default function NuevaSesionPage() {
  return (
    <div className="mx-auto max-w-md">
      <NuevaSesionForm />
    </div>
  );
}
