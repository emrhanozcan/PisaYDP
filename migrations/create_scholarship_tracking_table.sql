
create table if not exists public.scholarship_tracking (
  id uuid primary key default gen_random_uuid(),
  student_id text not null references public.branch_students(id) on delete cascade,
  
  -- Bilgilendirme
  info_document_list text, -- Evrak Listesi: 'İletildi', 'Bekleniyor'
  
  -- Başvuru Bilgileri
  application_tuition_fee text, -- Okul Ücreti
  application_isee_status text, -- ISEE Durumu
  application_dorm_status text, -- Yurt Durumu
  application_scholarship_status text, -- Burs Durumu
  
  -- Evraklar
  documents_survey text, -- Anket
  documents_turkish text, -- Türkçe Evraklar
  documents_italian text, -- İtalyanca Çeviriler
  
  -- Giriş Bilgileri
  credentials_school_username text,
  credentials_school_password text,
  credentials_isee_username text,
  credentials_isee_password text,
  
  -- Sonuçlar
  result_ranking text, -- Sıralama
  result_status text, -- Sonuç: 'Kazandı', 'Yedek', 'Kazanamadı'
  result_block_account text, -- Bloke Hesap
  result_italy_lease text, -- İtalya Kira Kontratı
  result_iban text, -- IBAN
  result_notes text, -- Sonuç Notları
  
  -- CAF & Randevu
  caf_appointment_date date,
  caf_appointment_status text,
  
  -- Önemli Tarihler
  date_application date,
  date_isee date,
  date_lease_upload date,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(student_id)
);

-- RLS Policies
alter table public.scholarship_tracking enable row level security;

create policy "Enable read access for authenticated users" 
on public.scholarship_tracking for select 
to authenticated 
using (true);

create policy "Enable insert access for authenticated users" 
on public.scholarship_tracking for insert 
to authenticated 
with check (true);

create policy "Enable update access for authenticated users" 
on public.scholarship_tracking for update 
to authenticated 
using (true);

create policy "Enable delete access for authenticated users" 
on public.scholarship_tracking for delete 
to authenticated 
using (true);

-- Realtime
alter publication supabase_realtime add table public.scholarship_tracking;
