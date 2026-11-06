import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar as NativeStatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cardsForRound, contracts, exactBidPoints, GameId, games, isSession, Round, Session, totals, validatePoints } from './src/game';

const STORE = 'troevenboek.sessions.v1';
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const palette = { ink: '#233e32', muted: '#73796f', paper: '#faf8f1', line: '#e3e4d9', green: '#285b45', gold: '#b18a42' };
function Button({ title, onPress, secondary = false, disabled = false }: { title: string; onPress: () => void; secondary?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [s.button, secondary && s.secondary, { opacity: disabled ? .45 : pressed ? .7 : 1 }]}><Text style={[s.buttonText, secondary && { color: palette.ink }]}>{title}</Text></Pressable>;
}
function Label({ children }: { children: React.ReactNode }) { return <Text style={s.label}>{children}</Text>; }
function Field({ value, onChangeText, label, numeric = false }: { value: string; onChangeText: (v: string) => void; label: string; numeric?: boolean }) {
  return <TextInput accessibilityLabel={label} placeholder={label} placeholderTextColor="#93998d" value={value} onChangeText={onChangeText} keyboardType={numeric ? 'numbers-and-punctuation' : 'default'} autoCapitalize={numeric ? 'none' : 'words'} maxLength={numeric ? 8 : 40} style={s.input} />;
}
export default function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [screen, setScreen] = useState<'home' | 'setup' | 'table' | 'round'>('home');
  const [active, setActive] = useState<string | null>(null);
  const [game, setGame] = useState<GameId>('kleurenwiezen');
  const [names, setNames] = useState(['', '', '', '']);
  const [name, setName] = useState('');
  const [maxCards, setMaxCards] = useState('7');
  const [error, setError] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [contract, setContract] = useState('');
  const [points, setPoints] = useState<string[]>([]);
  const [bids, setBids] = useState<string[]>([]);
  const [tricks, setTricks] = useState<string[]>([]);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const session = sessions.find(x => x.id === active);
  const currentGame = games.find(g => g.id === (session && screen !== 'setup' ? session.game : game))!;
  const roundIndex = session ? (editId ? session.rounds.findIndex(r => r.id === editId) : session.rounds.length) : 0;
  const cards = session ? cardsForRound(roundIndex, session.maxCards) : 0;
  const load = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORE);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed) || !parsed.every(isSession)) throw new Error('invalid');
      setSessions(parsed); setLoaded(true); setStorageError('');
    } catch { setStorageError('Je bewaarde tafels konden niet worden geladen. Probeer opnieuw; je gegevens blijven bewaard.'); }
  };
  useEffect(() => { void load(); }, []);
  const back = () => { setError(''); setConfirmFinish(false); setScreen(screen === 'round' ? 'table' : 'home'); };
  useEffect(() => { const listener = BackHandler.addEventListener('hardwareBackPress', () => { if (screen === 'home') return false; if (!saving.current) back(); return true; }); return () => listener.remove(); }, [screen]);
  // Write before changing the screen: a failed save keeps the complete draft available.
  const persist = async (next: Session[], after?: () => void) => {
    if (saving.current) return;
    saving.current = true; setBusy(true); setError('');
    try { await AsyncStorage.setItem(STORE, JSON.stringify(next)); setSessions(next); after?.(); }
    catch { setError('Opslaan is niet gelukt. Je invoer staat er nog. Probeer opnieuw.'); }
    finally { saving.current = false; setBusy(false); }
  };
  const updateSession = (next: Session, after?: () => void) => persist(sessions.map(x => x.id === next.id ? next : x), after);
  const setup = (id: GameId) => { setGame(id); setNames(['', '', '', '']); setName(''); setMaxCards('7'); setError(''); setScreen('setup'); };
  const create = () => {
    const players = names.map(n => n.trim());
    if (players.some(n => !n) || new Set(players.map(n => n.toLocaleLowerCase())).size !== players.length) return setError('Geef elke speler een eigen naam.');
    const max = Math.floor(52 / players.length);
    if (game === 'poepen' && (!/^\d+$/.test(maxCards) || +maxCards < 2 || +maxCards > max)) return setError(`Kies 2 tot ${max} kaarten.`);
    const next: Session = { id: uid(), name: name.trim() || `${games.find(g => g.id === game)!.name} aan tafel`, game, players, rounds: [], created: new Date().toISOString(), finished: false, maxCards: game === 'poepen' ? +maxCards : Math.min(7, max) };
    void persist([next, ...sessions], () => { setActive(next.id); setScreen('table'); });
  };
  const openRound = (round?: Round) => {
    if (!session) return;
    setEditId(round?.id ?? null); setContract(round?.contract ?? contracts[session.game][0]);
    setPoints(session.players.map((_, i) => round ? String(round.points[i]) : ''));
    setBids(session.players.map((_, i) => round?.bids ? String(round.bids[i]) : ''));
    setTricks(session.players.map((_, i) => round?.tricks ? String(round.tricks[i]) : ''));
    setError(''); setScreen('round');
  };
  const saveRound = () => {
    if (!session) return;
    try {
      const values = session.game === 'poepen' ? [...bids, ...tricks] : points;
      if (values.some(v => !/^-?\d+$/.test(v.trim()))) throw new Error('Vul voor elke speler een geheel getal in.');
      const scored = session.game === 'poepen' ? exactBidPoints(bids.map(Number), tricks.map(Number), cards) : points.map(Number);
      const problem = validatePoints(session.game, scored); if (problem) throw new Error(problem);
      const round: Round = { id: editId ?? uid(), game: session.game, contract, points: scored, ...(session.game === 'poepen' ? { bids: bids.map(Number), tricks: tricks.map(Number) } : {}) };
      void updateSession({ ...session, rounds: editId ? session.rounds.map(r => r.id === editId ? round : r) : [...session.rounds, round] }, () => setScreen('table'));
    } catch (e) { setError(e instanceof Error ? e.message : 'Controleer je invoer.'); }
  };
  const changeValue = (list: string[], index: number, value: string, setter: (v: string[]) => void) => setter(list.map((v, i) => i === index ? value : v));
  const scores = session ? totals(session) : [];
  const best = session?.game === 'poepen' ? Math.min(...scores) : Math.max(...scores);
  return <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <StatusBar style="dark" />
    <ScrollView keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="automatic" contentContainerStyle={s.page}>
      <View style={s.nav}><Pressable accessibilityRole="button" accessibilityLabel="Naar startscherm" disabled={busy} onPress={() => { setScreen('home'); setError(''); }} style={s.brand}><View style={s.logo}><Text style={s.logoText}>♠</Text></View><Text style={s.brandText}>TroevenBoek<Text style={{ color: palette.gold }}>.</Text></Text></Pressable><View style={s.offline}><Text style={s.offlineText}>●  Lokaal & offline</Text></View></View>
      {!loaded ? <View style={s.panel}><Text style={s.heading}>Je kaarttafels laden…</Text>{storageError ? <><Text accessibilityRole="alert" style={s.error}>{storageError}</Text><Button title="Opnieuw proberen" onPress={() => void load()} /></> : <ActivityIndicator color={palette.green} />}</View> : <>
      {screen === 'home' && <>
        <View style={s.hero}><View style={{ flex: 1, minWidth: 240, gap: 16 }}><Label>VOOR NOG ÉÉN POTJE</Label><Text style={s.heroTitle}>De kaarten op tafel.{ '\n' }De punten in je zak.</Text><Text style={s.heroBody}>Van de eerste slag tot de laatste ronde. Jouw scoreboek voor een gezellige avond kaarten.</Text><View style={{ alignSelf: 'flex-start' }}><Button title="＋  Nieuwe tafel" onPress={() => setup('kleurenwiezen')} /></View></View><View accessibilityElementsHidden style={s.cardArt}><View style={[s.playingCard, { transform: [{ rotate: '-14deg' }], backgroundColor: '#e4e9da', left: 2 }]}><Text style={s.cardCorner}>A ♣</Text><Text style={s.largeSuit}>♣</Text></View><View style={[s.playingCard, { transform: [{ rotate: '12deg' }], left: 72, top: 15 }]}><Text style={[s.cardCorner, { color: '#b65743' }]}>A ♥</Text><Text style={[s.largeSuit, { color: '#b65743' }]}>♥</Text></View></View></View>
        <View style={s.sectionTitle}><Text style={s.heading}>Wat spelen we?</Text><Text style={s.small}>Kies je kaartspel</Text></View>
        <View style={s.gameGrid}>{games.map(g => <Pressable key={g.id} accessibilityRole="button" accessibilityLabel={`Start ${g.name}`} onPress={() => setup(g.id)} style={({ pressed }) => [s.gameCard, { opacity: pressed ? .7 : 1 }]}><View style={[s.suitTile, { backgroundColor: g.tint }]}><Text style={{ fontSize: 33, color: g.color }}>{g.suit}</Text></View><Text style={s.gameName}>{g.name}</Text><Text style={s.body}>{g.description}</Text><View style={s.gameBottom}><Text style={s.small}>{g.detail}</Text><Text style={{ color: g.color, fontSize: 23 }}>↗</Text></View></Pressable>)}</View>
        <View style={[s.sectionTitle, { marginTop: 18 }]}><Text style={s.heading}>Jouw kaarttafels</Text><Text style={s.small}>{sessions.length} bewaard</Text></View>
        {!sessions.length ? <View style={s.empty}><Text style={{ fontSize: 27, color: palette.gold }}>♧</Text><Text style={s.gameName}>Een nieuwe avond, een leeg scoreblad.</Text><Text style={[s.body, { textAlign: 'center' }]}>Kies een spel en schuif aan. Je tafels worden hier automatisch bewaard.</Text></View> : sessions.map(item => <Pressable accessibilityRole="button" key={item.id} onPress={() => { setActive(item.id); setConfirmFinish(false); setScreen('table'); }} style={s.sessionRow}><View style={{ flex: 1, gap: 6 }}><Text style={s.gameName}>{item.name}</Text><Text style={s.small}>{item.players.join(' · ')}</Text><Text style={s.small}>{new Date(item.created).toLocaleDateString('nl-BE')} · {item.rounds.length} rondes · {item.finished ? 'Afgerond' : 'In uitvoering'}</Text></View><Text style={{ fontSize: 24, color: palette.green }}>→</Text></Pressable>)}
        <View style={s.tip}><Text style={s.tipSymbol}>♦</Text><View style={{ flex: 1, gap: 5 }}><Text style={s.tipTitle}>Goed gezelschap. Geen rekenwerk.</Text><Text style={s.body}>Geen account nodig. Je scoreboek blijft op dit toestel, ook zonder internet.</Text></View></View>
      </>}
      {screen !== 'home' && <Pressable accessibilityRole="button" disabled={busy} onPress={back}><Text style={s.back}>← {screen === 'round' ? 'Terug naar scoreblad' : 'Alle kaarttafels'}</Text></Pressable>}
      {screen === 'setup' && <View style={s.panel}><Label>NIEUWE KAARTTAFEL</Label><Text style={s.title}>Schuif maar aan.</Text><Text style={s.body}>Zet de spelers in zitvolgorde. De eerste speler deelt als eerste.</Text><View style={s.chips}>{games.map(g => <Button key={g.id} title={`${g.suit} ${g.name}`} secondary={game !== g.id} onPress={() => { setGame(g.id); if (g.id !== 'poepen') setNames(n => Array.from({ length: 4 }, (_, i) => n[i] ?? '')); setError(''); }} />)}</View><Label>NAAM VAN DE TAFEL</Label><Field label="Bijvoorbeeld: Vrijdag in De Welkom" value={name} onChangeText={setName} /><View style={s.sectionTitle}><Label>SPELERS · {names.length}</Label>{game === 'poepen' && <View style={s.chips}><Button title="−" secondary disabled={names.length <= 3} onPress={() => setNames(names.slice(0, -1))} /><Button title="＋" secondary disabled={names.length >= 8} onPress={() => { setNames([...names, '']); setMaxCards(String(Math.min(+maxCards || 7, Math.floor(52 / (names.length + 1))))); }} /></View>}</View>{names.map((n, i) => <Field key={i} label={`Speler ${i + 1}${i === 0 ? ' · deelt eerst' : ''}`} value={n} onChangeText={v => changeValue(names, i, v, setNames)} />)}{game === 'poepen' ? <><Label>HOOGSTE AANTAL KAARTEN</Label><Field label="Aantal kaarten" value={maxCards} onChangeText={setMaxCards} numeric /><Text style={s.body}>Van {maxCards || '…'} naar 1 en weer omhoog. Exact voorspeld = 0 strafpunten; anders 1. Minste strafpunten wint.</Text></> : <Text style={s.notice}>Cafépunten: kies het contract en vul de afgesproken punten zelf in.{game === 'kleurenwiezen' ? ' De som moet 0 zijn.' : ' Hoogste puntentotaal wint.'} Automatische contractpunten volgen zodra de huisregels vastliggen.</Text>}<Button title={busy ? 'Bezig met bewaren…' : 'Start de kaarttafel →'} disabled={busy} onPress={create} /></View>}
      {screen === 'table' && session && <>
        <View style={s.sectionTitle}><View style={{ flex: 1, gap: 8 }}><Label>{currentGame.suit} {currentGame.name.toUpperCase()} · {session.finished ? 'AFGEROND' : 'AAN TAFEL'}</Label><Text style={s.title}>{session.name}</Text><Text style={s.body}>{session.rounds.length} rondes gespeeld{!session.finished && ` · ${session.players[session.rounds.length % session.players.length]} deelt`}</Text></View></View>
        <View style={s.scoreGrid}>{session.players.map((p, i) => <View key={i} style={[s.scoreCard, scores[i] === best && session.rounds.length > 0 && s.leader]}><Text style={s.small}>{scores[i] === best && session.rounds.length > 0 ? '◆  ' : ''}{p}</Text><Text selectable style={s.score}>{scores[i] > 0 ? '+' : ''}{scores[i]}</Text><Text style={s.small}>{session.game === 'poepen' ? 'strafpunten' : 'punten'}</Text></View>)}</View>
        {!session.finished && <Button title="＋  Ronde toevoegen" onPress={() => openRound()} />}
        <View style={s.panel}><Text style={s.heading}>Het scoreblad</Text><Text style={s.small}>Punten per ronde · tik op een ronde om te corrigeren</Text>{!session.rounds.length ? <Text style={s.body}>De tafel staat klaar. Voeg de eerste ronde toe zodra de kaarten gespeeld zijn.</Text> : <ScrollView horizontal><View><View style={s.tableRow}><Text style={[s.tableLabel, s.label]}>RONDE / CONTRACT</Text>{session.players.map((p, i) => <Text key={i} style={[s.cell, s.label]}>{p}</Text>)}</View>{session.rounds.map((r, i) => <Pressable key={r.id} accessibilityRole="button" accessibilityLabel={`Wijzig ronde ${i + 1}`} onPress={() => openRound(r)} style={s.tableRow}><Text style={s.tableLabel}>{i + 1}. {r.contract}  ✎</Text>{r.points.map((p, n) => <Text selectable key={n} style={s.cell}>{p > 0 ? '+' : ''}{p}</Text>)}</Pressable>)}<View style={[s.tableRow, { backgroundColor: '#edf1e7' }]}><Text style={[s.tableLabel, { fontWeight: '700' }]}>Totaal</Text>{scores.map((p, i) => <Text key={i} style={[s.cell, { fontWeight: '700' }]}>{p}</Text>)}</View></View></ScrollView>}</View>
        {confirmFinish ? <View style={s.panel}><Text style={s.body}>Deze tafel afronden? Je kunt het scoreblad blijven bekijken, corrigeren en de tafel later heropenen.</Text><Button title="Ja, rond de tafel af" disabled={busy} onPress={() => void updateSession({ ...session, finished: true }, () => setConfirmFinish(false))} /><Button title="Verder spelen" secondary onPress={() => setConfirmFinish(false)} /></View> : <Button title={session.finished ? 'Tafel heropenen' : 'Tafel afronden'} secondary disabled={busy} onPress={() => session.finished ? void updateSession({ ...session, finished: false }) : setConfirmFinish(true)} />}
      </>}
      {screen === 'round' && session && <View style={s.panel}><Label>{editId ? 'RONDE CORRIGEREN' : 'NIEUWE RONDE'} · {roundIndex + 1}</Label><Text style={s.title}>{session.game === 'poepen' ? `${cards} ${cards === 1 ? 'kaart' : 'kaarten'} in de hand` : 'Hoe zijn de kaarten gevallen?'}</Text>{session.game !== 'poepen' ? <><Label>GESPEELD CONTRACT</Label><View style={s.chips}>{contracts[session.game].map(c => <Button key={c} title={c} secondary={contract !== c} onPress={() => setContract(c)} />)}</View><Text style={s.notice}>Vul de cafépunten volgens jullie huisregels in.{session.game === 'kleurenwiezen' && ' Alle punten samen moeten 0 zijn.'}</Text></> : <Text style={s.notice}>Vul voorspelde en behaalde slagen in. Samen moeten de behaalde slagen {cards} zijn. Elke foute voorspelling geeft 1 strafpunt.</Text>}{session.players.map((p, i) => <View key={i} style={{ gap: 8 }}><Text style={s.gameName}>{p}</Text>{session.game === 'poepen' ? <View style={s.chips}><View style={{ flex: 1 }}><Label>VOORSPELD</Label><Field label={`Voorspelling ${p}`} numeric value={bids[i]} onChangeText={v => changeValue(bids, i, v, setBids)} /></View><View style={{ flex: 1 }}><Label>BEHAALD</Label><Field label={`Slagen ${p}`} numeric value={tricks[i]} onChangeText={v => changeValue(tricks, i, v, setTricks)} /></View></View> : <Field label={`Punten ${p}, ook negatief`} numeric value={points[i]} onChangeText={v => changeValue(points, i, v, setPoints)} />}</View>)}<Button title={busy ? 'Bezig met bewaren…' : 'Bewaar ronde →'} disabled={busy} onPress={saveRound} /><Button title="Annuleren" secondary disabled={busy} onPress={back} /></View>}
      {error ? <Text accessibilityRole="alert" selectable style={s.error}>{error}</Text> : null}
      <View style={s.footer}><Text style={s.footerBrand}>♠  TroevenBoek</Text><Text style={s.small}>Gemaakt voor de Belgische kaarttafel.</Text><Text style={s.small}>Jouw toestel. Jouw punten. Jouw avond.</Text></View>
      </>}
    </ScrollView>
  </KeyboardAvoidingView>;
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.paper },
  page: { width: '100%', maxWidth: 1120, alignSelf: 'center', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? (NativeStatusBar.currentHeight ?? 24) + 16 : 24, paddingBottom: 40, gap: 24 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', paddingBottom: 18, borderBottomWidth: 1, borderColor: palette.line },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 }, logo: { width: 35, height: 40, backgroundColor: palette.green, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }, logoText: { color: '#fffdf5', fontSize: 28 },
  brandText: { fontSize: 24, fontWeight: '700', color: palette.ink, letterSpacing: -.7 }, offline: { backgroundColor: '#edf1e7', padding: 9, borderRadius: 20 }, offlineText: { color: palette.green, fontSize: 11, fontWeight: '600' },
  hero: { paddingVertical: 36, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 24 },
  heroTitle: { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontSize: 45, lineHeight: 53, color: palette.ink, letterSpacing: -1.4 }, heroBody: { fontSize: 17, lineHeight: 28, color: palette.muted, maxWidth: 480 },
  cardArt: { width: 265, height: 240, marginRight: 25, marginLeft: 20 }, playingCard: { position: 'absolute', width: 151, height: 214, borderRadius: 13, backgroundColor: '#fffdf8', padding: 16, borderWidth: 1, borderColor: '#dedfd1', boxShadow: '0 12px 24px #233e3212' }, cardCorner: { fontSize: 23, fontFamily: 'serif', color: palette.green }, largeSuit: { fontSize: 92, color: palette.green, alignSelf: 'center', marginTop: 10 },
  sectionTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }, heading: { color: palette.ink, fontSize: 23, fontWeight: '600', letterSpacing: -.5 }, title: { fontSize: 32, fontWeight: '600', color: palette.ink, letterSpacing: -.7 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: palette.muted, lineHeight: 20 }, body: { fontSize: 14, color: palette.muted, lineHeight: 23 }, small: { fontSize: 12, color: palette.muted, lineHeight: 19 },
  gameGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 }, gameCard: { flexGrow: 1, flexBasis: 260, backgroundColor: '#fffdf8', borderColor: palette.line, borderWidth: 1, borderRadius: 16, padding: 23, gap: 13 }, suitTile: { width: 53, height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 12, marginBottom: 7 }, gameName: { color: palette.ink, fontWeight: '600', fontSize: 17 }, gameBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: palette.line, paddingTop: 16, marginTop: 8 },
  empty: { borderWidth: 1, borderStyle: 'dashed', borderColor: '#d6d9cc', borderRadius: 15, padding: 32, alignItems: 'center', gap: 12 }, sessionRow: { borderWidth: 1, borderColor: palette.line, borderRadius: 14, padding: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffdf8', gap: 15 },
  tip: { backgroundColor: '#eeefe4', borderRadius: 14, padding: 23, flexDirection: 'row', gap: 18, alignItems: 'center', marginTop: 14 }, tipSymbol: { fontSize: 31, color: palette.gold }, tipTitle: { fontSize: 15, color: palette.ink, fontWeight: '600' },
  button: { backgroundColor: palette.green, paddingHorizontal: 21, paddingVertical: 15, borderRadius: 10, minHeight: 48, justifyContent: 'center', alignItems: 'center' }, buttonText: { color: '#fffef6', fontSize: 14, fontWeight: '600' }, secondary: { backgroundColor: '#eaece1' }, panel: { padding: 24, borderWidth: 1, borderColor: palette.line, borderRadius: 16, backgroundColor: '#fffdf8', gap: 18 }, input: { minHeight: 50, borderWidth: 1, borderColor: '#d5dacd', borderRadius: 9, padding: 14, color: palette.ink, backgroundColor: '#fffefb', fontSize: 16 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, notice: { backgroundColor: '#f3f0e5', color: '#706344', padding: 15, borderRadius: 10, lineHeight: 23, fontSize: 14 }, back: { color: palette.green, paddingVertical: 8, fontWeight: '600' },
  scoreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, scoreCard: { flex: 1, minWidth: 125, borderWidth: 1, borderColor: palette.line, padding: 20, borderRadius: 13, backgroundColor: '#fffdf8', gap: 8 }, leader: { backgroundColor: '#eaf0e4', borderColor: '#bac9af' }, score: { fontSize: 36, color: palette.ink, fontWeight: '600', fontVariant: ['tabular-nums'] }, tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: palette.line, paddingVertical: 15, alignItems: 'center' }, tableLabel: { width: 200, paddingHorizontal: 8, color: palette.ink, fontSize: 13 }, cell: { width: 95, textAlign: 'center', color: palette.ink, fontSize: 14, fontVariant: ['tabular-nums'] }, error: { color: '#a33a2d', backgroundColor: '#fbe9e3', padding: 18, borderRadius: 10, lineHeight: 23 },
  footer: { alignItems: 'center', gap: 8, paddingTop: 35, marginTop: 12, borderTopWidth: 1, borderColor: palette.line }, footerBrand: { color: palette.green, fontWeight: '700', fontSize: 16 },
});
