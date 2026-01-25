import { createClient } from '@supabase/supabase-js';

// Usage: npx ts-node backend/scripts/make-admin.ts <userId>

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    console.error('Usage: npx ts-node backend/scripts/make-admin.ts <userId>');
    process.exit(1);
  }

  const SUPABASE_URL = 'https://vlboszmxhmamsviufucv.supabase.co';
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SERVICE_KEY) {
    console.error('Missing SUPABASE_SERVICE_KEY in environment');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { role_key: 'admin' },
  });

  if (error) {
    console.error('Failed to promote user:', error.message);
    process.exit(1);
  }

  console.log('User promoted to admin:', data.user?.id, data.user?.email);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});



