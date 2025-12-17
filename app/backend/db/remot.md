# Remote 1v1 Match - Database Example

## Starting State - player_stats table

| id | user_id | elo_rating | rank | wins | losses |
|----|---------|------------|------|------|--------|
| 1  | 10      | 1100       | Silver | 15 | 10 |
| 2  | 20      | 1200       | Gold   | 25 | 15 |

**Players:**
- Alice (user_id: 10) - 1100 ELO (Silver)
- Bob (user_id: 20) - 1200 ELO (Gold)

---

## Match: Alice vs Bob (Game ID: 201)

**Game Mode:** Remote 1v1  
**Result:** Alice wins 11-8 (UPSET!) 🔥

---

## ELO Calculation

**Bob (1200) is favored over Alice (1100)**

```
Expected win chance for Alice = 1 / (1 + 10^((1200-1100)/400))
                               = 1 / (1 + 10^(0.25))
                               = 1 / (1 + 1.78)
                               = 36% chance to win

Expected win chance for Bob = 64% chance to win
```

**Alice wins (upset!):**
```
K-factor = 24

Alice ELO change = 24 × (1 - 0.36) = 24 × 0.64 = 15.36 ≈ +15
Bob ELO change = 24 × (0 - 0.64) = 24 × -0.64 = -15.36 ≈ -15
```

---

## After Match - player_stats table

| id | user_id | elo_rating | rank | wins | losses |
|----|---------|------------|------|------|--------|
| 1  | 10      | **1115** ⬆️ | Silver | **16** | 10 |
| 2  | 20      | **1185** ⬇️ | Silver | 25 | **16** |

**Changes:**
- ✅ Alice gained +15 ELO (1100 → 1115)
- ❌ Bob lost -15 ELO (1200 → 1185) and dropped from Gold to Silver!

---

## elo_history table (new entries)

| id | user_id | game_id | elo_change | new_elo | result | created_at |
|----|---------|---------|------------|---------|--------|------------|
| 1  | 10      | 201     | +15        | 1115    | win    | 2024-12-15 16:30:00 |
| 2  | 20      | 201     | -15        | 1185    | loss   | 2024-12-15 16:30:00 |

---

## Another Example: Equal Players

### Starting State

| id | user_id | elo_rating | rank | wins | losses |
|----|---------|------------|------|------|--------|
| 3  | 30      | 1000       | Silver | 10 | 10 |
| 4  | 40      | 1000       | Silver | 12 | 12 |

**Players:**
- Carol (user_id: 30) - 1000 ELO
- Dave (user_id: 40) - 1000 ELO

---

## Match: Carol vs Dave (Game ID: 202)

**Result:** Carol wins 11-9

### ELO Calculation (Equal players)

```
Both have 50% win chance

Carol ELO change = 24 × (1 - 0.5) = 24 × 0.5 = +12
Dave ELO change = 24 × (0 - 0.5) = 24 × -0.5 = -12
```

---

## After Match - player_stats table

| id | user_id | elo_rating | rank | wins | losses |
|----|---------|------------|------|------|--------|
| 3  | 30      | **1012** ⬆️ | Silver | **11** | 10 |
| 4  | 40      | **988** ⬇️  | Bronze | 12 | **13** |

**Changes:**
- ✅ Carol gained +12 ELO (1000 → 1012)
- ❌ Dave lost -12 ELO (1000 → 988) and dropped to Bronze!

---

## elo_history table (updated)

| id | user_id | game_id | elo_change | new_elo | result | created_at |
|----|---------|---------|------------|---------|--------|------------|
| 1  | 10      | 201     | +15        | 1115    | win    | 2024-12-15 16:30:00 |
| 2  | 20      | 201     | -15        | 1185    | loss   | 2024-12-15 16:30:00 |
| 3  | 30      | 202     | +12        | 1012    | win    | 2024-12-15 16:45:00 |
| 4  | 40      | 202     | -12        | 988     | loss   | 2024-12-15 16:45:00 |

---

## Summary: Remote 1v1

### How it works:
1. Two players match online
2. They play a ping pong match
3. After match ends:
   - Calculate ELO change based on ratings
   - Winner gains ELO ⬆️
   - Loser loses ELO ⬇️
4. Update `player_stats` table
5. Insert 2 entries into `elo_history` table
6. Update ranks if needed

### ELO Changes:
- **Equal players (1000 vs 1000):** ±12 points
- **Small difference (1100 vs 1000):** ±9 points  
- **Medium difference (1100 vs 1200):** ±15 points
- **Big difference (1400 vs 1000):** ±23 points
- **Huge difference (1600 vs 900):** ±30 points

### Important:
- Local games = **NO ELO change** (just for fun)
- Remote 1v1 = **ELO system applies**
- Tournament = **ELO system applies per match**
