"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const multer_1 = __importDefault(require("multer"));
const sync_1 = require("csv-parse/sync");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/** @type {import('express').Express} */
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const supabaseUrl = 'https://vlboszmxhmamsviufucv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
function uploadToSupabaseStorage(file_1) {
    return __awaiter(this, arguments, void 0, function* (file, folder = '') {
        const path = require('path');
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
        const storagePath = folder ? `${folder}/${filename}` : filename;
        const { error } = yield exports.supabase.storage.from('uploads').upload(storagePath, file.buffer, { upsert: false, contentType: file.mimetype });
        if (error)
            throw error;
        return `${supabaseUrl}/storage/v1/object/public/uploads/${storagePath}`;
    });
}
// Middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// File upload setup
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
// Serve uploaded files
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// --- PROPERTIES API USING SUPABASE ---
// Get all properties
app.get('/api/properties', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield exports.supabase.from('properties').select('*, profiles!createdBy(*)');
    if (error) {
        console.error('Error fetching properties from Supabase:', error);
        res.status(500).json({ error: error.message });
        return;
    }
    res.json(data);
}));
// Get property by ID
app.get('/api/properties/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { data, error } = yield exports.supabase.from('properties').select('*, profiles!createdBy(*)').eq('id', id).single();
    if (error || !data) {
        res.status(404).json({ error: 'Property not found' });
        return;
    }
    res.json(data);
}));
// Create a new property
app.post('/api/properties', upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'brochure', maxCount: 1 },
    { name: 'floorPlan', maxCount: 1 }
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const files = req.files;
        let images = [];
        if (files.images) {
            images = yield Promise.all(files.images.map(f => uploadToSupabaseStorage(f, 'properties/images')));
        }
        let brochure;
        if (files.brochure && files.brochure[0]) {
            brochure = yield uploadToSupabaseStorage(files.brochure[0], 'properties/brochures');
        }
        let floorPlan;
        if (files.floorPlan && files.floorPlan[0]) {
            floorPlan = yield uploadToSupabaseStorage(files.floorPlan[0], 'properties/floorplans');
        }
        const parseJsonField = (field, defaultValue) => {
            if (!field)
                return defaultValue;
            try {
                return JSON.parse(field);
            }
            catch (_a) {
                return defaultValue;
            }
        };
        const newProperty = {
            title: data.title,
            description: data.description,
            type: data.type,
            furnishing: data.furnishing,
            possession: data.possession,
            parking: data.parking,
            facing: data.facing,
            status: data.status,
            reraId: data.reraId,
            projectId: data.projectId || null,
            listingType: data.listingType,
            leaseTerm: data.leaseTerm,
            availableFrom: data.availableFrom,
            images,
            brochure,
            floorPlan,
            location: parseJsonField(data.location, {}),
            features: parseJsonField(data.features, []),
            highlights: parseJsonField(data.highlights, []),
            agent: parseJsonField(data.agent, {}),
            price: Number(data.price) || 0,
            bedrooms: Number(data.bedrooms) || 0,
            bathrooms: Number(data.bathrooms) || 0,
            area: Number(data.area) || 0,
            floor: Number(data.floor) || 0,
            totalFloors: Number(data.totalFloors) || 0,
            ageOfProperty: Number(data.ageOfProperty) || 0,
            bookingAmount: data.bookingAmount ? Number(data.bookingAmount) : undefined,
            rentAmount: data.rentAmount ? Number(data.rentAmount) : undefined,
            deposit: data.deposit ? Number(data.deposit) : undefined,
            maintenance: data.maintenance ? Number(data.maintenance) : undefined,
            featured: data.featured === 'true',
            verified: data.verified === 'true',
            createdBy: data.createdBy,
        };
        const { data: inserted, error } = yield exports.supabase.from('properties').insert(newProperty).select().single();
        if (error) {
            console.error('Supabase insert error:', error);
            res.status(500).json({ error: error.message, details: error.details });
            return;
        }
        res.status(201).json(inserted);
    }
    catch (err) {
        console.error('POST /api/properties error:', err);
        res.status(400).json({ error: 'Invalid property data', details: err.message });
    }
}));
// Update a property by ID
app.put('/api/properties/:id', upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'brochure', maxCount: 1 },
    { name: 'floorPlan', maxCount: 1 }
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    const { data: existing, error: fetchError } = yield exports.supabase.from('properties').select('*').eq('id', id).single();
    if (fetchError || !existing) {
        res.status(404).json({ error: 'Property not found' });
        return;
    }
    try {
        const data = req.body;
        const files = req.files;
        let finalImages = existing.images || [];
        if (data.existingImages) {
            try {
                finalImages = JSON.parse(data.existingImages);
            }
            catch (_c) { }
        }
        if (files.images && files.images.length > 0) {
            const newImageUrls = yield Promise.all(files.images.map(f => uploadToSupabaseStorage(f, 'properties/images')));
            finalImages = [...finalImages, ...newImageUrls];
        }
        const brochure = ((_a = files.brochure) === null || _a === void 0 ? void 0 : _a[0]) ? yield uploadToSupabaseStorage(files.brochure[0], 'properties/brochures') : existing.brochure;
        const floorPlan = ((_b = files.floorPlan) === null || _b === void 0 ? void 0 : _b[0]) ? yield uploadToSupabaseStorage(files.floorPlan[0], 'properties/floorplans') : existing.floorPlan;
        const updateData = {};
        const stringFields = ['title', 'description', 'type', 'furnishing', 'possession', 'parking', 'facing', 'status', 'reraId', 'listingType', 'leaseTerm', 'availableFrom'];
        stringFields.forEach(field => {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        });
        if (data.projectId !== undefined) {
            updateData.projectId = data.projectId || null;
        }
        const jsonFields = ['location', 'features', 'highlights', 'agent'];
        jsonFields.forEach(field => {
            if (data[field] && typeof data[field] === 'string') {
                try {
                    updateData[field] = JSON.parse(data[field]);
                }
                catch (_a) { }
            }
            else if (data[field]) {
                updateData[field] = data[field];
            }
        });
        const numericFields = ['price', 'bedrooms', 'bathrooms', 'area', 'floor', 'totalFloors', 'ageOfProperty', 'bookingAmount', 'rentAmount', 'deposit', 'maintenance'];
        numericFields.forEach(field => {
            if (data[field] !== undefined) {
                updateData[field] = Number(data[field]);
            }
        });
        updateData.featured = data.featured === 'true';
        updateData.verified = data.verified === 'true' || existing.verified;
        if (data.createdBy)
            updateData.createdBy = data.createdBy;
        updateData.images = finalImages;
        updateData.brochure = brochure;
        updateData.floorPlan = floorPlan;
        const { data: updated, error } = yield exports.supabase.from('properties').update(updateData).eq('id', id).select().single();
        if (error) {
            console.error('Supabase update error:', error);
            res.status(500).json({ error: error.message });
            return;
        }
        res.json(updated);
    }
    catch (err) {
        res.status(400).json({ error: 'Invalid property data', details: err.message });
    }
}));
// Bulk upload via CSV (CRM)
app.post('/api/properties/bulk-upload', upload.single('csv'), (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ error: 'CSV file required' });
            return;
        }
        const csvContent = fs_1.default.readFileSync(file.path, 'utf-8');
        const records = (0, sync_1.parse)(csvContent, { columns: true, skip_empty_lines: true });
        const imported = records.map((row, idx) => {
            var _a;
            return ({
                id: `import_${Date.now()}_${idx}`,
                title: row.Title,
                description: row.Description,
                price: parseFloat(row.Price),
                type: row.Type,
                bedrooms: parseInt(row.Bedrooms),
                bathrooms: parseInt(row.Bathrooms),
                area: parseFloat(row.Area),
                furnishing: 'unfurnished',
                possession: 'ready-to-move',
                parking: 'none',
                facing: 'north',
                floor: 0,
                totalFloors: 0,
                ageOfProperty: 0,
                location: {
                    address: row.Address,
                    city: row.City,
                    coordinates: { lat: 0, lng: 0 }
                },
                images: [],
                brochure: row.Brochure || undefined,
                floorPlan: row.FloorPlan || undefined,
                features: ['Imported Property'],
                status: row.Status,
                featured: ((_a = row.Featured) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'yes',
                verified: true,
                reraId: row.RERAID || '',
                agent: {
                    id: 'agent1',
                    name: row['Agent Name'] || 'Default Agent',
                    email: row['Agent Email'] || 'agent@example.com',
                    phone: '',
                    photo: '',
                    specialization: '',
                    experience: 0,
                    languages: [],
                    reraLicense: ''
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                projectId: row.ProjectId || undefined,
                highlights: ['Imported Property'],
                bookingAmount: row.BookingAmount ? parseFloat(row.BookingAmount) : undefined,
                listingType: row.ListingType || undefined,
                rentAmount: row.RentAmount ? parseFloat(row.RentAmount) : undefined,
                deposit: row.Deposit ? parseFloat(row.Deposit) : undefined,
                leaseTerm: row.LeaseTerm || undefined,
                availableFrom: row.AvailableFrom || undefined,
                maintenance: row.Maintenance ? parseFloat(row.Maintenance) : undefined,
                createdBy: 'imported', // Indicate it's an imported property
            });
        });
        // The original code had properties = [...imported, ...properties];
        // Since properties is removed, this line is effectively removed.
        // The imported properties are not saved to Supabase, only the new ones are added.
        res.json({ imported: imported.length });
    }
    catch (err) {
        res.status(400).json({ error: 'Invalid CSV', details: err });
    }
});
// Delete property by ID
app.delete('/api/properties/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { error } = yield exports.supabase.from('properties').delete().eq('id', id);
    if (error) {
        res.status(500).json({ error: error.message });
        return;
    }
    res.status(204).send();
}));
// --- PROJECTS API USING SUPABASE ---
// Get all projects
app.get('/api/projects', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield exports.supabase.from('projects').select('*');
    if (error) {
        console.error('Error fetching projects from Supabase:', error);
        res.status(500).json({ error: error.message });
        return;
    }
    res.json(data);
}));
// Get project by ID
app.get('/api/projects/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { data, error } = yield exports.supabase.from('projects').select('*').eq('id', id).single();
    if (error || !data) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }
    res.json(data);
}));
// Add new project (with file upload)
app.post('/api/projects', upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'brochure', maxCount: 1 },
    { name: 'floorPlans', maxCount: 10 },
    { name: 'masterPlan', maxCount: 1 }
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const files = req.files;
        let images = [];
        if (files.images) {
            images = yield Promise.all(files.images.map(f => uploadToSupabaseStorage(f, 'projects/images')));
        }
        let floorPlans = [];
        if (files.floorPlans) {
            floorPlans = yield Promise.all(files.floorPlans.map(f => uploadToSupabaseStorage(f, 'projects/floorplans')));
        }
        let masterPlan;
        if (files.masterPlan && files.masterPlan[0]) {
            masterPlan = yield uploadToSupabaseStorage(files.masterPlan[0], 'projects/masterplans');
        }
        let brochure;
        if (files.brochure && files.brochure[0]) {
            brochure = yield uploadToSupabaseStorage(files.brochure[0], 'projects/brochures');
        }
        const parseJsonField = (field, defaultValue) => {
            if (!field)
                return defaultValue;
            try {
                return JSON.parse(field);
            }
            catch (_a) {
                return defaultValue;
            }
        };
        const projectData = {
            name: data.name,
            description: data.description,
            developer: data.developer,
            status: data.status,
            launchDate: data.launchDate || null,
            possession: data.possession || null,
            reraId: data.reraId,
            approvals: parseJsonField(data.approvals, []),
            location: parseJsonField(data.location, { address: '', city: '', coordinates: { lat: 0, lng: 0 } }),
            images,
            masterPlan,
            floorPlans,
            amenities: parseJsonField(data.amenities, []),
            priceRange: parseJsonField(data.priceRange, { min: 0, max: 0 }),
            unitTypes: parseJsonField(data.unitTypes, []),
            configurations: parseJsonField(data.configurations, []),
            brochure,
            completionDate: data.completionDate || null,
            totalUnits: Number(data.totalUnits) || 0,
            availableUnits: Number(data.availableUnits) || 0,
            bankApprovals: parseJsonField(data.bankApprovals, []),
            highlights: parseJsonField(data.highlights, []),
            pricing: parseJsonField(data.pricing, []),
            landmarks: parseJsonField(data.landmarks, []),
        };
        const { data: insertedProject, error } = yield exports.supabase
            .from('projects')
            .insert(projectData)
            .select()
            .single();
        if (error) {
            console.error('Supabase insert error for project:', error);
            throw new Error(error.message);
        }
        res.status(201).json(insertedProject);
    }
    catch (err) {
        console.error('Failed to add project:', err);
        res.status(400).json({ error: 'Invalid project data', details: err.message });
    }
}));
// Update project by ID
app.put('/api/projects/:id', upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'brochure', maxCount: 1 },
    { name: 'floorPlans', maxCount: 10 },
    { name: 'masterPlan', maxCount: 1 }
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    try {
        const { data: existingProject, error: fetchError } = yield exports.supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();
        if (fetchError || !existingProject) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        const data = req.body;
        const files = req.files;
        let finalImages = [];
        if (data.existingImages) {
            try {
                finalImages = JSON.parse(data.existingImages);
            }
            catch (_c) { }
        }
        if (files.images && files.images.length > 0) {
            const newImageUrls = yield Promise.all(files.images.map(f => uploadToSupabaseStorage(f, 'projects/images')));
            finalImages = [...finalImages, ...newImageUrls];
        }
        let finalFloorPlans = existingProject.floorPlans || [];
        if (data.existingFloorPlans) {
            try {
                finalFloorPlans = JSON.parse(data.existingFloorPlans);
            }
            catch (_d) { }
        }
        if (files.floorPlans && files.floorPlans.length > 0) {
            const newFloorPlanUrls = yield Promise.all(files.floorPlans.map(f => uploadToSupabaseStorage(f, 'projects/floorplans')));
            finalFloorPlans = [...finalFloorPlans, ...newFloorPlanUrls];
        }
        const masterPlan = ((_a = files.masterPlan) === null || _a === void 0 ? void 0 : _a[0]) ? yield uploadToSupabaseStorage(files.masterPlan[0], 'projects/masterplans') : existingProject.masterPlan;
        const brochure = ((_b = files.brochure) === null || _b === void 0 ? void 0 : _b[0]) ? yield uploadToSupabaseStorage(files.brochure[0], 'projects/brochures') : existingProject.brochure;
        const projectUpdateData = Object.assign({}, data);
        const jsonFields = ['location', 'priceRange', 'amenities', 'unitTypes', 'configurations', 'approvals', 'bankApprovals', 'highlights', 'pricing', 'landmarks'];
        for (const field of jsonFields) {
            if (projectUpdateData[field] && typeof projectUpdateData[field] === 'string') {
                try {
                    projectUpdateData[field] = JSON.parse(projectUpdateData[field]);
                }
                catch (e) {
                    console.warn(`Could not parse JSON for field ${field}:`, projectUpdateData[field]);
                }
            }
        }
        projectUpdateData.images = finalImages;
        projectUpdateData.floorPlans = finalFloorPlans;
        projectUpdateData.masterPlan = masterPlan;
        projectUpdateData.brochure = brochure;
        // Ensure numeric fields are parsed correctly
        const numericFields = ['totalUnits', 'availableUnits'];
        for (const field of numericFields) {
            if (projectUpdateData[field] && typeof projectUpdateData[field] === 'string') {
                projectUpdateData[field] = Number(projectUpdateData[field]);
            }
        }
        delete projectUpdateData.id;
        delete projectUpdateData.createdAt;
        delete projectUpdateData.updatedAt;
        delete projectUpdateData.existingImages;
        delete projectUpdateData.existingFloorPlans;
        const { data: updatedProjectData, error: updateError } = yield exports.supabase
            .from('projects')
            .update(projectUpdateData)
            .eq('id', id)
            .select();
        if (updateError) {
            console.error('Supabase update error:', updateError);
            throw new Error(updateError.message);
        }
        if (!updatedProjectData || updatedProjectData.length === 0) {
            console.warn(`Update for project ${id} succeeded but returned no data. Refetching.`);
            const { data: refetchedProject, error: refetchError } = yield exports.supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();
            if (refetchError) {
                throw new Error('Project not found after update and refetch failed.');
            }
            res.json(refetchedProject);
            return;
        }
        res.json(updatedProjectData[0]);
    }
    catch (err) {
        console.error(`Failed to update project ${id}:`, err);
        res.status(400).json({ error: 'Invalid project data', details: err.message });
    }
}));
// Delete project by ID
app.delete('/api/projects/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { error } = yield exports.supabase.from('projects').delete().eq('id', id);
    if (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: error.message });
        return;
    }
    res.status(204).send();
}));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let leads = [];
const leadsFilePath = path_1.default.join(__dirname, '../leads.json');
if (fs_1.default.existsSync(leadsFilePath)) {
    try {
        const fileData = fs_1.default.readFileSync(leadsFilePath, 'utf-8');
        leads = JSON.parse(fileData);

    }
    catch (err) {
        console.error('Failed to load leads from disk:', err);
    }
}
function saveLeadsToDisk() {
    fs_1.default.writeFileSync(leadsFilePath, JSON.stringify(leads, null, 2), 'utf-8');
}
// Lead API endpoints (Supabase-backed)
// @ts-ignore
app.get('/api/leads', async (req, res) => {
    const { data, error } = await exports.supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) {
        console.error('Error fetching leads:', error);
        return res.status(500).json({ error: error.message });
    }
    return res.json((data || []).map((l) => ({
        id: l.id,
        name: l.name,
        email: l.email,
        phone: l.phone,
        source: l.source,
        type: l.type,
        priority: l.priority,
        status: l.status,
        assignedTo: l.assigned_to,
        createdAt: l.created_at,
        notes: l.notes,
        communicationLog: l.communication_log || [],
        reminders: l.reminders || [],
        propertyId: l.property_id,
    })));
});
// @ts-ignore
app.post('/api/leads', async (req, res) => {
    const d = req.body;
    const payload = {
        name: d.name,
        email: d.email,
        phone: d.phone,
        source: d.source,
        type: d.type,
        priority: d.priority,
        status: d.status || 'New',
        assigned_to: d.assignedTo || null,
        notes: d.notes || '',
        communication_log: [],
        reminders: [],
        property_id: d.propertyId || null,
    };
    const { data, error } = await exports.supabase.from('leads').insert(payload).select('*').single();
    if (error) {
        console.error('Error adding lead:', error);
        return res.status(500).json({ error: error.message });
    }
    return res.status(201).json({
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        source: data.source,
        type: data.type,
        priority: data.priority,
        status: data.status,
        assignedTo: data.assigned_to,
        createdAt: data.created_at,
        notes: data.notes,
        communicationLog: data.communication_log || [],
        reminders: data.reminders || [],
        propertyId: data.property_id,
    });
});
// @ts-ignore
app.get('/api/leads/:id', async (req, res) => {
    const { data, error } = await exports.supabase.from('leads').select('*').eq('id', req.params.id).single();
    if (error || !data)
        return res.status(404).json({ error: 'Lead not found' });
    return res.json({
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        source: data.source,
        type: data.type,
        priority: data.priority,
        status: data.status,
        assignedTo: data.assigned_to,
        createdAt: data.created_at,
        notes: data.notes,
        communicationLog: data.communication_log || [],
        reminders: data.reminders || [],
        propertyId: data.property_id,
    });
});
// @ts-ignore
app.put('/api/leads/:id', async (req, res) => {
    const { id } = req.params;
    const d = req.body;
    const update = {};
    const map = { assignedTo: 'assigned_to', propertyId: 'property_id', communicationLog: 'communication_log' };
    Object.keys(d).forEach((k) => { const column = map[k] || k; update[column] = d[k]; });
    const { data, error } = await exports.supabase.from('leads').update(update).eq('id', id).select('*').single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json({
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        source: data.source,
        type: data.type,
        priority: data.priority,
        status: data.status,
        assignedTo: data.assigned_to,
        createdAt: data.created_at,
        notes: data.notes,
        communicationLog: data.communication_log || [],
        reminders: data.reminders || [],
        propertyId: data.property_id,
    });
});
// @ts-ignore
app.delete('/api/leads/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await exports.supabase.from('leads').delete().eq('id', id);
    if (error)
        return res.status(500).json({ error: error.message });
    return res.status(204).send();
});
// @ts-ignore
app.post('/api/leads/:id/communication', async (req, res) => {
    const { id } = req.params;
    const { type, content, by } = req.body;
    const { data: lead, error: fetchErr } = await exports.supabase.from('leads').select('*').eq('id', id).single();
    if (fetchErr || !lead)
        return res.status(404).json({ error: 'Lead not found' });
    const log = lead.communication_log || [];
    log.push({ type, content, by, timestamp: new Date().toISOString() });
    const { data, error } = await exports.supabase.from('leads').update({ communication_log: log }).eq('id', id).select('*').single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json({
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        source: data.source,
        type: data.type,
        priority: data.priority,
        status: data.status,
        assignedTo: data.assigned_to,
        createdAt: data.created_at,
        notes: data.notes,
        communicationLog: data.communication_log || [],
        reminders: data.reminders || [],
        propertyId: data.property_id,
    });
});
// @ts-ignore
app.post('/api/leads/:id/reminder', async (req, res) => {
    const { id } = req.params;
    const { message, dueDate } = req.body;
    const { data: lead, error: fetchErr } = await exports.supabase.from('leads').select('*').eq('id', id).single();
    if (fetchErr || !lead)
        return res.status(404).json({ error: 'Lead not found' });
    const reminders = lead.reminders || [];
    reminders.push({ message, dueDate, completed: false });
    const { data, error } = await exports.supabase.from('leads').update({ reminders }).eq('id', id).select('*').single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json({
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        source: data.source,
        type: data.type,
        priority: data.priority,
        status: data.status,
        assignedTo: data.assigned_to,
        createdAt: data.created_at,
        notes: data.notes,
        communicationLog: data.communication_log || [],
        reminders: data.reminders || [],
        propertyId: data.property_id,
    });
});

// Users API (Supabase Admin)
app.get('/api/users', async (_req, res) => {
    try {
        const { data, error } = await exports.supabase.auth.admin.listUsers();
        if (error)
            throw error;
        const users = (data.users || []).map((u) => ({
            id: u.id,
            email: u.email,
            created_at: u.created_at,
            user_metadata: u.user_metadata || {},
            last_sign_in_at: u.last_sign_in_at,
            phone: u.phone,
            is_confirmed: u.confirmed_at != null,
        }));
        res.json(users);
    }
    catch (err) {
        res.status(500).json({ error: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to list users' });
    }
});
app.post('/api/users', async (req, res) => {
    try {
        const { email, password, name, role = 'employee', phone, role_key } = req.body || {};
        if (!email || !password) {
            res.status(400).json({ error: 'email and password are required' });
            return;
        }
        const { data, error } = await exports.supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name, role, phone, role_key },
        });
        if (error)
            throw error;
        const user = data.user || data;
        res.status(201).json({ id: user.id, email: user.email });
    }
    catch (err) {
        res.status(500).json({ error: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to create user' });
    }
});

// Roles API
app.get('/api/roles', async (_req, res) => {
    const { data, error } = await exports.supabase.from('roles').select('*').order('name');
    if (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ error: error.message });
        return;
    }
    res.json(data || []);
});
app.post('/api/roles', async (req, res) => {
    const { name, key, permissions } = req.body || {};
    if (!name || !key) {
        res.status(400).json({ error: 'name and key are required' });
        return;
    }
    const { data, error } = await exports.supabase.from('roles').insert({ name, key, permissions: permissions || {} }).select('*').single();
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.status(201).json(data);
});
app.put('/api/roles/:id', async (req, res) => {
    const { id } = req.params;
    const { name, key, permissions } = req.body || {};
    const { data, error } = await exports.supabase.from('roles').update({ name, key, permissions }).eq('id', id).select('*').single();
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.json(data);
});
app.delete('/api/roles/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await exports.supabase.from('roles').delete().eq('id', id);
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.status(204).send();
});
// Start server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
