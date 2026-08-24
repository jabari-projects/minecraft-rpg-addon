import { system, world } from "@minecraft/server";
import { isVampirePlayer, subscribeVampirePlayerTicks } from "./vampire_armor_effects.js";

export const SUN_IMMUNITY_SKILL_OBJECTIVE = "skill_vampire_sun_immunity";
export const SUN_IMMUNITY_UNLOCK_PROPERTY = "vampire_sun_immunity_skill";
export const SUN_IMMUNITY_TOGGLE_PROPERTY = "sun_immunity_skill_toggle";
export const SUN_IMMUNITY_TOGGLE_EVENT = "minecraft_world_rpg:vampire_sun_immunity_toggle";

const REQUIRED_VAMPIRE_SKILLS = Object.freeze([
  "skill_vampire_bite",
  "skill_blood_thirst",
  "skill_midnight_strength",
  "skill_bat_morph",
  "skill_summon_vampire_troops",
  "skill_vampire_compel"
]);

function getObjective(objectiveName, create = false) {
  try {
    const existing = world.scoreboard.getObjective(objectiveName);
    if (existing || !create) return existing;
    return world.scoreboard.addObjective(objectiveName, "Vampire Sun Immunity");
  } catch {
    return undefined;
  }
}

function getScore(player, objectiveName) {
  try {
    const objective = getObjective(objectiveName);
    const identity = player.scoreboardIdentity;
    return objective && identity ? (objective.getScore(identity) ?? 0) : 0;
  } catch {
    return 0;
  }
}

function getBooleanProperty(player, propertyName) {
  try {
    return player.getDynamicProperty(propertyName) === true;
  } catch {
    return false;
  }
}

function setBooleanProperty(player, propertyName, value) {
  try {
    if (player.getDynamicProperty(propertyName) !== value) {
      player.setDynamicProperty(propertyName, value);
    }
    return true;
  } catch {
    return false;
  }
}

export function hasAllVampireSkills(player) {
  return isVampirePlayer(player) &&
    REQUIRED_VAMPIRE_SKILLS.every((objectiveName) => getScore(player, objectiveName) > 0);
}

export function isVampireSunImmunitySkillUnlocked(player) {
  return hasAllVampireSkills(player) && getScore(player, SUN_IMMUNITY_SKILL_OBJECTIVE) > 0;
}

export function isVampireSunImmunitySkillActive(player) {
  return isVampireSunImmunitySkillUnlocked(player) &&
    getBooleanProperty(player, SUN_IMMUNITY_TOGGLE_PROPERTY);
}

export function synchronizeVampireSunImmunitySkill(player) {
  const unlocked = isVampireSunImmunitySkillUnlocked(player);
  const wasUnlocked = getBooleanProperty(player, SUN_IMMUNITY_UNLOCK_PROPERTY);
  setBooleanProperty(player, SUN_IMMUNITY_UNLOCK_PROPERTY, unlocked);

  if (!unlocked) {
    setBooleanProperty(player, SUN_IMMUNITY_TOGGLE_PROPERTY, false);
    return false;
  }

  // Purchasing unlocks access to the toggle; it never enables immunity itself.
  if (!wasUnlocked) {
    setBooleanProperty(player, SUN_IMMUNITY_TOGGLE_PROPERTY, false);
  } else {
    try {
      if (player.getDynamicProperty(SUN_IMMUNITY_TOGGLE_PROPERTY) === undefined) {
        player.setDynamicProperty(SUN_IMMUNITY_TOGGLE_PROPERTY, false);
      }
    } catch {}
  }
  return true;
}

export function toggleVampireSunImmunitySkill(player) {
  synchronizeVampireSunImmunitySkill(player);
  if (!isVampireSunImmunitySkillUnlocked(player)) return undefined;

  const enabled = getBooleanProperty(player, SUN_IMMUNITY_TOGGLE_PROPERTY);
  const next = !enabled;
  setBooleanProperty(player, SUN_IMMUNITY_TOGGLE_PROPERTY, next);
  return next;
}

subscribeVampirePlayerTicks((player, tick) => {
  if (tick % 20 === 0) synchronizeVampireSunImmunitySkill(player);
});

system.run(() => {
  getObjective(SUN_IMMUNITY_SKILL_OBJECTIVE, true);
});

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.id !== SUN_IMMUNITY_TOGGLE_EVENT ||
    event.sourceEntity?.typeId !== "minecraft:player") {
    return;
  }

  const player = event.sourceEntity;
  system.run(() => {
    toggleVampireSunImmunitySkill(player);
  });
});
