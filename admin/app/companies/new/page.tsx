'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, Card } from '@/components/Page';
import { apiPost, type ApiCompany } from '@/lib/api';

const CITIES = ['Nouakchott', 'Nouadhibou', 'Atar', 'Zouérate', 'Rosso', 'Kaédi', 'Kiffa'];

export default function NewCompanyPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState<'transit' | 'rental'>('transit');
  const [city, setCity] = useState('Nouakchott');
  const [contact, setContact] = useState('');
  const [fleetSize, setFleetSize] = useState<string>('10');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    try {
      await apiPost<ApiCompany>('/companies', {
        name: name.trim(),
        type,
        city,
        contact: contact.trim() || undefined,
        fleetSize: parseInt(fleetSize, 10) || 0,
      });
      router.push('/companies');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'create_failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Nouvelle compagnie" subtitle="Ajoute un partenaire transport ou location." />
      <div className="max-w-2xl">
        <Card>
          <form onSubmit={submit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Type</label>
              <div className="flex gap-2">
                {([['transit', 'Transport'], ['rental', 'Location']] as const).map(([k, l]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setType(k)}
                    className={`flex-1 py-3 rounded-lg text-sm font-semibold ${type === k ? 'bg-ink text-white' : 'bg-slate-100 text-slate-700'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <Field label="Nom" required>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sahara Rent, El Bourrak…"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber"
              />
            </Field>

            <Field label="Ville">
              <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-slate-200">
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="Contact (téléphone)">
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+222 ..."
                className="w-full px-4 py-3 rounded-lg border border-slate-200"
              />
            </Field>

            <Field label="Taille de la flotte">
              <input
                type="number"
                min="0"
                value={fleetSize}
                onChange={(e) => setFleetSize(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200"
              />
            </Field>

            {err ? <div className="text-sm text-rose-600 bg-rose-50 rounded-lg p-3">{err}</div> : null}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting || !name.trim()}
                className="px-5 py-3 bg-amber text-white rounded-lg font-semibold disabled:opacity-50"
              >
                {submitting ? 'Création…' : 'Créer'}
              </button>
              <button type="button" onClick={() => router.push('/companies')} className="px-5 py-3 text-slate-600">
                Annuler
              </button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
        {label} {required ? <span className="text-rose-500">*</span> : null}
      </label>
      {children}
    </div>
  );
}
