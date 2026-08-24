# Morphs

Morphs are persistent class abilities represented by dedicated ability items and a scoreboard-backed `morph_state`. The system clears or replaces existing morph state before applying another form and synchronizes the related presentation entities, effects, movement behavior, and cleanup state.

## Bat Morph

**Class:** Vampire  
**Unlock:** Bat Morph

Bat Morph gives the Vampire responsive flight-oriented movement, slow fall, night vision, and hostile-mob ignore behavior. The ability uses the shared morph cooldown and has an eight-second recast cooldown.

## Shadow Wolf Morph

**Class:** Werewolf  
**Unlock:** Shadow Wolf Morph

Shadow Wolf Morph applies the Werewolf's enhanced combat form: ten additional hearts, strength, jump, resistance, night vision, speed, and immunity to the form's water-weakness handling. Its presentation is synchronized through the Shadow Wolf morph placeholder/mimic system, and it uses the shared eight-second morph cooldown.

## Banshee Morph

**Class:** Banshee  
**Unlock:** Banshee Morph

Banshee Morph creates a translucent spectral form with slow fall, jump-held levitation, night vision, and damage immunity. It is distinct from Banshee Invisibility and Banshee Phase: those are separate persistent ability toggles, while the morph manages the class's ghost-form movement and presentation. It also uses the shared eight-second morph cooldown.

