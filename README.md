# The Brass Ledger Heist

Mara Voss has one night to steal the Brass Ledger from the Meridian Gallery.
A top-down stealth heist game: cross three rooms unseen, read the guards'
vision cones, time the sweeping cameras, dodge lasers and tripwires, grab the
loot, and reach the getaway.

## Play

Serve the game and open it in a desktop browser:

```
node serve.ts
# open http://localhost:8080
```

## Controls

- WASD / Arrows — move
- Shift — sneak (slower, harder to spot)
- E — grab the loot (stand close to the glowing target)
- Q — smoke bomb, 1 per room (blocks vision for 4s)
- F — EMP the nearest camera, 1 per room (off for 8s, +10 alarm)
- C — toss a coin to lure the nearest guard
- P / Esc — pause · M — mute · R — restart room
- Mouse — pick a room on the title screen

## Rules

- Being seen inside a guard or camera cone fills suspicion. At 100% a
  3-second grace window opens: break line of sight and hide, or you are caught.
- The alarm meter rises on spots, lasers and tripwires; higher alarm means
  faster guards. Shadow zones are safe; lamp pools are exposed.
- Grab the loot, then reach the green exit. Finish with no alarms for GHOST.

## Rooms

1. Gallery Hall — two guards, one camera.
2. Vault Floor — three guards, two cameras, lasers, a tripwire.
3. Rooftop Getaway — three guards, two cameras, laser, tripwire, the van.

Built for make.fun competition `best-heist-game-20261122-0559`. All art, names
and sounds are original; sounds are WebAudio bleeps, no audio files.
