import {
  hasVampireArmorSunImmunity,
  isVampirePlayer
} from "./vampire_armor_effects.js";
import { isVampireSunImmunitySkillActive } from "./vampire_class_skill_sun_immunity.js";

let sunSystemStarted = false;

export function startVampireSunSystem() {
  sunSystemStarted = true;
  return true;
}

export function hasVampireSunImmunity(player) {
  if (!sunSystemStarted || !isVampirePlayer(player)) return false;
  return hasVampireArmorSunImmunity(player) || isVampireSunImmunitySkillActive(player);
}
