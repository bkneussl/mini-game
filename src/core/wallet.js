// Geteiltes Konto: "Goldene Gummienten". Start 1.000, persistiert in localStorage.

const KEY = "casino_ducks";
export const START_DUCKS = 1000;

export function createWallet() {
  let balance = load();

  function load() {
    const raw = localStorage.getItem(KEY);
    if (raw === null) {
      save(START_DUCKS);
      return START_DUCKS;
    }
    const v = Math.floor(Number(raw));
    return Number.isFinite(v) && v >= 0 ? v : START_DUCKS;
  }

  function save(v) {
    localStorage.setItem(KEY, String(Math.floor(v)));
  }

  return {
    get() {
      return balance;
    },
    set(v) {
      balance = Math.max(0, Math.floor(v));
      save(balance);
      return balance;
    },
    add(n) {
      balance = Math.max(0, balance + Math.floor(n));
      save(balance);
      return balance;
    },
    // Zieht n ab, wenn genug da ist. true = erfolgreich.
    trySpend(n) {
      n = Math.floor(n);
      if (n <= 0) return true;
      if (balance < n) return false;
      balance -= n;
      save(balance);
      return true;
    },
  };
}
