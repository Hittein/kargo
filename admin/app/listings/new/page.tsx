'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, Card } from '@/components/Page';
import { apiPost, type ApiListing } from '@/lib/api';

const CITIES = ['Nouakchott', 'Nouadhibou', 'Atar', 'Zouérate', 'Rosso', 'Kaédi', 'Kiffa'];

export default function NewListingPage() {
  const router = useRouter();
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2020');
  const [importYear, setImportYear] = useState('2021');
  const [owners, setOwners] = useState('1');
  const [price, setPrice] = useState('1500000');
  const [km, setKm] = useState('30000');
  const [fuel, setFuel] = useState<'petrol' | 'diesel' | 'hybrid' | 'electric'>('diesel');
  const [transmission, setTransmission] = useState<'manual' | 'auto'>('auto');
  const [city, setCity] = useState('Nouakchott');
  const [district, setDistrict] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerType, setSellerType] = useState<'particulier' | 'pro'>('particulier');
  const [kargoVerified, setKargoVerified] = useState(false);
  const [photoUrls, setPhotoUrls] = useState(
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=900&q=70',
  );
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    try {
      await apiPost<ApiListing>('/listings', {
        brand: brand.trim(), model: model.trim(),
        year: parseInt(year, 10),
        importYear: parseInt(importYear, 10),
        ownersInCountry: parseInt(owners, 10),
        priceMru: parseInt(price, 10),
        km: parseInt(km, 10),
        fuel, transmission, city, district: district.trim() || null,
        sellerName: sellerName.trim(), sellerType, kargoVerified,
        photoUrls: photoUrls.split('\n').map((s) => s.trim()).filter(Boolean),
      });
      router.push('/listings');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'create_failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Nouvelle annonce" subtitle="Publie une voiture sur la marketplace mobile." />
      <div className="max-w-2xl">
        <Card>
          <form onSubmit={submit} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Marque" required><input required value={brand} onChange={(e) => setBrand(e.target.value)} className={inputCls} placeholder="Toyota" /></Field>
              <Field label="Modèle" required><input required value={model} onChange={(e) => setModel(e.target.value)} className={inputCls} placeholder="Hilux" /></Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Année modèle"><input type="number" value={year} onChange={(e) => setYear(e.target.value)} className={inputCls} /></Field>
              <Field label="Année dédouanement"><input type="number" value={importYear} onChange={(e) => setImportYear(e.target.value)} className={inputCls} /></Field>
              <Field label="Mains pays"><input type="number" min="0" value={owners} onChange={(e) => setOwners(e.target.value)} className={inputCls} /></Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Prix (MRU)" required><input required type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} /></Field>
              <Field label="Kilométrage"><input type="number" value={km} onChange={(e) => setKm(e.target.value)} className={inputCls} /></Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Carburant">
                <select value={fuel} onChange={(e) => setFuel(e.target.value as typeof fuel)} className={inputCls}>
                  <option value="diesel">Diesel</option>
                  <option value="petrol">Essence</option>
                  <option value="hybrid">Hybride</option>
                  <option value="electric">Électrique</option>
                </select>
              </Field>
              <Field label="Boîte">
                <select value={transmission} onChange={(e) => setTransmission(e.target.value as 'manual' | 'auto')} className={inputCls}>
                  <option value="auto">Automatique</option>
                  <option value="manual">Manuelle</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Ville">
                <select value={city} onChange={(e) => setCity(e.target.value)} className={inputCls}>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Quartier"><input value={district} onChange={(e) => setDistrict(e.target.value)} className={inputCls} placeholder="Tevragh Zeina" /></Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Nom vendeur" required><input required value={sellerName} onChange={(e) => setSellerName(e.target.value)} className={inputCls} /></Field>
              <Field label="Type vendeur">
                <select value={sellerType} onChange={(e) => setSellerType(e.target.value as 'particulier' | 'pro')} className={inputCls}>
                  <option value="particulier">Particulier</option>
                  <option value="pro">Pro / Concessionnaire</option>
                </select>
              </Field>
            </div>

            <Field label="Photos (1 URL par ligne)">
              <textarea value={photoUrls} onChange={(e) => setPhotoUrls(e.target.value)} rows={4} className={inputCls} />
            </Field>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={kargoVerified} onChange={(e) => setKargoVerified(e.target.checked)} />
              Kargo Verified
            </label>

            {err ? <div className="text-sm text-rose-600 bg-rose-50 rounded-lg p-3">{err}</div> : null}

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={submitting || !brand.trim() || !model.trim() || !sellerName.trim()} className="px-5 py-3 bg-amber text-white rounded-lg font-semibold disabled:opacity-50">
                {submitting ? 'Création…' : 'Publier'}
              </button>
              <button type="button" onClick={() => router.push('/listings')} className="px-5 py-3 text-slate-600">Annuler</button>
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
