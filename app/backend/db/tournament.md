# 4-Player Tournament - Database Example

## Starting State - player_stats table

| id | user_id | elo_rating | rank | wins | losses |
|----|---------|------------|------|------|--------|
| 1  | 10      | 1100       | Silver | 15 | 10 |
| 2  | 20      | 1000       | Silver | 12 | 12 |
| 3  | 30      | 1150       | Silver | 18 | 8 |
| 4  | 40      | 950        | Bronze | 8 | 15 |

**Players:**
- Alice (user_id: 10) - 1100 ELO
- Bob (user_id: 20) - 1000 ELO
- Carol (user_id: 30) - 1150 ELO
- Dave (user_id: 40) - 950 ELO

---

## Tournament Bracket

```
Semi-Finals:
  Game 101: Alice (1100) vs Bob (1000)
  Game 102: Carol (1150) vs Dave (950)

Final:
  Game 103: Winner vs Winner
```

---

## Match 1: Alice vs Bob (Game ID: 101)

**Result: Alice wins 11-7**

### ELO Calculation:
- Alice expected to win 64%
- ELO change: ±9 points

### After Match 1 - player_stats table:

| id | user_id | elo_rating | rank | wins | losses |
|----|---------|------------|------|------|--------|
| 1  | 10      | **1109** ⬆️ | Silver | **16** | 10 |
| 2  | 20      | **991** ⬇️  | Bronze | 12 | **13** |
| 3  | 30      | 1150       | Silver | 18 | 8 |
| 4  | 40      | 950        | Bronze | 8 | 15 |

### elo_history table (new entries):

| id | user_id | game_id | elo_change | new_elo | result | created_at |
|----|---------|---------|------------|---------|--------|------------|
| 1  | 10      | 101     | +9         | 1109    | win    | 2024-12-15 14:30:00 |
| 2  | 20      | 101     | -9         | 991     | loss   | 2024-12-15 14:30:00 |

---

## Match 2: Carol vs Dave (Game ID: 102)

**Result: Dave wins 11-9 (UPSET!)** 🔥

### ELO Calculation:
- Carol expected to win 85%
- ELO change: ±27 points (big upset!)

### After Match 2 - player_stats table:

| id | user_id | elo_rating | rank | wins | losses |
|----|---------|------------|------|------|--------|
| 1  | 10      | 1109       | Silver | 16 | 10 |
| 2  | 20      | 991        | Bronze | 12 | 13 |
| 3  | 30      | **1123** ⬇️ | Silver | 18 | **9** |
| 4  | 40      | **977** ⬆️  | Bronze | **9** | 15 |

### elo_history table (new entries):

| id | user_id | game_id | elo_change | new_elo | result | created_at |
|----|---------|---------|------------|---------|--------|------------|
| 1  | 10      | 101     | +9         | 1109    | win    | 2024-12-15 14:30:00 |
| 2  | 20      | 101     | -9         | 991     | loss   | 2024-12-15 14:30:00 |
| 3  | 30      | 102     | -27        | 1123    | loss   | 2024-12-15 14:45:00 |
| 4  | 40      | 102     | +27        | 977     | win    | 2024-12-15 14:45:00 |

---

## Match 3: Alice vs Dave - FINAL (Game ID: 103)

**Result: Alice wins 11-5**

### ELO Calculation:
- Alice (1109) vs Dave (977)
- Alice expected to win 69%
- ELO change: ±8 points

### FINAL - player_stats table:

| id | user_id | elo_rating | rank | wins | losses |
|----|---------|------------|------|------|--------|
| 1  | 10      | **1117** ⬆️ | Silver | **17** | 10 |
| 2  | 20      | 991        | Bronze | 12 | 13 |
| 3  | 30      | 1123       | Silver | 18 | 9 |
| 4  | 40      | **969** ⬇️  | Bronze | 9 | **16** |

### FINAL - elo_history table:

| id | user_id | game_id | elo_change | new_elo | result | created_at |
|----|---------|---------|------------|---------|--------|------------|
| 1  | 10      | 101     | +9         | 1109    | win    | 2024-12-15 14:30:00 |
| 2  | 20      | 101     | -9         | 991     | loss   | 2024-12-15 14:30:00 |
| 3  | 30      | 102     | -27        | 1123    | loss   | 2024-12-15 14:45:00 |
| 4  | 40      | 102     | +27        | 977     | win    | 2024-12-15 14:45:00 |
| 5  | 10      | 103     | +8         | 1117    | win    | 2024-12-15 15:00:00 |
| 6  | 40      | 103     | -8         | 969     | loss   | 2024-12-15 15:00:00 |

---

## Tournament Summary

| Player | Start ELO | End ELO | Total Change | Wins | Losses | Placement |
|--------|-----------|---------|--------------|------|--------|-----------|
| Alice  | 1100      | **1117** | **+17** ⬆️ | 2 | 0 | 🥇 Champion |
| Dave   | 950       | **969**  | **+19** ⬆️ | 1 | 1 | 🥈 Runner-up |
| Carol  | 1150      | **1123** | **-27** ⬇️ | 0 | 1 | Semi-final |
| Bob    | 1000      | **991**  | **-9** ⬇️  | 0 | 1 | Semi-final |

---

## Key Insights

✅ **Alice (Champion)** - Won 2 matches, gained +17 ELO
✅ **Dave (Runner-up)** - Won 1, lost 1, but still gained +19 ELO! (upset win helped)
❌ **Carol** - Lost 1 match to Dave (upset), lost -27 ELO (biggest penalty)
❌ **Bob** - Lost to Alice, lost -9 ELO

**Dave gained more ELO than Alice even though he lost the final!** This shows how upsets work in ELO - beating a higher-rated player matters a lot!
