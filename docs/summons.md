# Owner-Aware Summons

The add-on manages summoned allies as owner-bound groups rather than as untracked entities. Runtime maps and owner identifiers associate each summon with the player who created it, allowing the scripts to follow, defend, target hostiles, replace prior groups, and remove entities during cleanup.

## Vampire Troops

**Summon Vampire Troops** creates up to three custom `myname:vampire_troops` allies. The group follows and defends its owner, seeks hostile targets within the scripted aggro range, and uses troop-specific movement and fang/magic attack behavior. Recasting replaces the owner's current troop group; the implementation tracks the group separately for each player and charges the configured Vampire plasma cost.

## Necromancy skeleton troops

The Witch subclass's **Necromancy** ability creates up to three custom `myname:skeleton_troop` allies. These skeletons are tagged and tracked as protected allies of their summoner, follow and defend that owner, and are cleaned up when replaced, dismissed, invalidated, or expired by the managed lifetime logic.

## Roar wolves

The Werewolf **Roar** ability creates three temporary vanilla wolf allies. They are also stored against the owning player so the add-on can remove the correct group on replacement or cleanup; their scripted duration is one minute.

## Cleanup and safety

Owner-aware cleanup runs when class state changes, when the player leaves or becomes invalid, and when a new group replaces an existing one. This prevents one player's summons from being mistaken for another player's allies and prevents stale entities from accumulating across morph, rebirth, or class-reset flows.

