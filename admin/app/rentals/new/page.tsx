'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, Card } from '@/components/Page';
import { apiGet, apiPost, type ApiCompany, type ApiRentalListing } from '@/lib/api';

const CITIES = ['Nouakchott', 'Nouadhibou', 'Atar', 'Zouérate', 'Rosso', 'Kaédi', 'Kiffa'];
const CATEGORIES = ['economique', 'standard', 'premium', '4x4', 'utilitaire'];

export default function NewRentalPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<ApiCompany[]>([]);
  const [companyId, setCompanyId] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2022');
  const [category, setCategory] = useState('standard');
  const [pricePerDay, setPricePerDay] = useState('5000');
  const [seats, setSeats] = useState('5');
  const [transmission, setTransmission] = useState<'manual' | 'auto'>('auto');
  const [city, setCity] = useState('Nouakchott');
  const [photoUrls, setPhotoUrls] = useState<string>(
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=900&q=70',
  );
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiGet<ApiCompany[]>('/companies?type=rental').then((cs) => {
      setCompanies(cs);
      if (cs[0]) setCompanyId(cs[0].id);
    }).catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    try {
      await apiPost<ApiRentalListing>('/rental-listings', {
        companyId: companyId || null,
        brand: brand.trim(),
        model: model.trim(),
        year: parseInt(year, 10),
        category,
        pricePerDayMru: parseInt(pricePerDay, 10),
        seats: parseInt(seats, 10),
        transmission,
        airCon: true,
        chauffeurAvailable: false,
        city,
        photoUrls: photoUrls.split('\n').map((s) => s.trim()).filter(Boolean),
      });
      router.push('/rentals');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'create_failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Nouveau véhicule de location" subtitle="Ajoute un véhicule au parc d'une agence." />
      <div className="max-w-2xl">
        <Card>
          <form onSubmit={submit} className="p-5 space-y-4">
            <Field label="Agence">
              <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-slate-200">
                <option value="">— Sans agence —</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.city})</option>)}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Marque" required>
                <input required value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Hyundai" className={inputCls} />
              </Field>
              <Field label="Modèle" required>
                <input required value={model} onChange={(e) => setModel(e.target.value)} placeholder="Tucson" className={inputCls} />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Année">
                <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Catégorie">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Places">
                <input type="number" value={seats} onChange={(e) => setSeats(e.target.value)} className={inputCls} />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Prix/jour (MRU)" required>
                <input type="number" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Boîte">
                <select value={transmission} onChange={(e) => setTransmission(e.target.value as 'manual' | 'auto')} className={inputCls}>
                  <option value="auto">Automatique</option>
                  <option value="manual">Manuelle</option>
                </select>
              </Field>
              <Field label="Ville">
                <select value={city} onChange={(e) => setCity(e.target.value)} className={inputCls}>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Photos (1 URL par ligne)">
              <textarea value={photoUrls} onChange={(e) => setPhotoUrls(e.target.value)} rows={4} className={inputCls} />
            </Field>

            {err ? <div className="text-sm text-rose-600 bg-rose-50 rounded-lg p-3">{err}</div> : null}

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={submitting || !brand.trim() || !model.trim()} className="px-5 py-3 bg-amber text-white rounded-lg font-semibold disabled:opacity-50">
                {submitting ? 'Création…' : 'Créer'}
              </button>
              <button type="button" onClick={() => router.push('/rentals')} className="px-5 py-3 text-slate-600">
                Annuler
              </button>
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
