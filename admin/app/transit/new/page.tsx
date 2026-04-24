'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, Card } from '@/components/Page';
import { apiGet, apiPost, type ApiCompany, type ApiTrip } from '@/lib/api';

const CITIES = [
  { id: 'nkt', name: 'Nouakchott' },
  { id: 'ndb', name: 'Nouadhibou' },
  { id: 'atr', name: 'Atar' },
  { id: 'kif', name: 'Kiffa' },
  { id: 'ros', name: 'Rosso' },
  { id: 'zou', name: 'Zouérate' },
];

export default function NewTripPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<ApiCompany[]>([]);
  const [companyId, setCompanyId] = useState('');
  const [from, setFrom] = useState('nkt');
  const [to, setTo] = useState('ndb');
  const [fromStop, setFromStop] = useState('Gare du Ksar');
  const [toStop, setToStop] = useState('Gare centrale');
  const [date, setDate] = useState(new Date(Date.now() + 86_400_000).toISOString().slice(0, 16));
  const [duration, setDuration] = useState('360');
  const [distance, setDistance] = useState('470');
  const [price, setPrice] = useState('4500');
  const [seats, setSeats] = useState('45');
  const [busSize, setBusSize] = useState<'small' | 'medium' | 'big'>('big');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiGet<ApiCompany[]>('/companies?type=transit').then((cs) => {
      setCompanies(cs);
      if (cs[0]) setCompanyId(cs[0].id);
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    try {
      const departure = new Date(date).toISOString();
      const arrival = new Date(new Date(date).getTime() + parseInt(duration, 10) * 60 * 1000).toISOString();
      await apiPost<ApiTrip>('/trips', {
        companyId,
        fromCityId: from,
        toCityId: to,
        fromStop, toStop,
        departure, arrival,
        durationMin: parseInt(duration, 10),
        distanceKm: parseInt(distance, 10),
        priceMru: parseInt(price, 10),
        seatsTotal: parseInt(seats, 10),
        busSize,
      });
      router.push('/transit');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'create_failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Nouveau trajet" subtitle="Programme un trajet inter-ville pour une compagnie." />
      <div className="max-w-2xl">
        <Card>
          <form onSubmit={submit} className="p-5 space-y-4">
            <Field label="Compagnie" required>
              <select required value={companyId} onChange={(e) => setCompanyId(e.target.value)} className={inputCls}>
                <option value="">— Sélectionner —</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.city})</option>)}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Départ">
                <select value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls}>
                  {CITIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Arrivée">
                <select value={to} onChange={(e) => setTo(e.target.value)} className={inputCls}>
                  {CITIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Arrêt départ"><input value={fromStop} onChange={(e) => setFromStop(e.target.value)} className={inputCls} /></Field>
              <Field label="Arrêt arrivée"><input value={toStop} onChange={(e) => setToStop(e.target.value)} className={inputCls} /></Field>
            </div>

            <Field label="Date & heure de départ" required>
              <input type="datetime-local" required value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </Field>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Durée (min)"><input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className={inputCls} /></Field>
              <Field label="Distance (km)"><input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className={inputCls} /></Field>
              <Field label="Prix (MRU)" required><input required type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} /></Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Places totales"><input type="number" value={seats} onChange={(e) => setSeats(e.target.value)} className={inputCls} /></Field>
              <Field label="Taille bus">
                <select value={busSize} onChange={(e) => setBusSize(e.target.value as 'small' | 'medium' | 'big')} className={inputCls}>
                  <option value="small">Minibus</option>
                  <option value="medium">Bus moyen</option>
                  <option value="big">Grand bus</option>
                </select>
              </Field>
            </div>

            {err ? <div className="text-sm text-rose-600 bg-rose-50 rounded-lg p-3">{err}</div> : null}

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={submitting || !companyId} className="px-5 py-3 bg-amber text-white rounded-lg font-semibold disabled:opacity-50">
                {submitting ? 'Création…' : 'Créer le trajet'}
              </button>
              <button type="button" onClick={() => router.push('/transit')} className="px-5 py-3 text-slate-600">Annuler</button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}

const inputCls = 'w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber';

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
