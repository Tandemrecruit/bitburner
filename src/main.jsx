import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Clipboard, Download, Plane, Plus, Trash2 } from 'lucide-react';
import './styles.css';

const startingState = {
  meta: {
    saveName: 'Puffin Planes - COO Briefing',
    inGameDate: '2032-04-18',
    cash: 1284000,
    weeklyProfit: 186000,
    reputation: 74,
    riskTolerance: 'Moderate',
  },
  goals: [
    { rowKey: 'goal-1', text: 'Increase profitable passenger capacity without overextending cash reserves.' },
    { rowKey: 'goal-2', text: 'Keep on-time performance above 88%.' },
    { rowKey: 'goal-3', text: 'Prepare an expansion plan for underserved coastal routes.' },
  ],
  fleet: [
    { id: 'PP-101', model: 'Puffin Dash 8', age: 3, condition: 91, utilization: 82, route: 'Reykjavik ↔ Tórshavn', margin: 18 },
    { id: 'PP-204', model: 'Heron 220', age: 7, condition: 76, utilization: 68, route: 'Bergen ↔ Lerwick', margin: 11 },
    { id: 'PP-312', model: 'Auk Regional', age: 1, condition: 97, utilization: 88, route: 'Edinburgh ↔ Kirkwall', margin: 24 },
  ],
  routes: [
    { name: 'Reykjavik ↔ Tórshavn', demand: 81, competition: 38, satisfaction: 86, notes: 'High cargo add-on opportunity.' },
    { name: 'Bergen ↔ Lerwick', demand: 57, competition: 22, satisfaction: 79, notes: 'Thin route; watch fuel cost sensitivity.' },
    { name: 'Edinburgh ↔ Kirkwall', demand: 92, competition: 55, satisfaction: 91, notes: 'Candidate for frequency increase.' },
  ],
  staff: {
    pilots: 18,
    cabinCrew: 24,
    mechanics: 9,
    morale: 83,
    openRoles: '2 mechanics, 1 dispatcher',
  },
  constraints: 'Do not drop below $750k cash. Prefer actions that improve resilience before aggressive expansion.',
};

function currency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value) || 0);
}

function numberInput(value, onChange, props = {}) {
  return <input type="number" value={value} onChange={(event) => {
    const numValue = Number(event.target.value);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  }} {...props} />;
}

function App() {
  const [state, setState] = useState(startingState);
  const [copied, setCopied] = useState(false);

  const cooDump = useMemo(() => JSON.stringify({
    role_request: 'Act as COO for Puffin Planes. Analyze the game state, identify risks/opportunities, and recommend next actions with rationale.',
    generated_at: new Date().toISOString(),
    game_state: state,
  }, null, 2), [state]);

  const healthScore = useMemo(() => {
    const fleetAvg = state.fleet.reduce((sum, plane) => sum + plane.condition, 0) / state.fleet.length;
    const routeAvg = state.routes.reduce((sum, route) => sum + route.satisfaction, 0) / state.routes.length;
    return Math.round((fleetAvg + routeAvg + state.staff.morale + state.meta.reputation) / 4);
  }, [state]);

  const updateMeta = (key, value) => setState((prev) => ({ ...prev, meta: { ...prev.meta, [key]: value } }));
  const updateStaff = (key, value) => setState((prev) => ({ ...prev, staff: { ...prev.staff, [key]: value } }));
  const updateArrayItem = (section, index, key, value) => setState((prev) => ({
    ...prev,
    [section]: prev[section].map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item),
  }));
  const removeArrayItem = (section, index) => setState((prev) => ({ ...prev, [section]: prev[section].filter((_, itemIndex) => itemIndex !== index) }));

  const copyDump = async () => {
    await navigator.clipboard.writeText(cooDump);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const downloadDump = () => {
    const blob = new Blob([cooDump], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'puffin-planes-coo-dump.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return <main>
    <header className="hero">
      <div>
        <p className="eyebrow"><Plane size={18} /> Puffin Planes Command Center</p>
        <h1>Game-state dump builder for a ChatGPT COO</h1>
        <p className="lede">Capture operations, finance, fleet, routes, and constraints in a structured prompt-ready JSON package.</p>
      </div>
      <div className="score-card">
        <span>Operational health</span>
        <strong>{healthScore}</strong>
        <small>{currency(state.meta.cash)} cash · {currency(state.meta.weeklyProfit)}/week</small>
      </div>
    </header>

    <section className="grid two">
      <div className="panel">
        <h2>Executive context</h2>
        <label>Save name<input value={state.meta.saveName} onChange={(event) => updateMeta('saveName', event.target.value)} /></label>
        <label>In-game date<input type="date" value={state.meta.inGameDate} onChange={(event) => updateMeta('inGameDate', event.target.value)} /></label>
        <div className="inline">
          <label>Cash{numberInput(state.meta.cash, (value) => updateMeta('cash', value))}</label>
          <label>Weekly profit{numberInput(state.meta.weeklyProfit, (value) => updateMeta('weeklyProfit', value))}</label>
        </div>
        <div className="inline">
          <label>Reputation{numberInput(state.meta.reputation, (value) => updateMeta('reputation', value), { min: 0, max: 100 })}</label>
          <label>Risk tolerance<input value={state.meta.riskTolerance} onChange={(event) => updateMeta('riskTolerance', event.target.value)} /></label>
        </div>
        <label>Strategic constraints<textarea value={state.constraints} onChange={(event) => setState((prev) => ({ ...prev, constraints: event.target.value }))} /></label>
      </div>

      <div className="panel">
        <h2>COO objectives</h2>
        {state.goals.map((goal, index) => <div className="row" key={goal.rowKey}>
          <input value={goal.text} onChange={(event) => setState((prev) => ({ ...prev, goals: prev.goals.map((item, itemIndex) => itemIndex === index ? { ...item, text: event.target.value } : item) }))} />
          <button className="icon" onClick={() => removeArrayItem('goals', index)} aria-label="Remove objective"><Trash2 size={16} /></button>
        </div>)}
        <button onClick={() => setState((prev) => ({ ...prev, goals: [...prev.goals, { rowKey: `goal-${Date.now()}`, text: '' }] }))}><Plus size={16} /> Add objective</button>
      </div>
    </section>

    <section className="panel">
      <h2>Fleet</h2>
      <div className="cards">{state.fleet.map((plane, index) => <article className="mini-card" key={plane.id}>
        <div className="card-title"><input value={plane.id} onChange={(event) => updateArrayItem('fleet', index, 'id', event.target.value)} /><button className="icon" onClick={() => removeArrayItem('fleet', index)}><Trash2 size={16} /></button></div>
        <label>Model<input value={plane.model} onChange={(event) => updateArrayItem('fleet', index, 'model', event.target.value)} /></label>
        <label>Route<input value={plane.route} onChange={(event) => updateArrayItem('fleet', index, 'route', event.target.value)} /></label>
        <div className="inline"><label>Age{numberInput(plane.age, (value) => updateArrayItem('fleet', index, 'age', value))}</label><label>Condition{numberInput(plane.condition, (value) => updateArrayItem('fleet', index, 'condition', value))}</label></div>
        <div className="inline"><label>Utilization{numberInput(plane.utilization, (value) => updateArrayItem('fleet', index, 'utilization', value))}</label><label>Margin %{numberInput(plane.margin, (value) => updateArrayItem('fleet', index, 'margin', value))}</label></div>
      </article>)}</div>
      <button onClick={() => setState((prev) => ({ ...prev, fleet: [...prev.fleet, { id: 'PP-New', model: '', age: 0, condition: 100, utilization: 0, route: '', margin: 0 }] }))}><Plus size={16} /> Add aircraft</button>
    </section>

    <section className="panel">
      <h2>Routes</h2>
      <div className="cards">{state.routes.map((route, index) => <article className="mini-card" key={route.name}>
        <div className="card-title"><input value={route.name} onChange={(event) => updateArrayItem('routes', index, 'name', event.target.value)} /><button className="icon" onClick={() => removeArrayItem('routes', index)}><Trash2 size={16} /></button></div>
        <div className="inline"><label>Demand{numberInput(route.demand, (value) => updateArrayItem('routes', index, 'demand', value))}</label><label>Competition{numberInput(route.competition, (value) => updateArrayItem('routes', index, 'competition', value))}</label></div>
        <label>Satisfaction{numberInput(route.satisfaction, (value) => updateArrayItem('routes', index, 'satisfaction', value))}</label>
        <label>Notes<textarea value={route.notes} onChange={(event) => updateArrayItem('routes', index, 'notes', event.target.value)} /></label>
      </article>)}</div>
      <button onClick={() => setState((prev) => ({ ...prev, routes: [...prev.routes, { name: '', demand: 0, competition: 0, satisfaction: 0, notes: '' }] }))}><Plus size={16} /> Add route</button>
    </section>

    <section className="grid two">
      <div className="panel">
        <h2>Staffing</h2>
        <div className="inline"><label>Pilots{numberInput(state.staff.pilots, (value) => updateStaff('pilots', value))}</label><label>Cabin crew{numberInput(state.staff.cabinCrew, (value) => updateStaff('cabinCrew', value))}</label></div>
        <div className="inline"><label>Mechanics{numberInput(state.staff.mechanics, (value) => updateStaff('mechanics', value))}</label><label>Morale{numberInput(state.staff.morale, (value) => updateStaff('morale', value))}</label></div>
        <label>Open roles<input value={state.staff.openRoles} onChange={(event) => updateStaff('openRoles', event.target.value)} /></label>
      </div>

      <div className="panel dump-panel">
        <h2>ChatGPT-ready COO dump</h2>
        <pre>{cooDump}</pre>
        <div className="actions">
          <button onClick={copyDump}><Clipboard size={16} /> {copied ? 'Copied!' : 'Copy dump'}</button>
          <button onClick={downloadDump}><Download size={16} /> Download JSON</button>
        </div>
      </div>
    </section>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
