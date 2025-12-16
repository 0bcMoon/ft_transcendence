# Simple ELO Rating System

## Database Tables

```sql
-- Player stats table
CREATE TABLE IF NOT EXISTS player_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    elo_rating INTEGER DEFAULT 1000 NOT NULL,
    rank TEXT DEFAULT 'Silver' NOT NULL,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ELO history table
CREATE TABLE IF NOT EXISTS elo_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    game_id INTEGER,
    elo_change INTEGER NOT NULL,
    new_elo INTEGER NOT NULL,
    result TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_player_stats_elo ON player_stats(elo_rating DESC);
CREATE INDEX idx_elo_history_user ON elo_history(user_id);

-- Auto-create stats for new users
CREATE TRIGGER create_player_stats_on_user_insert
AFTER INSERT ON users
BEGIN
    INSERT INTO player_stats (user_id) VALUES (NEW.id);
END;
```

---

## Ranks

| Rank | ELO Range |
|------|-----------|
| 🥉 Bronze | 0 - 999 |
| 🥈 Silver | 1000 - 1199 |
| 🥇 Gold | 1200 - 1399 |
| 💎 Platinum | 1400 - 1599 |
| 👑 Master | 1600+ |

**Everyone starts at 1000 ELO (Silver rank)**

---

## How ELO Works

### Simple Rule:
- **Win** = gain ELO points (+10 to +30)
- **Lose** = lose ELO points (-10 to -30)
- Amount depends on opponent's rating

### The Magic Formula:
```
Beat higher-rated player = gain MORE points
Beat lower-rated player = gain LESS points

Lose to lower-rated player = lose MORE points
Lose to higher-rated player = lose LESS points
```

---

## 4-Player Tournament Example

### Starting Ratings:

| Player | Starting ELO | Rank |
|--------|--------------|------|
| Alice | 1100 | Silver |
| Bob | 1000 | Silver |
| Carol | 1150 | Silver |
| Dave | 950 | Bronze |

---

### Tournament Bracket:
```
Semi-Finals:
  Match 1: Alice (1100) vs Bob (1000)
  Match 2: Carol (1150) vs Dave (950)

Final:
  Winner Match 1 vs Winner Match 2
```

---

## Step-by-Step ELO Changes

### Round 1 - Semi-Finals

**Match 1: Alice (1100) vs Bob (1000)**
- Alice is favored (higher ELO)
- **Alice WINS**
  - Alice: 1100 + 13 = **1113 ELO**
  - Bob: 1000 - 13 = **987 ELO** (goes down to Bronze!)

**Match 2: Carol (1150) vs Dave (950)**
- Carol is heavily favored (200 point difference)
- **Dave WINS** (UPSET! 🔥)
  - Dave: 950 + 27 = **977 ELO** (still Bronze but rising!)
  - Carol: 1150 - 27 = **1123 ELO** (loses points from upset)

---

### Round 2 - Finals

**Final: Alice (1113) vs Dave (977)**
- Alice is favored
- **Alice WINS**
  - Alice: 1113 + 15 = **1128 ELO** ✨
  - Dave: 977 - 15 = **962 ELO**

---

## Final Results

| Player | Start ELO | End ELO | Change | Final Rank | Placement |
|--------|-----------|---------|--------|------------|-----------|
| Alice | 1100 | **1128** | +28 | Silver | 🥇 Champion |
| Dave | 950 | **962** | +12 | Bronze | 🥈 Runner-up |
| Carol | 1150 | **1123** | -27 | Silver | Lost Semi |
| Bob | 1000 | **987** | -13 | Bronze | Lost Semi |

---

## Key Insights

### Alice (Champion):
- Won 2 matches
- Gained **+28 ELO total**
- Still Silver rank (needs 1200 for Gold)

### Dave (Runner-up):
- Won 1, lost 1
- **Still gained +12 ELO!** (because he beat Carol, higher rated player)
- Great performance even though he lost finals

### Carol (Semi-finalist):
- Lost 1 match
- **Lost -27 ELO** (upset loss to Dave hurt badly!)
- This is the ELO system working - upsets matter!

### Bob (Semi-finalist):
- Lost 1 match
- Lost -13 ELO (expected loss to Alice)
- Fair penalty

---

## Why This System is Better

**Old XP System:**
- Alice: +150 XP (always positive)
- Dave: +50 XP (always positive)
- Carol: +50 XP (always positive)
- Bob: 0 XP

Everyone except Bob goes up! Not competitive.

**ELO System:**
- Alice: +28 (won, deserves it)
- Dave: +12 (won upset, deserves it)
- Carol: -27 (lost upset, deserves penalty)
- Bob: -13 (lost, deserves penalty)

Only winners gain rating! True competition. ✅

---

## For Remote 1v1 Games

Same system! After each online match:

**Example:**
- Player 1 (1050 ELO) vs Player 2 (1150 ELO)
- Player 1 WINS (upset!)
  - Player 1: 1050 + 21 = **1071 ELO**
  - Player 2: 1150 - 21 = **1129 ELO**

---

## Simple Summary

1. Everyone starts at **1000 ELO**
2. **Win** = gain points, **Lose** = lose points
3. Amount depends on opponent's rating
4. Your rank reflects your **true skill**, not just playtime
5. **Local games** = no ELO change (just for fun)
---------------------------------------------------------------------------------

Alice's expected win chance = 1 / (1 + 10^((1000 - 1100) / 400))
                            = 1 / (1 + 10^(-0.25))
                            = 1 / (1 + 0.56)
                            = 1 / 1.56
                            = 0.64 (64% chance to win)

Bob's expected win chance = 1 - 0.64 = 0.36 (36% chance to win)
