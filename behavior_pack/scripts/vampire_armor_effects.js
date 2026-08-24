import { EquipmentSlot, system, world } from "@minecraft/server";

const ARMOR = Object.freeze({
  helmet: "myname:vamp_helmet",
  chest: "myname:vamp_chestplate",
  legs: "myname:vamp_leggings",
  feet: "myname:vamp_boots"
});

const ARMOR_SUN_IMMUNITY = "sun_immunity_armor";
const PLASMA_DRAIN_BLOCKED = "plasma_drain_blocked";
const MANAGED_NIGHT_VISION_TAG = "mwr_vampire_night_vision_active";
const VAMPIRE_CLASS_ID = 1;
const WEREWOLF_CLASS_ID = 2;
const BAT_MORPH_ID = 1;
const SHADOW_WOLF_MORPH_ID = 2;
const NIGHT_VISION_DURATION = 720000;
const NIGHT_VISION_REFRESH_TICKS = 200;
const PLASMA_REGEN_TICKS = 20;
const armorStates = new Map();

function getScore(player, objectiveName) {
  try {
    const objective = world.scoreboard.getObjective(objectiveName);
    const identity = player.scoreboardIdentity;
    return objective && identity ? (objective.getScore(identity) ?? 0) : 0;
  } catch {
    return 0;
  }
}

function setScore(player, objectiveName, value) {
  try {
    const objective = world.scoreboard.getObjective(objectiveName);
    const identity = player.scoreboardIdentity;
    if (objective && identity) objective.setScore(identity, Math.floor(value));
  } catch {}
}

function setBooleanProperty(player, name, value) {
  try {
    if (player.getDynamicProperty(name) !== value) player.setDynamicProperty(name, value);
  } catch {}
}

function getEquippedTypeId(player, slot) {
  try {
    return player.getComponent("minecraft:equippable")?.getEquipment(slot)?.typeId;
  } catch {
    return undefined;
  }
}

export function isVampirePlayer(player) {
  return player?.typeId === "minecraft:player" && getScore(player, "class_primary") === VAMPIRE_CLASS_ID;
}

export function hasVampireHelmetEquipped(player) {
  return isVampirePlayer(player) && getEquippedTypeId(player, EquipmentSlot.Head) === ARMOR.helmet;
}

export function hasVampireArmorSetEquipped(player) {
  if (!isVampirePlayer(player)) return false;
  return getEquippedTypeId(player, EquipmentSlot.Chest) === ARMOR.chest &&
    getEquippedTypeId(player, EquipmentSlot.Legs) === ARMOR.legs &&
    getEquippedTypeId(player, EquipmentSlot.Feet) === ARMOR.feet;
}

export function isVampirePlasmaDrainBlocked(player) {
  try {
    return isVampirePlayer(player) && player.getDynamicProperty(PLASMA_DRAIN_BLOCKED) === true;
  } catch {
    return false;
  }
}

export function hasVampireArmorSunImmunity(player) {
  try {
    return isVampirePlayer(player) && player.getDynamicProperty(ARMOR_SUN_IMMUNITY) === true;
  } catch {
    return false;
  }
}

function hasManagedNightVisionSource(player) {
  const classId = getScore(player, "class_primary");
  const morphId = getScore(player, "morph_state");
  const vampireSource = classId === VAMPIRE_CLASS_ID &&
    (hasVampireHelmetEquipped(player) ||
      (morphId === BAT_MORPH_ID && getScore(player, "skill_bat_morph") > 0));
  const shadowWolfSource = classId === WEREWOLF_CLASS_ID &&
    morphId === SHADOW_WOLF_MORPH_ID &&
    getScore(player, "skill_shadow_wolf_morph") > 0;
  return vampireSource || shadowWolfSource;
}

function hasNightVision(player) {
  try {
    if (typeof player.getEffect === "function") {
      return !!player.getEffect("night_vision");
    }
    if (typeof player.hasEffect === "function") {
      return player.hasEffect("night_vision");
    }
  } catch {}
  return false;
}

export const VampireNightVisionManager = Object.freeze({
  update(player, tick, previous) {
    const active = hasManagedNightVisionSource(player);
    if (active) {
      const shouldCheck = !previous.nightVision ||
        tick - previous.lastNightVisionRefresh >= NIGHT_VISION_REFRESH_TICKS;
      if (shouldCheck) {
        if (!hasNightVision(player)) {
          try {
            player.addEffect("night_vision", NIGHT_VISION_DURATION, {
              amplifier: 0,
              showParticles: false
            });
          } catch {}
        }
        previous.lastNightVisionRefresh = tick;
      }
      try {
        if (!player.hasTag(MANAGED_NIGHT_VISION_TAG)) player.addTag(MANAGED_NIGHT_VISION_TAG);
      } catch {}
      return true;
    }

    try {
      if (previous.nightVision || player.hasTag(MANAGED_NIGHT_VISION_TAG)) {
        player.removeTag(MANAGED_NIGHT_VISION_TAG);
        player.removeEffect("night_vision");
      }
    } catch {}
    previous.lastNightVisionRefresh = 0;
    return false;
  }
});

export function processVampireArmorEffects(player, tick = system.currentTick) {
  const key = player.id;
  const previous = armorStates.get(key) ?? {
    helmet: false,
    fullSet: false,
    nightVision: false,
    lastNightVisionRefresh: 0,
    lastPlasmaRegenTick: tick
  };
  previous.nightVision = VampireNightVisionManager.update(player, tick, previous);

  if (!isVampirePlayer(player)) {
    setBooleanProperty(player, ARMOR_SUN_IMMUNITY, false);
    setBooleanProperty(player, PLASMA_DRAIN_BLOCKED, false);
    previous.helmet = false;
    previous.fullSet = false;
    previous.lastPlasmaRegenTick = tick;
    if (previous.nightVision) armorStates.set(key, previous);
    else armorStates.delete(key);
    return;
  }

  const helmet = hasVampireHelmetEquipped(player);
  const fullSet = hasVampireArmorSetEquipped(player);

  setBooleanProperty(player, ARMOR_SUN_IMMUNITY, fullSet);
  setBooleanProperty(player, PLASMA_DRAIN_BLOCKED, fullSet);

  if (fullSet) {
    setScore(player, "plasma_drain", 0);
    if (!previous.fullSet) previous.lastPlasmaRegenTick = tick;
    if (tick - previous.lastPlasmaRegenTick >= PLASMA_REGEN_TICKS) {
      const maximum = Math.max(1, getScore(player, "plasma_max") || 100);
      const current = Math.max(0, getScore(player, "plasma"));
      if (current < maximum) setScore(player, "plasma", Math.min(maximum, current + 3));
      previous.lastPlasmaRegenTick = tick;
    }
  } else {
    previous.lastPlasmaRegenTick = tick;
  }

  previous.helmet = helmet;
  previous.fullSet = fullSet;
  armorStates.set(key, previous);
}

if (world.afterEvents?.playerLeave) {
  world.afterEvents.playerLeave.subscribe((event) => armorStates.delete(event.playerId));
}
