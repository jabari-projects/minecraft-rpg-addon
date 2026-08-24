# RPG Classes and Subclasses

RPG Classes and Subclasses lets survival players combine a supernatural class, a combat subclass, and shared public skills to create persistent character builds. Players earn XP, unlock active abilities and passives through an in-game Guidebook, transform into custom morphs, command summons, and equip class-themed gear while continuing to play the normal Minecraft survival loop.

The current build includes four primary classes (Vampire, Werewolf, Banshee, and Human), five combat subclasses (Warrior, Ninja, Witch, Archer, and Tank), custom ability items, skill-tree progression, morphs, owner-aware summons, projectiles, armor, weapons, spells, cooldowns, and persistent character state.

## Repository layout

```text
behavior_pack/  Bedrock behavior definitions, functions, items, entities, and Script API modules
resource_pack/  Client entities, geometry, render controllers, textures, animations, and UI
blockbench/     Editable Blockbench source models and associated source textures
docs/           Gameplay and systems documentation
```

## Installation

This repository contains the editable source for both dependent packs. Keep `behavior_pack/` and `resource_pack/` together; the behavior-pack manifest declares the resource-pack dependency and the Script API modules used by the add-on.

For development, copy each pack into the matching Minecraft Bedrock development-pack directory, then activate both packs on a test world. Do not move files out of their pack folders: manifests, entity definitions, textures, geometry, and scripts rely on their current relative paths.

## Importing into Minecraft Bedrock

1. Create a ZIP archive that contains `behavior_pack/` and `resource_pack/` at its archive root.
2. Rename the archive extension from `.zip` to `.mcaddon`.
3. Open the `.mcaddon` file with Minecraft Bedrock and allow it to import both packs.
4. Create or edit a world, activate **RPG Classes and Subclasses** under Behavior Packs and **RPG Classes and Subclasses Resources** under Resource Packs, then enter the world.

## Experimental features

The behavior pack declares `@minecraft/server` and `@minecraft/server-ui` modules, so enable **Beta APIs** in the world's Experiments menu before loading the add-on. If the installed Bedrock version presents additional Script API or creator-experiment toggles, enable the required API option for the build and accept Minecraft's experimental-world warning.

## Documentation

- [Abilities](docs/abilities.md)
- [Classes](docs/classes.md)
- [Morphs](docs/morphs.md)
- [Summons](docs/summons.md)
- [Systems](docs/systems.md)

## Future Roadmap

The next work is release polish rather than new gameplay claims: balance and onboarding review, multiplayer and long-session testing, and device QA across mobile, console, and desktop. Planned production work also includes accessibility and localization review, a clean in-game screenshot and gameplay-reel pass, marketing assets, and Marketplace-readiness validation.

