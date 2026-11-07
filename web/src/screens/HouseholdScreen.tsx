// Husstand (S-011): signing in with an email code, creating or joining a household (an invite link
// #/join/CODE fills in the code), the members, inviting, leaving and signing out. Optional: the app
// works without it. Loaded on its own (App.tsx), with the Supabase library.
//
// Sharing the things themselves comes with sync (slice 5); until then this screen says so.

import { Copy, LogOut, Share2, UserPlus } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Button, Card, MessageState, Page, SubPageHeader, Toast, inputClass, useConfirm, type ToastMessage } from '../components/ui';
import type { Strings } from '../i18n/strings';
import { usePageTitle } from '../lib/usePageTitle';
import { hrefs } from '../router';
import { accountError, createHousehold, createInvite, joinHousehold, leaveHousehold, loadAccount, sendCode, signOut, verifyCode, type Account, type AccountError, type Household } from '../account/account';
import { accountsConfigured } from '../account/config';

export default function HouseholdScreen({ code, s }: { code: string | null; s: Strings }) {
  const t = s.household;
  usePageTitle(t.title, s.appTitle);
  const [account, setAccount] = useState<Account | null>(null);
  const [error, setError] = useState<AccountError | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const reload = useCallback(async () => {
    try {
      setAccount(await loadAccount());
      setError(null);
    } catch (e) {
      setError(accountError(e));
    }
  }, []);

  useEffect(() => {
    if (accountsConfigured) void reload();
  }, [reload]);

  let body;
  if (!accountsConfigured) body = <MessageState title={t.notConfigured} />;
  else if (account === null) body = error ? <ErrorNote error={error} s={s} /> : <MessageState title={s.loading} />;
  else if (account.status === 'signedOut') body = <SignIn s={s} onSignedIn={reload} />;
  else if (!account.household)
    body = (
      <>
        <NoHousehold code={code} s={s} onDone={reload} />
        <SignedInAs email={account.email} s={s} onSignedOut={reload} />
      </>
    );
  else
    body = (
      <>
        <InHousehold household={account.household} userId={account.userId} s={s} onChange={reload} onMessage={(text) => setToast({ id: Date.now(), text })} />
        <SignedInAs email={account.email} s={s} onSignedOut={reload} />
      </>
    );

  return (
    <Page>
      <SubPageHeader backLabel={s.back} backTo={hrefs.settings} title={account?.status === 'signedIn' && account.household ? account.household.name : t.title} />
      <div className="flex flex-col gap-4">{body}</div>
      <Toast message={toast} onHide={() => setToast(null)} />
    </Page>
  );
}

function ErrorNote({ error, s }: { error: AccountError; s: Strings }) {
  return (
    <p role="alert" className="rounded-2xl bg-note-bg px-[16px] py-3 text-note-text">
      {s.household.errors[error]}
    </p>
  );
}

// Runs an action, shows its error in the screen's words, and tells whether it is still running.
function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AccountError | null>(null);
  const run = async (action: () => Promise<unknown>): Promise<boolean> => {
    setBusy(true);
    setError(null);
    try {
      await action();
      return true;
    } catch (e) {
      setError(accountError(e));
      return false;
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, run };
}

function SignIn({ s, onSignedIn }: { s: Strings; onSignedIn: () => void }) {
  const t = s.household;
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const { busy, error, run } = useAction();
  const online = typeof navigator === 'undefined' || navigator.onLine !== false;

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const address = email.trim();
    if (await run(() => sendCode(address))) setSentTo(address);
  };
  const verify = async (e: FormEvent) => {
    e.preventDefault();
    if (sentTo && (await run(() => verifyCode(sentTo, token.replace(/\D/g, ''))))) onSignedIn();
  };

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">{t.signInTitle}</h2>
      {!online ? <p className="rounded-2xl bg-note-bg px-[16px] py-3 text-note-text">{t.offline}</p> : null}
      {sentTo === null ? (
        <form onSubmit={(e) => void send(e)} className="flex flex-col gap-3">
          <p>{t.signInIntro}</p>
          <label className="flex flex-col gap-1">
            <span className="font-bold">{t.email}</span>
            <input type="email" required autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.emailPlaceholder} className={`${inputClass} min-h-12 text-lg`} />
          </label>
          {error ? <ErrorNote error={error} s={s} /> : null}
          <Button type="submit" variant="primary" disabled={busy || !email.trim()}>
            {busy ? t.sending : t.sendCode}
          </Button>
          <p className="text-sm text-muted">{t.privacy}</p>
        </form>
      ) : (
        <form onSubmit={(e) => void verify(e)} className="flex flex-col gap-3">
          <p role="status">{t.codeSent(sentTo)}</p>
          <label className="flex flex-col gap-1">
            <span className="font-bold">{t.code}</span>
            <input
              required
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9 ]{6,12}"
              maxLength={12}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              data-autofocus=""
              className={`${inputClass} min-h-12 text-center text-2xl tracking-[0.3em]`}
            />
          </label>
          {error ? <ErrorNote error={error} s={s} /> : null}
          <Button type="submit" variant="primary" disabled={busy || token.replace(/\D/g, '').length < 6}>
            {t.signIn}
          </Button>
          <button
            type="button"
            onClick={() => {
              setSentTo(null);
              setToken('');
            }}
            className="min-h-11 self-start text-sm font-bold underline underline-offset-4"
          >
            {t.otherEmail}
          </button>
        </form>
      )}
    </Card>
  );
}

function NoHousehold({ code, s, onDone }: { code: string | null; s: Strings; onDone: () => void }) {
  const t = s.household;
  const [name, setName] = useState(t.defaultName);
  const [invite, setInvite] = useState(code ?? '');
  const create = useAction();
  const join = useAction();
  const joinCard = (
    <Card key="join" className="flex flex-col gap-3">
      <h2 className="text-lg font-bold">{t.joinTitle}</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void join.run(() => joinHousehold(invite)).then((ok) => ok && onDone());
        }}
        className="flex flex-col gap-3"
      >
        <p>{t.joinIntro}</p>
        <label className="flex flex-col gap-1">
          <span className="font-bold">{t.inviteCode}</span>
          <input required autoCapitalize="characters" autoComplete="off" maxLength={12} value={invite} onChange={(e) => setInvite(e.target.value.toUpperCase())} className={`${inputClass} min-h-12 text-center text-2xl tracking-[0.3em]`} />
        </label>
        {join.error ? <ErrorNote error={join.error} s={s} /> : null}
        <Button type="submit" variant="primary" disabled={join.busy || invite.replace(/[^A-Za-z0-9]/g, '').length < 6}>
          {t.join}
        </Button>
      </form>
    </Card>
  );
  const createCard = (
    <Card key="create" className="flex flex-col gap-3">
      <h2 className="text-lg font-bold">{t.createTitle}</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void create.run(() => createHousehold(name.trim())).then((ok) => ok && onDone());
        }}
        className="flex flex-col gap-3"
      >
        <p>{t.createIntro}</p>
        <label className="flex flex-col gap-1">
          <span className="font-bold">{t.householdName}</span>
          <input required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} className={`${inputClass} min-h-12 text-lg`} />
        </label>
        {create.error ? <ErrorNote error={create.error} s={s} /> : null}
        <Button type="submit" variant={code ? 'secondary' : 'primary'} disabled={create.busy || !name.trim()}>
          {t.create}
        </Button>
      </form>
    </Card>
  );
  // Came from an invite link: joining first.
  return <>{code ? [joinCard, createCard] : [createCard, joinCard]}</>;
}

function InHousehold({ household, userId, s, onChange, onMessage }: { household: Household; userId: string; s: Strings; onChange: () => void; onMessage: (text: string) => void }) {
  const t = s.household;
  const [code, setCode] = useState<string | null>(null);
  const invite = useAction();
  const leave = useAction();
  const { confirm, sheet } = useConfirm();
  const link = code ? `${location.origin}${location.pathname}${hrefs.join(code)}` : '';

  const share = async () => {
    if (!code) return;
    const text = t.shareText(code, link);
    if (navigator.share) {
      try {
        await navigator.share({ title: s.appTitle, text });
      } catch {
        // cancelled
      }
    } else {
      await navigator.clipboard?.writeText(text);
      onMessage(t.copied);
    }
  };

  return (
    <>
      <Card className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">{t.members}</h2>
        <ul className="flex flex-col gap-1">
          {household.members.map((m) => (
            <li key={m.userId}>
              {m.email}
              <span className="text-muted">{[m.role === 'owner' ? t.owner : null, m.userId === userId ? t.you : null].filter(Boolean).map((x) => ` · ${x}`)}</span>
            </li>
          ))}
        </ul>
        {code ? (
          <div className="flex flex-col gap-3 rounded-2xl bg-background px-[16px] py-4" role="status">
            <p className="font-bold">{t.inviteTitle}</p>
            <p className="text-center text-3xl font-bold tracking-[0.3em]">{code}</p>
            <p className="text-sm">{t.inviteIntro}</p>
            <p className="text-sm text-muted">{t.inviteExpires}</p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="primary" onClick={() => void share()}>
                <Share2 aria-hidden="true" className="size-5" />
                {t.share}
              </Button>
              <Button
                onClick={() => {
                  void navigator.clipboard?.writeText(link).then(() => onMessage(t.copied));
                }}
              >
                <Copy aria-hidden="true" className="size-5" />
                {t.copy}
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="primary" disabled={invite.busy} onClick={() => void invite.run(async () => setCode(await createInvite(household.id)))}>
            <UserPlus aria-hidden="true" className="size-5" />
            {t.invite}
          </Button>
        )}
        {invite.error ? <ErrorNote error={invite.error} s={s} /> : null}
      </Card>
      <p className="px-1 text-sm text-muted">{t.syncLater}</p>
      <Card className="flex flex-col gap-3">
        {leave.error ? <ErrorNote error={leave.error} s={s} /> : null}
        <Button
          variant="danger"
          disabled={leave.busy}
          onClick={() =>
            void (async () => {
              const last = household.members.length <= 1;
              if (!(await confirm({ title: t.leaveConfirm(household.name), body: last ? t.leaveLast : t.leaveBody, confirmLabel: t.leave, cancelLabel: s.cancel, danger: true }))) return;
              if (await leave.run(leaveHousehold)) {
                onMessage(t.left);
                onChange();
              }
            })()
          }
        >
          {t.leave}
        </Button>
      </Card>
      {sheet}
    </>
  );
}

function SignedInAs({ email, s, onSignedOut }: { email: string; s: Strings; onSignedOut: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-[12px] px-1">
      <p className="text-sm text-muted">{s.household.signedInAs(email)}</p>
      <button type="button" onClick={() => void signOut().then(onSignedOut)} className="inline-flex min-h-11 items-center gap-[6px] text-sm font-bold underline underline-offset-4">
        <LogOut aria-hidden="true" className="size-4" />
        {s.household.signOut}
      </button>
    </div>
  );
}
