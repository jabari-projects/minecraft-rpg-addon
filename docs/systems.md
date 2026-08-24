# Core Systems

## XP progression and the Guidebook

The in-game Guidebook is the player-facing interface for class selection, subclass selection, skill purchases, toggles, ability items, and help content. The Script API synchronizes Minecraft XP levels into scoreboard-backed `xp_total`, `xp_spent`, and `xp_available` values; the XP Boost public skill increases newly synchronized gains by 20%. Skill nodes can require XP, prerequisite skills, prerequisite repeatable tiers, or class/subclass ownership, and selected skills can be active, passive, repeatable, or toggleable.

## Persistent state

The behavior pack initializes and maintains scoreboards for primary class, subclass, skill ownership, ability slots, morph state, plasma, XP, cooldowns, toggle state, and other compatibility values. Runtime maps complement those persistent values for short-lived behavior such as projectiles, summon groups, phase movement, animation/presentation state, and cooldown guards.

## Cooldowns

Cooldowns are stored as named scoreboard objectives and presented through the ability system. The project uses independent timers for morphs, spells, subclass actions, Tank abilities, Archer effects, and the Staff of Destruction, while special mechanics such as Second Life and Adrenaline use dedicated runtime timing. The implementation prevents recasting an active or cooling-down ability and cleans transient state when needed.

## Class resources and costs

Vampires use a plasma resource with a default maximum of 100. Feeding and Blood Thirst can restore plasma; Vampire Troops use plasma on summon and Compel costs 50 plasma. The full Vampire armor set blocks plasma drain and regenerates plasma over time, while sunlight protection is supplied by the armor system or the final Sun Immunity skill. Other intentional trade-offs include Sonic Scream's health cost and the non-Witch health penalty for spell bottles and the Staff of Destruction.

## Armor, effects, and technical presentation

Custom armor, attachables, resource-pack geometry, animations, render controllers, and UI work alongside the behavior scripts. The Vampire set supplies helmet-based night vision and full-set sunlight/plasma benefits; Guardian equipment and the Witch Hat provide additional class-themed visual equipment. Morphs, custom troops, projectiles, spell feedback, and selected player FX are coordinated through the resource pack and the Script API event/tick systems.

