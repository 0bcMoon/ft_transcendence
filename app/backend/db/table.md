# Database Tables & Example Data

---

## **users**

| id | username |
|----|---------|
| 1  | alice   |
| 2  | bob     |
| 3  | eve     |

---

## **games**

| id | mode   | status   | winner_id | started_at           | ended_at             | created_at           |
|----|--------|----------|-----------|----------------------|----------------------|----------------------|
| 1  | remote | finished | 1         | 2025-10-05 21:00:00  | 2025-10-05 21:30:00  | 2025-10-05 20:59:50  |
| 2  | ai     | finished | 2         | 2025-10-04 18:00:00  | 2025-10-04 18:15:00  | 2025-10-04 17:59:55  |
| 3  | local  | cancelled| NULL      | 2025-10-03 15:00:00  | 2025-10-03 15:05:00  | 2025-10-03 14:59:52  |

---

## **game_players**

| id | game_id | user_id | position | score | is_ai | joined_at           |
|----|---------|---------|----------|-------|-------|---------------------|
| 1  | 1       | 1       | 1        | 10    | 0     | 2025-10-05 21:00:01 |
| 2  | 1       | 2       | 2        | 6     | 0     | 2025-10-05 21:00:02 |
| 3  | 2       | NULL    | 1        | 12    | 1     | 2025-10-04 18:00:01 |
| 4  | 2       | 2       | 2        | 9     | 0     | 2025-10-04 18:00:02 |
| 5  | 3       | 3       | 1        | 4     | 0     | 2025-10-03 15:00:01 |

---

## **tournaments**

| id | name        | status      | winner_id | max_players | current_round | started_at           | ended_at             | created_at           |
|----|-------------|-------------|-----------|-------------|--------------|----------------------|----------------------|----------------------|
| 1  | Autumn Cup  | finished    | 1         | 8           | 3            | 2025-10-01 12:00:00  | 2025-10-05 21:45:00  | 2025-09-29 10:00:00  |
| 2  | Winter Show | registration| NULL      | 16          | 1            | NULL                 | NULL                 | 2025-10-05 22:00:00  |

---

## **tournament_players**

| id | tournament_id | user_id | alias      | status     | registered_at         |
|----|--------------|---------|------------|------------|-----------------------|
| 1  | 1            | 1       | "Alice"    | winner     | 2025-09-29 10:05:00   |
| 2  | 1            | 2       | "Bobster"  | eliminated | 2025-09-29 10:06:00   |
| 3  | 2            | 3       | "Evester"  | active     | 2025-10-05 22:01:00   |

---

## **tournament_games**

| id | tournament_id | game_id | round | match_order | created_at           |
|----|--------------|---------|-------|-------------|----------------------|
| 1  | 1            | 1       | 3     | 2           | 2025-10-05 21:00:00  |
| 2  | 1            | 2       | 2     | 1           | 2025-10-04 18:00:00  |
| 3  | 1            | 3       | 1     | 1           | 2025-10-03 15:00:00  |

---

## **How these tables work together**

- **games**: Each row is a game/match.  
- **game_players**: Each row links a user (or AI) to a game, giving their role/score.  
- **tournaments**: Each row is a tournament event.  
- **tournament_players**: Each row links a user to a tournament, records their alias/status.  
- **tournament_games**: Each row links a game to a tournament and identifies its round/order.

### **Example: Alice wins a tournament match**
- Alice (`user_id=1`) and Bob (`user_id=2`) play a remote game (`games.id=1`).
- Both are listed in `game_players` for that game.
- That game is part of the "Autumn Cup" (`tournament_games.tournament_id=1`).
- Alice is set as the winner in both `games.winner_id` and `tournaments.winner_id`.
- Bob is marked as eliminated in `tournament_players`.

---

# **Visual Summary**

- **users**: Master list of users.
- **games**: All matches played.
- **game_players**: Who played in each match and their scores.
- **tournaments**: Event meta-info.
- **tournament_players**: Who joined each event and their tournament status.
- **tournament_games**: Which matches belong to which tournament and round.

