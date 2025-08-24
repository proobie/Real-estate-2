// Usage: node upload-to-supabase-storage.js
// FILL IN your Supabase project URL and service role key below
const SUPABASE_URL = 'https://vlboszmxhmamsviufucv.supabase.co'; // <-- your Supabase URL
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsYm9zem14aG1hbXN2aXVmdWN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjg3MDk3NywiZXhwIjoyMDY4NDQ2OTc3fQ.h2iOUDlRfUgIol-PhGaJO73HqbjVAzxrDezluVT-tOA'; // <-- your service role key (not anon key)
const BUCKET = 'uploads';

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const uploadsDir = path.join(__dirname, 'uploads');

async function uploadFile(localPath, storagePath) {
  const fileBuffer = fs.readFileSync(localPath);
  // Check if file already exists
  const { data: existing, error: listError } = await supabase.storage.from(BUCKET).list(path.dirname(storagePath), { search: path.basename(storagePath) });
  if (existing && existing.some(f => f.name === path.basename(storagePath))) {
    return { url: getPublicUrl(storagePath), skipped: true };
  }
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, fileBuffer, { upsert: false });
  if (error) throw error;
  return { url: getPublicUrl(storagePath), skipped: false };
}

function getPublicUrl(storagePath) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

async function main() {
  const files = fs.readdirSync(uploadsDir);
  const mapping = {};
  let uploaded = 0, skipped = 0;
  for (const file of files) {
    const localPath = path.join(uploadsDir, file);
    if (!fs.statSync(localPath).isFile()) continue;
    const storagePath = file; // flat structure
    try {
      const { url, skipped: wasSkipped } = await uploadFile(localPath, storagePath);
      mapping[`/uploads/${file}`] = url;
      if (wasSkipped) {
        console.log(`Skipped (already exists): ${file}`);
        skipped++;
      } else {
        console.log(`Uploaded: ${file} -> ${url}`);
        uploaded++;
      }
    } catch (err) {
      console.error(`Error uploading ${file}:`, err.message);
    }
  }
  // Print mapping
  console.log('\n--- Upload Mapping ---');
  for (const [oldPath, newUrl] of Object.entries(mapping)) {
    console.log(`${oldPath} => ${newUrl}`);
  }
  console.log(`\nDone! Uploaded: ${uploaded}, Skipped: ${skipped}`);
}

main(); 