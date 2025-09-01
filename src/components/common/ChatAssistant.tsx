import React, { useEffect, useRef, useState } from 'react';
import { FaRobot, FaTimes } from 'react-icons/fa';
import { PropertySearchFilters, aiChat, AiMessage } from '../../api';

interface ChatMessage {
  id: string;
  from: 'bot' | 'user';
  text: string;
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [filters, setFilters] = useState<PropertySearchFilters>({});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [propertyResults, setPropertyResults] = useState<any[]>([]);
  const [projectResults, setProjectResults] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  // removed showCallButton in favor of unconditional call button after results

  // Guided flow state
  const [domain, setDomain] = useState<null | 'property' | 'project'>(null);
  const [mode, setMode] = useState<null | 'sale' | 'rent'>(null); // for property only
  const [_city, setCity] = useState<string>('');
  const [expectSearch, setExpectSearch] = useState(false);
  const [lastSearch, setLastSearch] = useState<{ expected: boolean } | null>(null);
  const officeAddress = 'Floor No. -2, Tower No. B-1, Office No. 0302, Blue Ridge, MIDC Phase 2 Main Road, Hinjewadi, Pune, Maharashtra, 411057';
  const officeMapsUrl = 'https://maps.app.goo.gl/Rjpzv3UUDYP3uirZ6';

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, propertyResults, projectResults]);

  useEffect(() => {
    if (!isOpen) return;
    if (messages.length === 0) {
      setMessages([{ id: 'm1', from: 'bot', text: "Hi! I'm Lotlite Assistant. Let's find the right option. Are you looking for apartments to buy or rent, or browsing projects?" }]);
    }
  }, [isOpen]);

  function pushBot(text: string) {
    setMessages(m => [...m, { id: Math.random().toString(36).slice(2), from: 'bot', text }]);
  }
  function pushUser(text: string) {
    setMessages(m => [...m, { id: Math.random().toString(36).slice(2), from: 'user', text }]);
  }

  async function sendAi(prompt: string, opts?: { expectSearch?: boolean }) {
    pushUser(prompt);
    try {
      const willSearch = Boolean(opts?.expectSearch);
      setExpectSearch(willSearch);
      setLoading(Boolean(willSearch));
      setIsTyping(true);
      const history = messages
        .filter(m => m.from === 'user' || m.from === 'bot')
        .map(m => `${m.from === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
        .join('\n');
      const aiMessages: AiMessage[] = [
        { role: 'user', content: `${history}\nUser: ${prompt}` }
      ];
      const response = await aiChat(aiMessages);
      const filtersFromAi: PropertySearchFilters = response.filters || {};
      setFilters(prev => ({ ...prev, ...filtersFromAi }));
      setIsTyping(false);
      if (willSearch) {
        setLoading(true);
      }
      setPropertyResults(response.propertyResults || []);
      setProjectResults(response.projectResults || []);
      setLastSearch({ expected: willSearch });
      if (response.reply) pushBot(response.reply);
    } catch (err: any) {
      const msg = (err && err.message) ? String(err.message) : 'Sorry, I had trouble understanding. Please rephrase your request.';
      pushBot(msg);
    } finally {
      setLoading(false);
      setIsTyping(false);
      setExpectSearch(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');
    await sendAi(text);
  }

  // Guided chip handlers
  function chooseDomain(d: 'property' | 'project') {
    setDomain(d);
    setPropertyResults([]); setProjectResults([]);
    if (d === 'property') {
      pushUser('Apartments');
      pushBot('Great! Are you looking to buy or rent apartments?');
    } else {
      pushUser('Browse Projects');
      pushBot('Which city/area are you interested in for projects?');
    }
  }

  function chooseMode(m: 'sale' | 'rent') {
    setMode(m);
    setPropertyResults([]);
    pushUser(m === 'sale' ? 'Buy apartments' : 'Rent apartments');
    pushBot('Which city/area are you interested in?');
  }

  async function chooseCity(c: string) {
    setCity(c);
    const isProject = domain === 'project';
    const prompt = isProject ? `Browse projects in ${c}` : `${mode === 'rent' ? 'Rent' : 'Buy'} apartment in ${c}`;
    await sendAi(prompt, { expectSearch: true });
  }

  // Refinement helpers
  async function refineBhk(n: number) {
    const c = _city || 'Pune';
    const intent = domain === 'project' ? `Browse projects in ${c}` : `${mode === 'rent' ? 'Rent' : 'Buy'} ${n} BHK apartment in ${c}`;
    await sendAi(intent, { expectSearch: true });
  }
  async function refineBudget(range: string) {
    const c = _city || 'Pune';
    const intent = domain === 'project' ? `Projects in ${c} with budget ${range}` : `${mode === 'rent' ? 'Rent' : 'Buy'} apartment in ${c} with budget ${range}`;
    await sendAi(intent, { expectSearch: true });
  }
  async function toggleListing(next: 'sale' | 'rent') {
    const c = _city || 'Pune';
    const intent = `${next === 'rent' ? 'Rent' : 'Buy'} apartment in ${c}`;
    setMode(next);
    await sendAi(intent, { expectSearch: true });
  }

  const hasAnyFilter = Boolean(
    (filters.type && String(filters.type).trim()) ||
    (filters.city && String(filters.city).trim()) ||
    typeof filters.minPrice === 'number' ||
    typeof filters.maxPrice === 'number' ||
    (filters.query && String(filters.query).trim())
  );

  const showQuickChips = messages.length <= 2 && !hasAnyFilter && !loading;

  function Card({ item, type }: { item: any; type: 'property' | 'project' }) {
    const title = type === 'property' ? item.title : item.name;
    const city = item?.location?.city || '';
    const img = (item?.images && item.images[0]) || '';
    const price = type === 'property' ? (item.listingType === 'rent' ? item.rentAmount : item.price) : (item?.priceRange?.min || 0);
    const link = type === 'property' ? `/properties/${item.id}` : `/projects/${item.id}`;
    return (
      <a href={link} className="min-w-[220px] max-w-[220px] bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow flex-shrink-0">
        <div className="h-28 bg-gray-100 overflow-hidden">
          {img ? <img src={img} alt={title} className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
        </div>
        <div className="p-3">
          <div className="text-sm font-semibold line-clamp-2">{title}</div>
          <div className="text-xs text-gray-500 mt-1 line-clamp-1">{city}</div>
          {price ? <div className="text-xs font-medium text-primary mt-1">₹ {Number(price).toLocaleString('en-IN')}</div> : null}
        </div>
      </a>
    );
  }

  return (
    <div className="fixed bottom-28 right-6 sm:bottom-32 sm:right-8 z-[1000] flex flex-col items-end gap-3">
      {isOpen && (
        <div className="md:w-[360px] md:sm:w-[380px] w-full h-full md:h-auto md:rounded-2xl shadow-2xl border border-gray-200 overflow-hidden bg-white fixed inset-0 md:relative md:inset-auto z-[1001]">
          <div className="flex items-center justify-between px-3 py-2 bg-[#0d47a1] text-white">
            <div className="flex items-center gap-2">
              <FaRobot className="w-5 h-5" />
              <div className="leading-tight">
                <p className="text-sm font-semibold">Lotlite Assistant</p>
                <p className="text-[10px] text-white/90">Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-white/10" aria-label="Close chat">
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
          <div ref={scrollRef} className="md:max-h-[60vh] h-full md:h-auto overflow-y-auto p-3 space-y-2 bg-gray-50 pb-20 md:pb-3">
            {messages.map(m => (
              <div key={m.id} className={m.from === 'bot' ? 'text-left' : 'text-right'}>
                <span className={m.from === 'bot' ? 'inline-block bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm' : 'inline-block bg-[#0d47a1] text-white rounded-xl px-3 py-2 text-sm'}>
                  {m.text}
                </span>
              </div>
            ))}

            {showQuickChips && (
              <div className="mt-1 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => chooseDomain('property')} className="px-3 py-2 text-sm rounded-full border bg-white hover:bg-gray-100">Apartments</button>
                  <button onClick={() => chooseDomain('project')} className="px-3 py-2 text-sm rounded-full border bg-white hover:bg-gray-100">Projects</button>
                </div>
                {domain === 'property' && !mode && (
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => chooseMode('sale')} className="px-3 py-2 text-sm rounded-full border bg-white hover:bg-gray-100">Buy</button>
                    <button onClick={() => chooseMode('rent')} className="px-3 py-2 text-sm rounded-full border bg-white hover:bg-gray-100">Rent</button>
                  </div>
                )}
                {(domain === 'project' || (domain === 'property' && mode)) && (
                  <div className="">
                    <div className="text-xs text-gray-500 mb-1">Popular locations:</div>
                    <div className="flex flex-wrap gap-2">
                      {['Pune', 'Hinjewadi', 'Chattarpur', 'Noida'].map(loc => (
                        <button key={loc} onClick={() => chooseCity(loc)} className="px-3 py-1.5 text-sm rounded-full border bg-white hover:bg-gray-100">{loc}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {(isTyping || (loading && expectSearch)) && (
              <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
                <span>{loading && expectSearch ? 'Searching' : 'Assistant is typing'}</span>
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                </span>
              </div>
            )}

            {(hasAnyFilter) && (propertyResults.length > 0 || projectResults.length > 0) && (
              <div className="mt-1 space-y-3">
                {propertyResults.length > 0 && (
                  <div className="animate-fade-in">
                    <div className="text-xs font-semibold text-gray-700 mb-2">Matching Properties</div>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {propertyResults.slice(0, 10).map((p) => <Card key={p.id} item={p} type="property" />)}
                    </div>
                    {/* Refinement chips */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[2, 3, 4].map(n => (
                        <button key={n} onClick={() => refineBhk(n)} className="px-3 py-1.5 text-xs rounded-full border bg-white hover:bg-gray-100">{n} BHK</button>
                      ))}
                      {['30-60 Lacs', '60-90 Lacs', '90 Lacs - 1.2 Cr', '1.2 - 2 Cr'].map(r => (
                        <button key={r} onClick={() => refineBudget(r)} className="px-3 py-1.5 text-xs rounded-full border bg-white hover:bg-gray-100">{r}</button>
                      ))}
                      <button onClick={() => toggleListing(mode === 'rent' ? 'sale' : 'rent')} className="px-3 py-1.5 text-xs rounded-full border bg-white hover:bg-gray-100">{mode === 'rent' ? 'Switch to Buy' : 'Switch to Rent'}</button>
                    </div>
                    <div className="pt-2 flex items-center gap-2">
                      <a href="tel:+919146205267" className="inline-block px-3 py-2 text-sm rounded-md bg-[#0d47a1] text-white">Call us</a>
                    </div>
                    <div className="mt-1 text-[11px] text-gray-600">
                      Visit our office to know more based on your criteria:
                      {' '}
                      <a href={officeMapsUrl} target="_blank" rel="noopener noreferrer" className="underline text-[#0d47a1]">{officeAddress}</a>
                    </div>
                  </div>
                )}
                {projectResults.length > 0 && (
                  <div className="animate-fade-in">
                    <div className="text-xs font-semibold text-gray-700 mb-2">Matching Projects</div>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {projectResults.slice(0, 10).map((pr) => <Card key={pr.id} item={pr} type="project" />)}
                    </div>
                    {/* Refinement chips for projects */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {['Under 80 Lacs', '80 Lacs - 1.2 Cr', '1.2 - 2 Cr'].map(r => (
                        <button key={r} onClick={() => refineBudget(r)} className="px-3 py-1.5 text-xs rounded-full border bg-white hover:bg-gray-100">{r}</button>
                      ))}
                    </div>
                    <div className="pt-2 flex items-center gap-2">
                      <a href="tel:+919146205267" className="inline-block px-3 py-2 text-sm rounded-md bg-[#0d47a1] text-white">Call us</a>
                    </div>
                    <div className="mt-1 text-[11px] text-gray-600">
                      Visit our office to know more based on your criteria:
                      {' '}
                      <a href={officeMapsUrl} target="_blank" rel="noopener noreferrer" className="underline text-[#0d47a1]">{officeAddress}</a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No results panel when a search just completed and nothing matched */}
            {lastSearch?.expected && propertyResults.length === 0 && projectResults.length === 0 && !loading && (
              <div className="mt-2 p-3 bg-white border border-gray-200 rounded-xl text-sm">
                <div>Sorry, couldn't find your match. Please call us for assistance in finding properties that match your criteria.</div>
                <div className="mt-2 flex items-center gap-2">
                  <a href="tel:+919146205267" className="inline-block px-3 py-2 text-sm rounded-md bg-[#0d47a1] text-white">Call us</a>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Or visit our office to know more based on your criteria:
                  {' '}
                  <a href={officeMapsUrl} target="_blank" rel="noopener noreferrer" className="underline text-[#0d47a1]">{officeAddress}</a>
                </div>
              </div>
            )}
          </div>
          <form onSubmit={onSubmit} className="flex items-center gap-2 p-2 border-t bg-white md:relative absolute bottom-0 left-0 right-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border rounded-md px-3 py-2 text-sm"
              placeholder={'Ask anything, e.g., "Apartment in Chattarpur under 1 Cr"'}
            />
            <button type="submit" className="px-3 py-2 text-sm rounded-md bg-[#0d47a1] text-white" disabled={loading}>Send</button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-xl bg-[#0d47a1] text-white flex items-center justify-center"
        aria-label="Open Lotlite Assistant"
      >
        <FaRobot className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>
    </div>
  );
}


