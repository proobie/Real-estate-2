// Migrate local JSON data to Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://vlboszmxhmamsviufucv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsYm9zem14aG1hbXN2aXVmdWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NzA5NzcsImV4cCI6MjA2ODQ0Njk3N30.uxpMJPCVFbCwSddvXG4ykH0JTjviuZAwpbeZQW0GQNU';
const supabase = createClient(supabaseUrl, supabaseKey);

function fixTypesProperties(row) {
  // Convert string numbers to numbers
  const intFields = ['price', 'bedrooms', 'bathrooms', 'area', 'floor', 'totalFloors', 'ageOfProperty', 'bookingAmount', 'rentAmount', 'deposit', 'maintenance'];
  intFields.forEach(f => {
    if (row[f] !== undefined && typeof row[f] === 'string') row[f] = parseInt(row[f], 10);
  });
  // Convert booleans
  if (typeof row.featured === 'string') row.featured = row.featured === 'true';
  if (typeof row.verified === 'string') row.verified = row.verified === 'true';
  // JSON fields
  ['location', 'images', 'features', 'highlights', 'agent'].forEach(f => {
    if (row[f] && typeof row[f] !== 'object') {
      try { row[f] = JSON.parse(row[f]); } catch {}
    }
  });
  return row;
}

function fixTypesProjects(row) {
  // Convert numbers
  ['totalUnits', 'availableUnits'].forEach(f => {
    if (row[f] !== undefined && typeof row[f] === 'string') row[f] = parseInt(row[f], 10);
  });
  // JSON fields
  ['location', 'images', 'floorPlans', 'amenities', 'priceRange', 'unitTypes', 'configurations', 'approvals', 'bankApprovals', 'highlights', 'pricing'].forEach(f => {
    if (row[f] && typeof row[f] !== 'object') {
      try { row[f] = JSON.parse(row[f]); } catch {}
    }
  });
  return row;
}

function fixTypesLeads(row) {
  // JSON fields
  ['communicationLog', 'reminders'].forEach(f => {
    if (row[f] && typeof row[f] !== 'object') {
      try { row[f] = JSON.parse(row[f]); } catch {}
    }
  });
  return row;
}

async function migrate(table, data, fixer) {
  for (const row of data) {
    const fixed = fixer ? fixer(row) : row;
    try {
      const { error } = await supabase.from(table).insert([fixed]);
      if (error) {
        console.error(`Error inserting into ${table}:`, error.message, fixed);
      } else {
        console.log(`Inserted into ${table}:`, fixed.id || fixed.name);
      }
    } catch (err) {
      console.error(`Exception inserting into ${table}:`, err, fixed);
    }
  }
}

async function main() {
  // Properties
  const properties = JSON.parse(fs.readFileSync(path.join(__dirname, 'properties.json'), 'utf-8'));
  await migrate('properties', properties, fixTypesProperties);

  // Projects
  const projects = JSON.parse(fs.readFileSync(path.join(__dirname, 'projects.json'), 'utf-8'));
  await migrate('projects', projects, fixTypesProjects);

  // Leads
  const leads = JSON.parse(fs.readFileSync(path.join(__dirname, 'leads.json'), 'utf-8'));
  await migrate('leads', leads, fixTypesLeads);

  // Admin user (example, update as needed)
  const adminUser = {
    id: 'admin1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    password: 'changeme', // Set a secure password or hash
    avatar: '',
    phone: '',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };
  await migrate('users', [adminUser]);

  console.log('Migration complete!');
}

main(); 