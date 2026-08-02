import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const currencyOptions = ['USD', 'EUR', 'GBP'];
const frequencyOptions = ['monthly', 'yearly', 'weekly', 'daily'];
const categoryOptions = ['entertainment', 'technology', 'finance', 'lifestyle', 'sports', 'news', 'other'];

function App() {
  const [mode, setMode] = useState('signin');
  const [token, setToken] = useState(() => localStorage.getItem('subdubToken'));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('subdubUser') || 'null'));
  const [subscriptions, setSubscriptions] = useState([]);
  const [toast, setToast] = useState(null);

  const signedIn = Boolean(token && user);

  const api = async (path, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if(token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(path, { ...options, headers });
    const body = await response.json().catch(() => ({}));

    if(!response.ok || body.success === false) {
      throw new Error(body.error || body.message || 'Request failed');
    }

    return body;
  };

  const notify = (message, error = false) => {
    setToast({ message, error });
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setToast(null), 3600);
  };

  const saveSession = (data) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('subdubToken', data.token);
    localStorage.setItem('subdubUser', JSON.stringify(data.user));
  };

  const signOut = () => {
    setToken(null);
    setUser(null);
    setSubscriptions([]);
    localStorage.removeItem('subdubToken');
    localStorage.removeItem('subdubUser');
  };

  const loadSubscriptions = async () => {
    if(!user?._id) return;
    const body = await api(`/api/v1/subscription/user/${user._id}`);
    setSubscriptions(body.data || []);
  };

  useEffect(() => {
    if(signedIn) {
      loadSubscriptions().catch((error) => notify(error.message, true));
    }
  }, [signedIn, user?._id]);

  return (
    <main className={`app ${signedIn ? '' : 'auth-shell'}`}>
      {!signedIn ? (
        <AuthPanel
          mode={mode}
          setMode={setMode}
          api={api}
          saveSession={saveSession}
          notify={notify}
        />
      ) : (
        <Dashboard
          user={user}
          subscriptions={subscriptions}
          api={api}
          notify={notify}
          signOut={signOut}
          loadSubscriptions={loadSubscriptions}
        />
      )}

      {toast && <div className={`toast ${toast.error ? 'error' : ''}`}>{toast.message}</div>}
    </main>
  );
}

function AuthPanel({ mode, setMode, api, saveSession, notify }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const onSubmit = async (event) => {
    event.preventDefault();
    const path = mode === 'signup' ? '/api/v1/auth/sign-up' : '/api/v1/auth/sign-in';
    const payload = {
      email: form.email,
      password: form.password,
    };

    if(mode === 'signup') {
      payload.name = form.name;
    }

    try {
      const body = await api(path, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      saveSession(body.data);
      notify(mode === 'signup' ? 'Account created' : 'Signed in');
    } catch (error) {
      notify(error.message, true);
    }
  };

  return (
    <section className="auth-stage">
      <div className="auth-copy">
        <p className="auth-kicker">SubDub</p>
        <h1>Own every renewal before it owns you.</h1>
        <p>Track recurring plans, renewal dates, and reminder emails from one calm command center.</p>

        <div className="auth-preview" aria-hidden="true">
          <div className="preview-head">
            <span>June outlook</span>
            <strong>$86.72</strong>
          </div>
          <div className="preview-row">
            <span>Netflix</span>
            <b>Tonight</b>
          </div>
          <div className="preview-row">
            <span>Figma</span>
            <b>Jun 24</b>
          </div>
          <div className="preview-row">
            <span>Spotify</span>
            <b>Jul 02</b>
          </div>
        </div>
      </div>

      <div className="panel auth">
        <p className="eyebrow">Welcome back</p>
        <h2>{mode === 'signup' ? 'Create your account' : 'Sign in to SubDub'}</h2>
        <p className="muted">Keep your subscriptions sharp, visible, and under control.</p>

        <div className="tabs">
          <button className={`tab ${mode === 'signin' ? 'active' : ''}`} type="button" onClick={() => setMode('signin')}>
            Sign in
          </button>
          <button className={`tab ${mode === 'signup' ? 'active' : ''}`} type="button" onClick={() => setMode('signup')}>
            Sign up
          </button>
        </div>

        <form className="form" onSubmit={onSubmit}>
          {mode === 'signup' && (
            <Field label="Name">
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required placeholder="Alex Morgan" />
            </Field>
          )}

          <Field label="Email">
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required placeholder="you@example.com" />
          </Field>

          <Field label="Password">
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength="6" placeholder="Password" />
          </Field>

          <button className="primary" type="submit">{mode === 'signup' ? 'Create account' : 'Sign in'}</button>
        </form>
      </div>
    </section>
  );
}

function Dashboard({ user, subscriptions, api, notify, signOut, loadSubscriptions }) {
  return (
    <section className="dashboard">
      <header className="topbar">
        <div>
          <p className="eyebrow">SubDub</p>
          <h1>Welcome, {user.name}</h1>
          <p className="dashboard-subtitle">A clean view of what renews, what costs, and what needs attention.</p>
        </div>
        <button className="ghost" type="button" onClick={signOut}>Sign out</button>
      </header>

      <Stats subscriptions={subscriptions} />

      <div className="grid workspace-grid">
        <SubscriptionForm api={api} notify={notify} loadSubscriptions={loadSubscriptions} />
        <aside className="side-stack">
          <EmailTest user={user} api={api} notify={notify} />
          <section className="panel insight-panel">
            <p className="eyebrow">Billing rhythm</p>
            <h2>Keep renewals visible</h2>
            <p className="muted">Use renewal dates to spot upcoming charges and send yourself reminder emails before the bill lands.</p>
            <div className="insight-meter">
              <span />
            </div>
          </section>
        </aside>
      </div>

      <section className="panel subscriptions-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Portfolio</p>
            <h2>Your subscriptions</h2>
          </div>
          <button className="ghost small" type="button" onClick={() => loadSubscriptions().then(() => notify('Subscriptions refreshed')).catch((error) => notify(error.message, true))}>
            Refresh
          </button>
        </div>
        <SubscriptionList subscriptions={subscriptions} />
      </section>
    </section>
  );
}

function Stats({ subscriptions }) {
  const active = subscriptions.filter((sub) => sub.status === 'active');
  const monthlyTotal = active.reduce((total, sub) => {
    const multiplier = { daily: 30, weekly: 4, monthly: 1, yearly: 1 / 12 }[sub.frequency] || 1;
    return total + Number(sub.price || 0) * multiplier;
  }, 0);

  const nextRenewal = [...active]
    .filter((sub) => sub.renewalDate)
    .sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate))[0]?.renewalDate;

  return (
    <section className="stats">
      <Stat label="Total monthly" value={formatMoney(monthlyTotal, active[0]?.currency || 'USD')} />
      <Stat label="Active subscriptions" value={active.length} />
      <Stat label="Next renewal" value={formatDate(nextRenewal)} />
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SubscriptionForm({ api, notify, loadSubscriptions }) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [form, setForm] = useState({
    name: '',
    price: '',
    currency: 'USD',
    frequency: 'monthly',
    category: 'entertainment',
    paymentMethod: '',
    startDate: today,
    renewalDate: '',
  });

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
    };

    if(!payload.renewalDate) {
      delete payload.renewalDate;
    }

    try {
      const body = await api('/api/v1/subscription/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setForm({
        name: '',
        price: '',
        currency: 'USD',
        frequency: 'monthly',
        category: 'entertainment',
        paymentMethod: '',
        startDate: today,
        renewalDate: '',
      });
      notify(body.data.workflowError ? `Created. Workflow: ${body.data.workflowError}` : 'Subscription created');
      await loadSubscriptions();
    } catch (error) {
      notify(error.message, true);
    }
  };

  return (
    <section className="panel form-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">New plan</p>
          <h2>Add subscription</h2>
        </div>
        <span className="form-badge">Active tracking</span>
      </div>
      <form className="form" onSubmit={onSubmit}>
        <div className="two">
          <Field label="Name">
            <input value={form.name} onChange={(event) => update('name', event.target.value)} required placeholder="Netflix" />
          </Field>
          <Field label="Price">
            <input type="number" min="0" step="0.01" value={form.price} onChange={(event) => update('price', event.target.value)} required placeholder="10" />
          </Field>
        </div>

        <div className="three">
          <Field label="Currency">
            <select value={form.currency} onChange={(event) => update('currency', event.target.value)}>
              {currencyOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="Frequency">
            <select value={form.frequency} onChange={(event) => update('frequency', event.target.value)}>
              {frequencyOptions.map((item) => <option key={item} value={item}>{title(item)}</option>)}
            </select>
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={(event) => update('category', event.target.value)}>
              {categoryOptions.map((item) => <option key={item} value={item}>{title(item)}</option>)}
            </select>
          </Field>
        </div>

        <div className="two">
          <Field label="Payment method">
            <input value={form.paymentMethod} onChange={(event) => update('paymentMethod', event.target.value)} required placeholder="Credit card" />
          </Field>
          <Field label="Start date">
            <input type="date" value={form.startDate} onChange={(event) => update('startDate', event.target.value)} required />
          </Field>
        </div>

        <Field label="Renewal date">
          <input type="date" value={form.renewalDate} onChange={(event) => update('renewalDate', event.target.value)} />
        </Field>

        <button className="primary" type="submit">Create subscription</button>
      </form>
    </section>
  );
}

function EmailTest({ user, api, notify }) {
  const [to, setTo] = useState(user.email || '');

  const onSubmit = async (event) => {
    event.preventDefault();

    try {
      await api('/api/v1/workflow/test-email', {
        method: 'POST',
        body: JSON.stringify({ to, name: user.name }),
      });
      notify('Test email sent');
    } catch (error) {
      notify(error.message, true);
    }
  };

  return (
    <section className="panel email-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">Reminders</p>
          <h2>Reminder test</h2>
        </div>
        <button className="ghost small" type="button" onClick={() => setTo(user.email || '')}>Use my email</button>
      </div>
      <form className="form" onSubmit={onSubmit}>
        <Field label="Send test email to">
          <input type="email" value={to} onChange={(event) => setTo(event.target.value)} required placeholder="you@example.com" />
        </Field>
        <button className="secondary" type="submit">Send test email</button>
      </form>
    </section>
  );
}

function SubscriptionList({ subscriptions }) {
  if(!subscriptions.length) {
    return <div className="empty">No subscriptions yet.</div>;
  }

  return (
    <div className="subscriptions">
      {subscriptions.map((sub) => (
        <article className="subscription" key={sub._id}>
          <div>
            <h3>{sub.name}</h3>
            <p>{formatMoney(sub.price, sub.currency)} - {sub.frequency} - renews {formatDate(sub.renewalDate)}</p>
          </div>
          <span className="pill">{sub.status}</span>
        </article>
      ))}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function formatDate(value) {
  if(!value) return '-';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function formatMoney(value, currency = 'USD') {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function title(value) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

createRoot(document.getElementById('root')).render(<App />);
