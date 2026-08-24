# Abilities

This page documents the skills and usable systems implemented in the current behavior-pack scripts. Active abilities are granted as class or subclass ability items through the Guidebook; passive and repeatable skills are tracked through the same progression system.

## Public skills

- **Parkourist** — A toggleable passive that grants 50% sprint speed and a single-press two-block jump.
- **Second Life** — Prevents one lethal hit, restores health and hunger, then starts a five-minute cooldown.
- **Adrenaline** — A toggleable low-health passive that grants 50% movement speed and double melee damage at five hearts or lower.
- **HP Regen** — A toggleable out-of-combat regeneration passive that activates after five seconds without damage.
- **XP Boost** — A toggleable passive that increases XP gained when Minecraft levels are synchronized into the RPG progression system by 20%.
- **Luck** — A three-tier repeatable passive with increasing bonus-loot chances from killed entities.

## Vampire skills

- **Vampire Fangs** — Baseline fangs that feed on valid targets and trigger the Vampire feeding effects.
- **Blood Thirst** — Passive fang enhancement that restores additional plasma, steals life, and emits feedback effects.
- **Midnight Strength** — Passive 50% movement-speed and double-melee-damage bonus at night, in the Nether or End, or during Overworld thunderstorms.
- **Bat Morph** — See [Morphs](morphs.md); grants a responsive bat form with flight-oriented movement.
- **Summon Vampire Troops** — Creates a managed group of three allied vampire troops; see [Summons](summons.md).
- **Compel** — Ultimate targeting ability that spends 50 plasma to compel a targeted mob or player to die instantly.
- **Sun Immunity** — Final, toggleable Vampire skill unlocked only after all other Vampire skills, including Compel, are learned.

## Werewolf skills

- **Werewolf Fangs** — Baseline fangs that poison targets and apply bonus damage.
- **Roar** — Summons three temporary vanilla wolf allies for one minute.
- **Shadow Wolf Morph** — See [Morphs](morphs.md); transforms the player into the stronger Shadow Wolf form.
- **Lycan Vitality** — Five-tier repeatable passive that adds one heart per tier outside Shadow Wolf form.
- **Scent** — Ultimate passive that causes hostile mobs to ignore the Werewolf until the player provokes them.

## Banshee skills

- **Sonic Scream** — Area-of-effect scream that costs one heart.
- **Banshee Invisibility** — Persistent invisibility toggle.
- **Banshee Phase** — Persistent toggle that passes only through valid horizontal walls with open air behind them.
- **Banshee Morph** — See [Morphs](morphs.md); creates the spectral Banshee form.
- **Mind Fracture** — Toggleable passive that applies nausea through Banshee hits and Sonic Scream targets.
- **Soul** — Ultimate passive: Sonic Scream kills restore the Banshee to full health.

## Human

- **Human Adaptability** — The Human primary class has no primary active ability set; it is the baseline identity for public skills and subclass progression.

## Subclass skills

### Warrior

- **Switch Throw** — Throws weapon energy forward, then returns it in a boomerang-style path.
- **Tenacity Charge** — Short dash that damages along the path and grants brief resistance.
- **Third Hit Double Damage** — Passive that applies bonus true damage on every third melee hit.

### Ninja

- **Ninja Agility** — Five-tier repeatable sprint-speed passive.
- **Multi-Jump** — Three-tier repeatable skill that provides up to three extra mid-air jumps and fall immunity until landing after an extra jump.
- **Dagger Throw** — Fast projectile that damages and withers the target.
- **Strikethrough** — Dash-through attack that damages targets and applies brief weakness.
- **Smoke Bomb** — Creates a smoke screen, grants invisibility and speed, and blinds nearby non-player entities.

### Witch

- **Spell Mastery** — Passive that increases spell damage by 20%, reduces spell cooldowns by 20%, and removes the bottle penalty.
- **Necromancy** — Creates a managed group of three protected skeleton troops; see [Summons](summons.md).
- **Staff Mastery** — Passive that increases Staff of Destruction damage by 20%.

### Archer

- **Chain Lightning** — Repeatable bow skill whose arrow hits arc to 4, 8, or 12 nearby enemies by tier, applying lightning feedback, damage, and knockback.
- **Crit Focus** — Five-tier bow critical-chance passive, increasing to 100%; critical hits deal direct double damage.
- **Levitate** — Two-tier arrow effect that levitates targets for one or two seconds.
- **Explosive Arrows** — Creates a non-block-breaking blast on arrow impact that damages and knocks back entities.

### Tank

- **Shield Slam** — Area-of-effect ground slam that applies weakness.
- **Fortify** — Temporary resistance and absorption.
- **Taunt** — Aggro pulse that marks and provokes nearby mobs.

## Spell and weapon systems

- **Fire Bomb** — Area fire burst that damages nearby non-player entities, applies wither, and grants the user fire resistance.
- **Ice Bomb** — Area freezing burst that damages nearby non-player entities and applies slowness.
- **Poison Bomb** — Area magic burst that damages nearby non-player entities and applies poison.
- **Staff of Destruction** — Cycles world time on normal use and weather while sneaking. Witches use it without the non-Witch health penalty; Staff Mastery increases its melee damage.

