// ============================================
// METAINJECTOR PRO — Professional SVG Metadata Studio
// Features: Single + Batch upload, AI + Rule hybrid, ZIP export, Neon theme
// ============================================

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent';

const PLATFORM_RULES = {
    shutterstock: { maxTitle: 200, maxDesc: 200, maxKeywords: 50 },
    adobe: { maxTitle: 70, maxDesc: 200, maxKeywords: 50 },
    freepik: { maxTitle: 100, maxDesc: 300, maxKeywords: 40 },
    getty: { maxTitle: 80, maxDesc: 250, maxKeywords: 80 },
    dreamstime: { maxTitle: 200, maxDesc: 200, maxKeywords: 50 },
    alamy: { maxTitle: 150, maxDesc: 200, maxKeywords: 50 },
    vecteezy: { maxTitle: 100, maxDesc: 250, maxKeywords: 30 },
    generic: { maxTitle: 200, maxDesc: 300, maxKeywords: 50 }
};

const KEYWORD_DB = {
    vector: {
        core: ['vector','illustration','graphic design','digital art','clipart','editable','scalable','svg'],
        styles: ['flat design','minimalist','clean','modern','simple','elegant','stylish','trendy'],
        technical: ['eps','ai','svg','vector file','layered','isolated','transparent background','high resolution'],
        uses: ['print','web design','marketing','advertising','branding','presentation','social media']
    },
    icon: {
        core: ['icon','symbol','sign','pictogram','glyph','ui element','interface','svg icon'],
        styles: ['minimalist','flat','line art','outline','filled','solid','monochrome','colorful'],
        technical: ['pixel perfect','scalable','responsive','retina ready','vector icon'],
        uses: ['app','website','dashboard','mobile','software','user interface','navigation']
    },
    logo: {
        core: ['logo','logotype','brand identity','branding','corporate','business','company','svg logo'],
        styles: ['professional','minimalist','modern','luxury','premium','elegant','creative'],
        technical: ['vector','scalable','editable','customizable','print ready','web ready'],
        uses: ['startup','enterprise','small business','freelance','agency','portfolio']
    },
    pattern: {
        core: ['seamless pattern','repeatable','tileable','background','wallpaper','texture','surface pattern'],
        styles: ['decorative','ornamental','stylish','modern','classic','elegant','trendy'],
        technical: ['seamless','repeating','high resolution','print ready','digital paper'],
        uses: ['fabric','textile','wrapping paper','scrapbooking','interior design','fashion']
    },
    infographic: {
        core: ['infographic','chart','diagram','data visualization','information graphic','stats'],
        styles: ['modern','clean','professional','corporate','creative','engaging'],
        technical: ['editable','customizable','vector','data driven','presentation ready'],
        uses: ['business','education','marketing','report','presentation','social media']
    },
    social: {
        core: ['social media','template','post','story','banner','cover','header','feed'],
        styles: ['trendy','engaging','viral','aesthetic','modern','stylish','eye catching'],
        technical: ['optimized','ready to use','customizable','editable','layered'],
        uses: ['instagram','facebook','twitter','linkedin','pinterest','tiktok','youtube']
    },
    floral: {
        core: ['floral','flower','botanical','nature','plant','garden','bloom','blossom'],
        styles: ['elegant','romantic','vintage','modern','tropical','wild','delicate'],
        technical: ['detailed','high resolution','isolated','transparent','vector','watercolor'],
        uses: ['wedding','spring','summer','decor','fashion','beauty','organic product']
    },
    geometric: {
        core: ['geometric','abstract','shape','pattern','polygon','minimal','modern art'],
        styles: ['minimalist','contemporary','futuristic','clean','bold','symmetrical','asymmetrical'],
        technical: ['vector','precise','mathematical','grid','golden ratio','scalable'],
        uses: ['background','wallpaper','branding','tech','science','architecture','design']
    },
    business: {
        core: ['business','corporate','professional','office','workplace','career','success'],
        styles: ['modern','clean','minimalist','luxury','trustworthy','confident'],
        technical: ['high resolution','professional','studio','sharp','clean background'],
        uses: ['presentation','website','brochure','annual report','linkedin','marketing']
    },
    holiday: {
        core: ['holiday','seasonal','celebration','festival','christmas','halloween','easter','valentine'],
        styles: ['festive','cheerful','colorful','sparkling','cozy','traditional','modern'],
        technical: ['high resolution','decorated','ornamented','detailed','vibrant colors'],
        uses: ['greeting card','invitation','social media','marketing','decoration','gift wrap']
    },
    watercolor: {
        core: ['watercolor','hand painted','hand drawn','artistic','painting','illustration','fine art'],
        styles: ['organic','natural','soft','delicate','expressive','whimsical','romantic'],
        technical: ['high resolution','scanned','original art','texture','paper texture'],
        uses: ['wedding','invitation','greeting card','scrapbooking','wall art','stationery']
    },
    mockup: {
        core: ['mockup','template','presentation','showcase','display','scene','realistic'],
        styles: ['professional','photorealistic','clean','minimalist','modern','stylish'],
        technical: ['smart object','editable','customizable','high resolution','layered'],
        uses: ['branding','packaging','apparel','device','stationery','product design']
    }
};

// State
let currentMode = 'ai';
let currentPlatform = 'shutterstock';
let currentTab = 'single';
let uploadedFiles = [];
let processedResults = [];
let activeFileIndex = 0;
let apiKey = localStorage.getItem('gemini_api_key') || '';

// DOM
const dropZone = document.getElementById('dropZone');
const fileInputSingle = document.getElementById('fileInputSingle');
const fileInputBatch = document.getElementById('fileInputBatch');
const fileGrid = document.getElementById('fileGrid');
const progressWrap = document.getElementById('progressWrap');
const progressFill = document.getElementById('progressFill');
const editorPanel = document.getElementById('editorPanel');
const resultsPanel = document.getElementById('resultsPanel');
const apiKeyInput = document.getElementById('apiKey');
const apiBox = document.getElementById('apiBox');
const ruleBox = document.getElementById('ruleBox');
const titleInput = document.getElementById('titleInput');
const descInput = document.getElementById('descInput');
const keywordsInput = document.getElementById('keywordsInput');
const extraKeywords = document.getElementById('extraKeywords');
const titleCount = document.getElementById('titleCount');
const descCount = document.getElementById('descCount');
const keywordCount = document.getElementById('keywordCount');
const metaPreview = document.getElementById('metaPreview');
const categorySelect = document.getElementById('categorySelect');
const defaultCategory = document.getElementById('defaultCategory');
const downloadZipBtn = document.getElementById('downloadZipBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Init API key
if (apiKey) apiKeyInput.value = apiKey;
apiKeyInput.addEventListener('input', (e) => {
    apiKey = e.target.value.trim();
    localStorage.setItem('gemini_api_key', apiKey);
});

// Mode toggle
document.querySelectorAll('.upload-tab[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.upload-tab[data-mode]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
        if (currentMode === 'ai') { apiBox.classList.remove('hidden'); ruleBox.classList.add('hidden'); }
        else { apiBox.classList.add('hidden'); ruleBox.classList.remove('hidden'); }
    });
});

// Tab toggle (single vs batch)
document.querySelectorAll('.upload-tab[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.upload-tab[data-tab]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTab = btn.dataset.tab;
        // Reset
        uploadedFiles = [];
        processedResults = [];
        fileGrid.classList.add('hidden');
        editorPanel.classList.add('hidden');
        resultsPanel.classList.add('hidden');
        progressWrap.classList.add('hidden');
        dropZone.querySelector('.dz-title').textContent = currentTab === 'single' 
            ? 'Drop SVG file here or click to browse' 
            : 'Drop multiple SVG files here or click to browse';
    });
});

// Platform chips
document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentPlatform = chip.dataset.platform;
    });
});

// Drop zone
dropZone.addEventListener('click', () => {
    if (currentTab === 'single') fileInputSingle.click();
    else fileInputBatch.click();
});
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (currentTab === 'single' && files.length) handleFiles([files[0]]);
    else if (currentTab === 'batch') handleFiles(Array.from(files));
});
fileInputSingle.addEventListener('change', (e) => { if (e.target.files.length) handleFiles([e.target.files[0]]); });
fileInputBatch.addEventListener('change', (e) => { if (e.target.files.length) handleFiles(Array.from(e.target.files)); });

// Character counters
function updateCounts() {
    const rules = PLATFORM_RULES[currentPlatform] || PLATFORM_RULES.generic;
    const tLen = titleInput.value.length;
    const dLen = descInput.value.length;
    const kCount = keywordsInput.value.split(',').filter(k => k.trim()).length;

    titleCount.textContent = tLen + '/' + rules.maxTitle;
    titleCount.className = 'char-count' + (tLen > rules.maxTitle ? ' danger' : tLen > rules.maxTitle * 0.9 ? ' warn' : '');

    descCount.textContent = dLen + '/' + rules.maxDesc;
    descCount.className = 'char-count' + (dLen > rules.maxDesc ? ' danger' : dLen > rules.maxDesc * 0.9 ? ' warn' : '');

    keywordCount.textContent = kCount + '/' + rules.maxKeywords;
    keywordCount.className = 'char-count' + (kCount > rules.maxKeywords ? ' danger' : kCount > rules.maxKeywords * 0.9 ? ' warn' : '');
}

titleInput.addEventListener('input', () => { updateCounts(); updatePreview(); });
descInput.addEventListener('input', () => { updateCounts(); updatePreview(); });
keywordsInput.addEventListener('input', () => { updateCounts(); updatePreview(); });
extraKeywords.addEventListener('input', () => { if (currentFileIndex >= 0) regenerateForIndex(activeFileIndex); });
categorySelect.addEventListener('change', () => { if (currentFileIndex >= 0) regenerateForIndex(activeFileIndex); });

async function handleFiles(files) {
    const valid = files.filter(f => f.name.toLowerCase().endsWith('.svg'));
    if (!valid.length) { showToast('Please upload SVG files only', 'err'); return; }

    uploadedFiles = valid;
    processedResults = new Array(valid.length);
    activeFileIndex = 0;

    renderFileGrid();
    fileGrid.classList.remove('hidden');
    progressWrap.classList.remove('hidden');
    editorPanel.classList.remove('hidden');

    if (currentTab === 'batch') {
        downloadZipBtn.classList.remove('hidden');
        downloadBtn.textContent = 'Download This File';
    } else {
        downloadZipBtn.classList.add('hidden');
        downloadBtn.textContent = 'Download with Metadata';
    }

    // Process all files
    for (let i = 0; i < valid.length; i++) {
        activeFileIndex = i;
        const progress = ((i + 1) / valid.length) * 100;
        progressFill.style.width = progress + '%';

        const statusEl = document.getElementById('status-' + i);
        statusEl.textContent = 'Processing...';
        statusEl.className = 'status status-pending pulse';

        try {
            let meta = await processFile(valid[i], i);
            processedResults[i] = { ...meta, originalFile: valid[i], index: i, svgText: await valid[i].text() };
            statusEl.className = 'status status-done';
            statusEl.textContent = meta.source === 'AI' ? 'AI' : 'Rule';
        } catch (e) {
            statusEl.className = 'status status-error';
            statusEl.textContent = 'Error';
            console.error(e);
        }
    }

    progressWrap.classList.add('hidden');

    // Show first file in editor
    activeFileIndex = 0;
    loadEditor(0);

    if (currentTab === 'batch') {
        showToast('Batch complete! ' + valid.length + ' files processed', 'ok');
    }
}

function renderFileGrid() {
    fileGrid.innerHTML = uploadedFiles.map((file, i) => {
        return '<div class="file-card" data-index="' + i + '" onclick="selectFile(' + i + ')">' +
            '<div class="status status-pending" id="status-' + i + '">Pending</div>' +
            '<div class="thumb" id="thumb-' + i + '"><span style="color:var(--text-muted);font-size:2rem;">?</span></div>' +
            '<div class="name">' + file.name + '</div>' +
            '<div class="meta">' + (file.size / 1024).toFixed(1) + ' KB</div>' +
            '</div>';
    }).join('');

    // Load thumbnails
    uploadedFiles.forEach((file, i) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const thumb = document.getElementById('thumb-' + i);
            if (thumb) thumb.innerHTML = e.target.result;
        };
        reader.readAsText(file);
    });
}

// Select file for editing
window.selectFile = function(index) {
    activeFileIndex = index;
    loadEditor(index);

    // Highlight selected card
    document.querySelectorAll('.file-card').forEach((card, i) => {
        card.style.border = i === index ? '1px solid var(--accent-cyan)' : '1px solid var(--border)';
        card.style.boxShadow = i === index ? '0 0 20px rgba(0,240,255,0.1)' : 'none';
    });
};

function loadEditor(index) {
    const result = processedResults[index];
    if (!result) return;

    titleInput.value = result.title;
    descInput.value = result.description;
    keywordsInput.value = result.keywords.join(', ');
    categorySelect.value = result.category;

    updateCounts();
    updatePreview();
}

async function processFile(file, index) {
    if (currentMode === 'ai' && apiKey) {
        try {
            return await generateWithAI(file);
        } catch (err) {
            console.log('AI failed for ' + file.name + ', using rules');
            return generateWithRules(file);
        }
    }
    return generateWithRules(file);
}

async function regenerateForIndex(index) {
    const file = uploadedFiles[index];
    const meta = generateWithRules(file);
    processedResults[index] = { ...meta, originalFile: file, index: index, svgText: await file.text() };
    loadEditor(index);
}

document.getElementById('regenBtn').addEventListener('click', () => {
    regenerateForIndex(activeFileIndex);
});

// AI Generation
async function generateWithAI(file) {
    if (!apiKey) throw new Error('No API key');

    const base64 = await fileToBase64(file);
    const rules = PLATFORM_RULES[currentPlatform] || PLATFORM_RULES.generic;

    const prompt = 'You are an expert SEO metadata writer for stock photography/vector contributor platforms.\n\nAnalyze this SVG image and generate SEO-optimized metadata. The metadata must be:\n- 100% original (describing only what is in THIS image)\n- Human-like, natural language\n- Optimized for stock platform search algorithms\n- No trademarked names, no copyrighted characters, no brand names\n\nRespond ONLY in this exact JSON format (no markdown, no explanation, just raw JSON):\n{"title":"SEO title under ' + rules.maxTitle + ' chars","description":"Compelling description under ' + rules.maxDesc + ' chars","keywords":["keyword1","keyword2",...up to ' + rules.maxKeywords + ']}\n\nRules:\n- Title: catchy, includes main subject + style + use case\n- Description: 2-3 sentences about what it is, style, colors, uses\n- Keywords: array of single words or short phrases, most important first';

    const response = await fetch(GEMINI_URL + '?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [
                    { text: prompt },
                    { inline_data: { mime_type: 'image/svg+xml', data: base64.split(',')[1] } }
                ]
            }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
        })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || 'HTTP ' + response.status);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let parsed;
    try {
        const match = text.match(/\{[\s\S]*\}/);
        if (!match) throw new Error('No JSON found');
        parsed = JSON.parse(match[0]);
    } catch {
        throw new Error('Invalid AI response');
    }

    return {
        title: parsed.title || '',
        description: parsed.description || '',
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        category: detectCategory(file.name),
        source: 'AI'
    };
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Rule-based generation
function generateWithRules(file) {
    const category = defaultCategory.value === 'auto' ? detectCategory(file.name) : defaultCategory.value;
    const db = KEYWORD_DB[category] || KEYWORD_DB.vector;
    const rules = PLATFORM_RULES[currentPlatform] || PLATFORM_RULES.generic;
    const parsed = parseFilename(file.name);
    const extras = extraKeywords.value ? extraKeywords.value.split(',').map(k => k.trim()).filter(k => k) : [];

    let title = parsed.baseWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    if (!title) title = category.charAt(0).toUpperCase() + category.slice(1) + ' Design';
    if (!title.toLowerCase().includes('vector')) title += ' Vector';
    if (!title.toLowerCase().includes('svg')) title += ' SVG';
    if (!title.toLowerCase().includes('illustration')) title += ' Illustration';

    if (extras.length && title.length < rules.maxTitle - 20) {
        title += ' ' + extras[0].charAt(0).toUpperCase() + extras[0].slice(1);
    }
    title = title.length > rules.maxTitle ? title.substring(0, rules.maxTitle - 3) + '...' : title;

    let desc = 'Professional ' + category + ' vector design in SVG format. High-quality scalable illustration perfect for ' + db.uses.slice(0, 3).join(', ') + ', and more. Fully editable and customizable. Compatible with Adobe Illustrator, Inkscape, Figma, and all vector editors. Ready for stock contributor platforms.';
    desc = desc.length > rules.maxDesc ? desc.substring(0, rules.maxDesc - 3) + '...' : desc;

    let keywords = new Set();
    parsed.baseWords.forEach(w => keywords.add(w));
    db.core.forEach(k => keywords.add(k));
    db.styles.slice(0, 5).forEach(k => keywords.add(k));
    db.technical.slice(0, 4).forEach(k => keywords.add(k));
    db.uses.slice(0, 4).forEach(k => keywords.add(k));
    keywords.add('svg');
    keywords.add('vector');
    keywords.add('stock');
    keywords.add('royalty free');
    extras.forEach(k => keywords.add(k.toLowerCase()));

    let result = Array.from(keywords)
        .map(k => k.replace(/[^a-z0-9\s]/g, '').trim())
        .filter(k => k.length > 2 && k.length < 30)
        .filter((v, i, a) => a.indexOf(v) === i);

    const filenameWords = parsed.baseWords;
    result.sort((a, b) => {
        const aInFile = filenameWords.includes(a) ? 2 : 0;
        const bInFile = filenameWords.includes(b) ? 2 : 0;
        return bInFile - aInFile;
    });

    return {
        title: title,
        description: desc,
        keywords: result.slice(0, rules.maxKeywords),
        category: category,
        source: 'Rule'
    };
}

function detectCategory(filename) {
    const lower = filename.toLowerCase().replace(/\.svg$/i, '');
    const keywords = {
        icon: ['icon','icons','ui','glyph','pictogram'],
        logo: ['logo','logotype','brand','badge','emblem'],
        pattern: ['pattern','seamless','tile','wallpaper'],
        infographic: ['infographic','chart','graph','diagram'],
        social: ['social','instagram','post','banner','story'],
        floral: ['floral','flower','botanical','bloom'],
        geometric: ['geometric','polygon','abstract','shape'],
        business: ['business','corporate','office','meeting'],
        holiday: ['christmas','halloween','easter','valentine','holiday'],
        watercolor: ['watercolor','watercolour','aquarelle'],
        mockup: ['mockup','mock','template','scene'],
        vector: ['vector','illustration','clipart']
    };
    for (const cat in keywords) {
        if (keywords[cat].some(w => lower.includes(w))) return cat;
    }
    return 'vector';
}

function parseFilename(filename) {
    const name = filename.replace(/\.[^/.]+$/, '');
    const parts = name.split(/[-_\s]+/).filter(w => w.length > 2);
    return { baseWords: parts.map(w => w.toLowerCase()), cleanName: name };
}

// Metadata injection
function buildMetadataBlock(meta) {
    const date = new Date().toISOString().split('T')[0];
    const keywordsXml = meta.keywords.map(k => '        <rdf:li>' + escapeXml(k) + '</rdf:li>').join('\n');

    return '<!-- SVG Metadata by MetaInjector Pro -->\n<!-- Compatible with: Adobe Stock, Shutterstock, Freepik, Getty, Dreamstime, Alamy, Vecteezy -->\n<metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">\n  <rdf:RDF>\n    <rdf:Description rdf:about="">\n      <dc:title>' + escapeXml(meta.title) + '</dc:title>\n      <dc:description>' + escapeXml(meta.description) + '</dc:description>\n      <dc:subject>\n        <rdf:Bag>\n' + keywordsXml + '\n        </rdf:Bag>\n      </dc:subject>\n      <dc:creator>Stock Contributor</dc:creator>\n      <dc:rights>Copyright (c) ' + new Date().getFullYear() + '. All rights reserved.</dc:rights>\n      <dc:date>' + date + '</dc:date>\n      <dc:format>image/svg+xml</dc:format>\n      <dc:type>Still Image</dc:type>\n    </rdf:Description>\n  </rdf:RDF>\n</metadata>';
}

function escapeXml(str) {
    return String(str).replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/"/g, '&quot;')
                      .replace(/'/g, '&apos;');
}

function injectMetadata(svgText, meta) {
    svgText = svgText.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');

    const match = svgText.match(/(<svg\b[^>]*?>)/i);
    if (!match) throw new Error('Could not find valid <svg> opening tag');

    const svgTag = match[0];
    const insertPos = match.index + svgTag.length;

    const metaBlock = buildMetadataBlock(meta);

    const before = svgText.substring(0, insertPos);
    const after = svgText.substring(insertPos);

    let newSvg = before + '\n' + metaBlock + '\n' + after;

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(newSvg, 'image/svg+xml');
        const parseError = doc.querySelector('parsererror');
        if (parseError) throw new Error('XML validation failed');
        const metadata = doc.querySelector('metadata');
        if (!metadata) throw new Error('Metadata injection verification failed');
    } catch (e) {
        throw new Error('SVG validation failed: ' + e.message);
    }

    return newSvg;
}

function updatePreview() {
    if (!processedResults[activeFileIndex]) return;

    const meta = {
        title: titleInput.value,
        description: descInput.value,
        keywords: keywordsInput.value.split(',').map(k => k.trim()).filter(k => k),
        category: categorySelect.value
    };

    const block = buildMetadataBlock(meta);
    metaPreview.innerHTML = escapeHtml(block)
        .replace(/&lt;(\/?)(dc:\w+|rdf:\w+|metadata)&gt;/g, '<span class="tag">&lt;$1$2&gt;</span>')
        .replace(/&lt;!--[\s\S]*?--&gt;/g, '<span class="comment">$&</span>');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Download single file
downloadBtn.addEventListener('click', () => {
    const result = processedResults[activeFileIndex];
    if (!result) { showToast('No file to download', 'err'); return; }

    const meta = {
        title: titleInput.value,
        description: descInput.value,
        keywords: keywordsInput.value.split(',').map(k => k.trim()).filter(k => k),
        category: categorySelect.value
    };

    try {
        const newSvg = injectMetadata(result.svgText, meta);
        downloadSvg(newSvg, result.originalFile.name.replace('.svg', '_meta.svg'));
        showToast('Downloaded: ' + result.originalFile.name.replace('.svg', '_meta.svg'), 'ok');
        renderResults();
    } catch (e) {
        showToast('Injection failed: ' + e.message, 'err');
    }
});

// Download all as ZIP
downloadZipBtn.addEventListener('click', async () => {
    const valid = processedResults.filter(r => r && r.svgText);
    if (!valid.length) { showToast('No files to download', 'err'); return; }

    showToast('Creating ZIP...', 'info');

    try {
        const zip = await createZip(valid);
        const blob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(blob, 'metainjector_batch.zip');
        showToast('ZIP downloaded: ' + valid.length + ' files', 'ok');
    } catch (e) {
        showToast('ZIP failed: ' + e.message, 'err');
    }
});

async function createZip(results) {
    // Simple ZIP implementation without external library
    const zip = new JSZip ? new JSZip() : await loadJSZip();

    for (const result of results) {
        const meta = {
            title: result.title,
            description: result.description,
            keywords: result.keywords,
            category: result.category
        };

        try {
            const newSvg = injectMetadata(result.svgText, meta);
            zip.file(result.originalFile.name.replace('.svg', '_meta.svg'), newSvg);
        } catch (e) {
            console.error('Failed to inject ' + result.originalFile.name, e);
        }
    }

    // Add CSV summary
    const csv = ['Filename,Title,Description,Keywords,Category,Source'];
    results.forEach(r => {
        csv.push('"' + r.originalFile.name + '","' + r.title.replace(/"/g, '""') + '","' + r.description.replace(/"/g, '""') + '","' + r.keywords.join(', ') + '","' + r.category + '","' + r.source + '"');
    });
    zip.file('metadata_summary.csv', csv.join('\n'));

    return zip;
}

function loadJSZip() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.onload = () => resolve(window.JSZip);
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function downloadSvg(svgText, filename) {
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    downloadBlob(blob, filename);
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function renderResults() {
    resultsPanel.classList.remove('hidden');

    const valid = processedResults.filter(r => r);
    const aiCount = valid.filter(r => r.source === 'AI').length;
    const ruleCount = valid.filter(r => r.source === 'Rule').length;

    document.getElementById('statsBar').innerHTML = 
        '<div class="stat-box"><div class="number">' + valid.length + '</div><div class="label">Files</div></div>' +
        '<div class="stat-box"><div class="number">' + aiCount + '</div><div class="label">AI Generated</div></div>' +
        '<div class="stat-box"><div class="number">' + ruleCount + '</div><div class="label">Rule Generated</div></div>' +
        '<div class="stat-box"><div class="number">' + currentPlatform + '</div><div class="label">Platform</div></div>';

    document.getElementById('resultsGrid').innerHTML = valid.map((r, i) => {
        return '<div class="result-card fade-in">' +
            '<div class="card-header">' +
            '<div class="thumb">' + r.svgText.substring(0, 500) + '...</div>' +
            '<div class="info">' +
            '<div class="name">' + r.originalFile.name + '</div>' +
            '<div class="source">' + (r.source === 'AI' ? '&#129302; AI Generated' : '&#9881; Rule Based') + '</div>' +
            '</div></div>' +
            '<div class="field"><div class="field-label">Title</div><div class="field-value">' + escapeHtml(r.title) + '</div></div>' +
            '<div class="field"><div class="field-label">Description</div><div class="field-value">' + escapeHtml(r.description) + '</div></div>' +
            '<div class="field"><div class="field-label">Keywords (' + r.keywords.length + ')</div><div class="keywords">' + r.keywords.map(k => '<span class="keyword-tag">' + escapeHtml(k) + '</span>').join('') + '</div></div>' +
            '</div>';
    }).join('');
}

function showToast(msg, type) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    const classes = { ok: 'toast-ok', err: 'toast-err', warn: 'toast-warn', info: 'toast-info' };
    toast.className = 'toast ' + (classes[type] || classes.ok) + ' show';
    setTimeout(() => toast.classList.remove('show'), 3000);
}
