import { isVampirePlasmaDrainBlocked, processVampireArmorEffects } from "./vampire_armor_effects.js";
import { hasVampireSunImmunity, startVampireSunSystem } from "./vampire_sun.js";
import { isVampireSunImmunitySkillActive, toggleVampireSunImmunitySkill } from "./vampire_class_skill_sun_immunity.js";

import { ItemStack, WeatherType, system, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

startVampireSunSystem();

const NAMESPACE = "minecraft_world_rpg";
const RPG_BOOK_ID = `${NAMESPACE}:rpg_book`;
const ICON_BOOK = "textures/items/rpg_book";
const REBIRTH_POTION_ID = `${NAMESPACE}:rebirth_potion`;
const SWITCH_THROW_PROJECTILE_ID = `${NAMESPACE}:switch_throw_projectile`;
const DAGGER_THROW_PROJECTILE_ID = `${NAMESPACE}:dagger_throw_projectile`;
const VAMPIRE_TROOP_ENTITY_IDS = [
  "myname:vampire_troops"
];
const VAMPIRE_TROOP_ENTITY_ID = VAMPIRE_TROOP_ENTITY_IDS[0];
const NECROMANCY_SKELETON_ENTITY_IDS = [
  "myname:skeleton_troop"
];
const NECROMANCY_SKELETON_ENTITY_ID = NECROMANCY_SKELETON_ENTITY_IDS[0];
const CHAIN_LIGHTNING_ARROW_ENTITY_ID = `${NAMESPACE}:chain_lightning_arrow`;
const CRIT_FOCUS_ARROW_ENTITY_ID = `${NAMESPACE}:crit_focus_arrow`;
const LEVITATE_ARROW_ENTITY_ID = `${NAMESPACE}:levitate_arrow`;
const EXPLOSIVE_ARROW_ENTITY_ID = `${NAMESPACE}:explosive_arrow`;
const RPG_TAGLINE = "Choose your class, level up, become OP!";
const INPUT_BUTTON_JUMP = "Jump";
const INPUT_BUTTON_SNEAK = "Sneak";
const BUTTON_STATE_PRESSED = "Pressed";
const BUTTON_STATE_RELEASED = "Released";
const CUSTOM_PROJECTILE_ENTITY_IDS = new Set([
  SWITCH_THROW_PROJECTILE_ID,
  DAGGER_THROW_PROJECTILE_ID,
  CHAIN_LIGHTNING_ARROW_ENTITY_ID,
  CRIT_FOCUS_ARROW_ENTITY_ID,
  LEVITATE_ARROW_ENTITY_ID,
  EXPLOSIVE_ARROW_ENTITY_ID
]);


const ACTIVE_SWITCH_THROWS = new Map();
const ARCHER_EXPLOSIVE_SELF_GUARDS = new Map();
const ARCHER_EXPLOSIVE_SELF_GUARD_TICKS = 4;
const ACTIVE_DAGGER_THROWS = new Map();
const NECROMANCY_GROUPS = new Map();
const VAMPIRE_TROOP_GROUPS = new Map();
const NECRO_DRAGON_BREATH_DOTS = new Map();
const SHADOW_WOLF_MIMICS = new Map();
const STAFF_CYCLE_STATES = new Map();
const SECOND_LIFE_INVULNERABILITY = new Map();
const SECOND_LIFE_CLAIMS = new Set();
const SCENT_SCAN_STATES = new Map();
const ARCHER_CHAIN_LIGHTNING_COOLDOWNS = new Map();
const TEMPORARY_SPELL_BLOCKS = new Map();
const TEMPORARY_SPELL_ENTITIES = new Map();
const BANSHEE_PHASE_STATES = new Map();
const SWITCH_THROW_KILL_MARKS = new Map();
const SONIC_SCREAM_KILL_MARKS = new Map();
const BANSHEE_SONIC_SELF_DEATHS = new Map();
const COMPEL_KILL_MARKS = new Map();
const PLAYER_BUTTON_HELD_STATES = new Map();
const MULTI_JUMP_STATES = new Map();
const BAT_FLIGHT_STATES = new Map();
const ACTIVE_ROAR_WOLVES = new Map();
const ACTIVE_TENACITY_CHARGES = new Map();
const STAT_SPEED_STATES = new Map();
const VAMPIRE_MOVEMENT_STATES = new Map();
const XP_LEVEL_CACHE = new Map();
const MOVEMENT_DEFAULTS = new Map();
const JUMP_DEFAULTS = new Map();
const SKY_EXPOSURE_CACHE = new Map();
const MIDNIGHT_STRENGTH_DAMAGE_MARKS = new Map();
const MIDNIGHT_STRENGTH_EFFECT_STATES = new Map();
const ADRENALINE_EFFECT_STATES = new Map();
const PASSIVE_EFFECT_STATES = new Map();
const UI_MESSAGE_LOCKS = new Map();
let switchThrowUpdateGate = 0;
let daggerThrowUpdateGate = 0;
let roarWolfUpdateGate = 0;
let necromancyGroupUpdateGate = 0;
const PASSIVE_BUFF_MAX_SECONDS = 20;
const PASSIVE_BUFF_REFRESH_SECONDS = 19;
const PASSIVE_STATE_UPDATE_INTERVAL_TICKS = 5;
const UI_TOAST_LOCK_TICKS = 45;
const SECOND_LIFE_COOLDOWN_SECONDS = 300;
const SECOND_LIFE_INVULNERABLE_TICKS = 20 * 5;
const SECOND_LIFE_RESTORE_HEALTH = 10;
const SECOND_LIFE_VOID_MARGIN = 4;
const PARKOURIST_SPEED_BONUS = 0.50;
const ADRENALINE_HEALTH_THRESHOLD = 10;
const PARKOURIST_JUMP_STRENGTH_TWO_BLOCK = 0.84;
const VANILLA_JUMP_STRENGTH_FALLBACK = 0.42;
const PARKOURIST_JUMP_BOOST_SECONDS = 2;
const PARKOURIST_JUMP_BOOST_AMPLIFIER = 1;
const MIDNIGHT_STRENGTH_SPEED_BONUS = 0.50;
const ADRENALINE_COOLDOWN_TICKS = 20 * 120;
const ADRENALINE_TOGGLE_OBJECTIVE = "adrenaline_toggle";
const SPELL_MASTERY_TOGGLE_OBJECTIVE = "spell_mastery_toggle";
const STAFF_MASTERY_TOGGLE_OBJECTIVE = "staff_mastery_toggle";
const NINJA_AGILITY_SPEED_BONUSES = [0, 0.25, 0.35, 0.50, 0.75, 0.90];
const MULTI_JUMP_LIFT = 0.52;
const MULTI_JUMP_FORWARD_BURST = 0.42;
const MULTI_JUMP_COYOTE_TICKS = 4;
const MULTI_JUMP_LANDING_GRACE_TICKS = 3;
const MULTI_JUMP_FALL_VELOCITY_THRESHOLD = -0.65;
const MULTI_JUMP_MIN_AIR_TICKS_FOR_FALL = 3;
const WEREWOLF_DAY_SPEED_BONUS = 0.90;
const WEREWOLF_NIGHT_SPEED_BONUS = 0.35;
const WEREWOLF_NIGHT_DAMAGE_MULTIPLIER = 1.5;
const WEREWOLF_NIGHT_HEARTS = 3;
const WEREWOLF_CLIMB_EFFECT_SECONDS = 1;
const WEREWOLF_CLIMB_EFFECT_AMPLIFIER = 0;
const WEREWOLF_ROAR_WOLF_COUNT = 3;
const WEREWOLF_ROAR_WOLF_LIFETIME_TICKS = 20 * 60;
const WEREWOLF_ROAR_SPAWN_PROTECTION_TICKS = 20;
const WEREWOLF_ROAR_UPDATE_INTERVAL_TICKS = 5;
const WEREWOLF_ROAR_RETARGET_INTERVAL_TICKS = 10;
const WEREWOLF_ROAR_SPAWN_CLEARANCE_SQ = 2.25;
const WEREWOLF_ROAR_MELEE_DAMAGE = 4;
const WEREWOLF_ROAR_MELEE_RANGE_SQ = 4.0;
const WEREWOLF_ROAR_MELEE_INTERVAL_TICKS = 20;
const NECROMANCY_GROUP_UPDATE_INTERVAL_TICKS = 5;
const NECROMANCY_LIFETIME_TICKS = 20 * 180;
const SUMMON_AGGRO_RANGE = 15;
const NECROMANCY_TELEPATHIC_DAMAGE = 4;
const NECROMANCY_TELEPATHIC_RANGE_SQ = 2.5 * 2.5;
const NECROMANCY_TELEPATHIC_INTERVAL_TICKS = 20;
const VAMPIRE_TROOP_MAGIC_DAMAGE_BASE = 4;
const VAMPIRE_TROOP_MAGIC_DAMAGE_CRITICAL = 6;
const VAMPIRE_TROOP_MAGIC_CRIT_CHANCE = 0.25;
const VAMPIRE_TROOP_MAGIC_MIN_RANGE_SQ = 1.5 * 1.5;
const VAMPIRE_TROOP_MAGIC_MAX_RANGE_SQ = 4.5 * 4.5;
const VAMPIRE_TROOP_FANG_COUNT = 8;
const VAMPIRE_TROOP_FANG_RADIUS = 1.45;
const VAMPIRE_TROOP_FANG_FX_TAG = "mwr_vampire_troop_fang_fx";
const VAMPIRE_TROOP_PURSUIT_IMPULSE = 0.18;
const VAMPIRE_TROOP_FOLLOW_IMPULSE = 0.14;
const VAMPIRE_TROOP_SUMMON_PLASMA_COST = 15;
const VAMPIRE_TROOP_MAX_ACTIVE = 3;
const VAMPIRE_TROOP_DASH_INTERVAL_TICKS = 30;
const VAMPIRE_TROOP_DASH_MIN_RANGE_SQ = 1.5 * 1.5;
const VAMPIRE_TROOP_DASH_MAX_RANGE_SQ = 4.5 * 4.5;
const VAMPIRE_TROOP_DASH_IMPULSE = 0.28;
const BLOOD_THIRST_LIFESTEAL_RATIO = 0.5;
const BLOOD_THIRST_MIN_HEAL = 2;
const WEREWOLF_FANG_DAMAGE = 6;
const BANSHEE_SONIC_RANGE = 15;
const BANSHEE_SONIC_DAMAGE_MIN = 10;
const BANSHEE_SONIC_DAMAGE_MAX = 12;
const BANSHEE_SONIC_HALF_ANGLE_DEGREES = 32.5;
const BANSHEE_SONIC_RAY_HIT_RADIUS = 0.95;
const BANSHEE_PHASE_TAG = "mwr_banshee_phase_ready";
const BANSHEE_PHASE_COOLDOWN_TICKS = 8;
const BANSHEE_SOUL_MARK_TICKS = 12;
const SCENT_USER_TAG = "werewolf_scent_user";
const SCENT_IGNORE_TAG_PREFIX = "mwr_scent_ignore_";
const SCENT_TOGGLE_OBJECTIVE = "scent_toggle_state";
const SCENT_TOGGLE_READY_OBJECTIVE = "scent_toggle_initialized";
const NECROMANCY_TARGET_TAG = "necromancy_target";
const NECROMANCY_OWNER_TAG = "necromancy_owner";
const NECROMANCY_ALLY_TAG = "necromancy_ally";
const NECROMANCY_SUMMONER_TAG = "mwr_summoner";
const NECROMANCY_OWNER_ID_TAG = "owner_id";
const NECROMANCY_OWNER_NAME_TAG = "owner_name";
const NECROMANCY_OWNER_UUID_TAG = "owner_uuid";
const ARCHER_CHAIN_LIGHTNING_COOLDOWN_TICKS = 5;
const ARCHER_CHAIN_LIGHTNING_TARGETS_PER_LEVEL = 4;
const ARCHER_CHAIN_LIGHTNING_MAX_TARGETS = 12;
const ARCHER_EXPLOSIVE_DAMAGE = 5;
const ARCHER_BASE_ARROW_DAMAGE = 7;
const NECRO_DRAGON_BREATH_DURATION_TICKS = 20 * 5;
const NECRO_DRAGON_BREATH_DAMAGE = 3;
const NECRO_DRAGON_BREATH_DAMAGE_INTERVAL_TICKS = 20;
const NECRO_DRAGON_BREATH_FX_INTERVAL_TICKS = 5;
const SWITCH_THROW_KILL_MARK_TICKS = 10;
const SPELL_TEMP_BLOCK_DURATION_TICKS = 20 * 5;
const SPELL_TEMP_ENTITY_DURATION_TICKS = 20 * 6;
const SCENT_RADIUS = 64;
const SCENT_PROJECTILE_CONTACT_RADIUS_SQ = 2.5 * 2.5;
const SCENT_PHYSICAL_BARRIER_RADIUS_SQ = 7 * 7;
const SCENT_PHYSICAL_BARRIER_IMPULSE = 0.55;
const SCENT_SCAN_INTERVAL_TICKS = 5;
const SKY_EXPOSURE_CACHE_TICKS = 20;
const SWITCH_THROW_UPDATE_INTERVAL_TICKS = 5;
const SWITCH_THROW_PATH_STEP = 0.75;
const SWITCH_THROW_HIT_RADIUS = 1.5;
const TENACITY_CHARGE_DISTANCE = 5;
const TENACITY_CHARGE_DAMAGE = 6;
const TENACITY_CHARGE_RESISTANCE_SECONDS = 15;
const TENACITY_CHARGE_DASH_TICKS = 5;
const TENACITY_CHARGE_SWEEP_RADIUS = 1.85;
const TENACITY_CHARGE_IMPULSE = 0.24;
const TENACITY_CHARGE_KNOCKBACK_STRENGTH = 1.55;
const TENACITY_CHARGE_BLAST_SPACING = 1.25;
const LUCK_CHANCES = [0, 0.05, 0.15, 0.25];
const DAGGER_THROW_UPDATE_INTERVAL_TICKS = 5;
const DAGGER_THROW_MAX_TICKS = 25;
const DAGGER_THROW_STEP_PER_TICK = 1.05;
const DAGGER_THROW_COLLISION_INTERVAL = 5;
const DAGGER_THROW_COLLISION_RADIUS = 2.0;
const DAGGER_THROW_PARTICLE_INTERVAL = 5;
const ROAR_WOLF_ENTITY_ID = "minecraft:wolf";
const ROAR_WOLF_TAG = "mwr_roar_pack_wolf";
const MORPH_HOSTILE_SUPPRESSION_RADIUS = 28;
const MORPH_HOSTILE_SUPPRESSION_INTERVAL_TICKS = 5;
const BAT_FLIGHT_FORWARD_SPEED = 0.44;
const BAT_FLIGHT_ASCEND_SPEED = 0.32;
const BAT_FLIGHT_DESCEND_SPEED = -0.30;
const BAT_FLIGHT_HOVER_SPEED = 0.05;
const BAT_FLIGHT_UPDATE_INTERVAL_TICKS = 3;
const BAT_FLIGHT_INITIAL_BUFFER_TICKS = 2;
const BAT_FLIGHT_SMOOTHING = 0.25;
const BAT_FLIGHT_IDLE_DAMPING = 0.72;
const BAT_FLIGHT_MAX_VERTICAL_STEP = 0.24;
const BAT_FLIGHT_MAX_HORIZONTAL_STEP = 0.22;
const COMPEL_KILL_MARK_TICKS = 40;
const SHADOW_WOLF_HEALTH_BOOST_AMPLIFIER = 2;
const SHADOW_WOLF_BONUS_HEARTS = 5;

const CLASS = {
  VAMPIRE: 1,
  WEREWOLF: 2,
  BANSHEE: 3,
  HUMAN: 4
};

const SUBCLASS = {
  WARRIOR: 1,
  NINJA: 2,
  WITCH: 3,
  ARCHER: 4,
  TANK: 5
};

const MORPH = {
  NONE: 0,
  BAT: 1,
  SHADOW_WOLF: 2,
  BANSHEE: 3
};

const MORPH_SHELL_ITEM_IDS = {
  [MORPH.BAT]: `${NAMESPACE}:morph_shell_bat`,
  [MORPH.BANSHEE]: `${NAMESPACE}:morph_shell_banshee`
};
const MORPH_SHELL_ITEM_SET = new Set(Object.values(MORPH_SHELL_ITEM_IDS));
const SHADOW_WOLF_MIMIC_ENTITY_ID = `${NAMESPACE}:shadow_wolf_morph_placeholder`;

const SCOREBOARDS = [
  "class_primary",
  "class_request",
  "class_confirmed",
  "subclass_primary",
  "subclass_request",
  "subclass_confirmed",
  "fx_color",
  "ability_toggle_1",
  "ability_toggle_2",
  "ability_toggle_3",
  "ability_toggle_4",
  "ability_toggle_5",
  "xp_total",
  "xp_spent",
  "xp_available",
  "xp_tree_state",
  "morph_state",
  "morph_request",
  "plasma",
  "plasma_max",
  "plasma_drain",
  "cd_class",
  "cd_ability_1",
  "cd_ability_2",
  "cd_ability_3",
  "cd_ability_4",
  "cd_ability_5",
  "cd_morph",
  "water_exit",
  "lycan_vitality",
  "ww_bonus_hp",
  "morph_bonus",
  "skill_vampire_bite",
  "skill_blood_thirst",
  "skill_midnight_strength",
  "skill_bat_morph",
  "skill_summon_vampire_troops",
  "skill_vampire_compel",
  "skill_wolf_bite",
  "skill_werewolf_roar",
  "skill_shadow_wolf_morph",
  "skill_werewolf_scent",
  "skill_banshee_invisibility",
  "skill_sonic_scream",
  "skill_banshee_phase",
  "skill_banshee_morph",
  "banshee_mind_fracture",
  "banshee_mind_fracture_enabled",
  "skill_banshee_soul",
  "banshee_soul_active",
  "skill_switch_throw",
  "skill_tenacity_charge",
  "skill_third_hit_double",
  "skill_ninja_agility",
  "skill_multi_jump",
  "skill_dagger_throw",
  "skill_strikethrough",
  "skill_smoke_bomb",
  "skill_spell_mastery",
  "skill_necromancy",
  "skill_staff_mastery",
  "skill_chain_lightning",
  "skill_crit_focus",
  "skill_levitate",
  "skill_knockback_boost",
  "skill_explosive_arrows",
  "skill_shield_slam",
  "skill_fortify",
  "skill_taunt",
  "skill_public_vitality",
  "skill_public_haste",
  "skill_public_parkours",
  "skill_public_second_life",
  "skill_public_adrenaline",
  "skill_public_hp_regen",
  "skill_public_xp_boost",
  "skill_public_luck",
  "parkourist_active",
  "adrenaline_active",
  "midnight_strength_active",
  "werewolf_scent_active",
  "scent_toggle_state",
  "scent_toggle_initialized",
  "banshee_phase_active",
  "fall_immunity_active",
  "public_parkourist_enabled",
  "public_hp_regen_enabled",
  "public_xp_boost_enabled",
  "public_skill_toggles_ready",
  "skill_toggles_ready",
  "second_life_cd",
  "hp_regen_delay",
  "cd_spell",
  "cd_spell_fire",
  "cd_spell_ice",
  "cd_spell_poison",
  "cd_warrior_switch_throw",
  "cd_warrior_tenacity_charge",
  "cd_warrior_third_hit",
  "cd_ninja_multi_jump",
  "cd_ninja_dagger_throw",
  "cd_ninja_strikethrough",
  "cd_ninja_smoke_bomb",
  "cd_witch_necromancy",
  "cd_witch_staff_mastery",
  "cd_archer_chain_lightning",
  "cd_archer_crit_focus",
  "cd_archer_knockback_boost",
  "cd_tank_slam",
  "cd_tank_fortify",
  "cd_tank_taunt",
  "cd_weapon_witch_staff",
  "warrior_third_hit",
  "tenacity_strike",
  "ninja_air_jumps",
  "rebirth_count",
  "skill_vampire_bite_enabled",
  "skill_summon_vampire_troops_enabled",
  "skill_vampire_compel_enabled",
  "skill_wolf_bite_enabled",
  "skill_werewolf_roar_enabled",
  "lycan_vitality_enabled",
  "skill_sonic_scream_enabled",
  "skill_banshee_invisibility_enabled",
  "skill_banshee_phase_enabled",
  "skill_banshee_soul_enabled",
  "skill_switch_throw_enabled",
  "skill_tenacity_charge_enabled",
  "skill_ninja_agility_enabled",
  "skill_multi_jump_enabled",
  "skill_dagger_throw_enabled",
  "skill_strikethrough_enabled",
  "skill_smoke_bomb_enabled",
  "skill_necromancy_enabled",
  "skill_chain_lightning_enabled",
  "skill_crit_focus_enabled",
  "skill_levitate_enabled",
  "skill_shield_slam_enabled",
  "skill_fortify_enabled",
  "skill_taunt_enabled",
  "skill_public_luck_enabled"
];

const CLASSES = [
  { id: CLASS.VAMPIRE, name: "Vampire" },
  { id: CLASS.WEREWOLF, name: "Werewolf" },
  { id: CLASS.BANSHEE, name: "Banshee" },
  { id: CLASS.HUMAN, name: "Human" }
];

const SUBCLASSES = [
  { id: SUBCLASS.WARRIOR, name: "Warrior" },
  { id: SUBCLASS.NINJA, name: "Ninja" },
  { id: SUBCLASS.WITCH, name: "Witch" },
  { id: SUBCLASS.ARCHER, name: "Archer" },
  { id: SUBCLASS.TANK, name: "Tank" }
];

const FX_PARTICLE_IDS = {
  white: "minecraft_world_rpg:fx_white",
  red: "minecraft_world_rpg:fx_red",
  blue: "minecraft_world_rpg:fx_blue",
  green: "minecraft_world_rpg:fx_green",
  purple: "minecraft_world_rpg:fx_purple",
  orange: "minecraft_world_rpg:fx_orange",
  yellow: "minecraft_world_rpg:fx_yellow"
};

const FX_COLORS = [
  { id: 1, name: "Red", particle: FX_PARTICLE_IDS.red },
  { id: 2, name: "Blue", particle: FX_PARTICLE_IDS.blue },
  { id: 3, name: "Green", particle: FX_PARTICLE_IDS.green },
  { id: 4, name: "Purple", particle: FX_PARTICLE_IDS.purple },
  { id: 5, name: "Orange", particle: FX_PARTICLE_IDS.orange },
  { id: 6, name: "Yellow", particle: FX_PARTICLE_IDS.yellow }
];

const SETTING_TAGS = {
  autoReturnOff: "mwr_auto_return_off",
  audioOff: "mwr_audio_off",
  scaleSmall: "mwr_ui_scale_small",
  scaleLarge: "mwr_ui_scale_large"
};


const WEAPON_IDS = {
  witchStaff: `${NAMESPACE}:witch_staff_destruction`
};
const NECRO_SWORD_ITEM_ID = "myname:necro_sword";
const CUSTOM_SWORD_ITEM_IDS = new Set(["myname:godslayer", NECRO_SWORD_ITEM_ID]);

const STAFF_TIME_SEQUENCE = [
  { name: "Sunrise", tick: 0 },
  { name: "Noon", tick: 6000 },
  { name: "Sunset", tick: 12000 },
  { name: "Midnight", tick: 18000 }
];

const STAFF_WEATHER_SEQUENCE = [
  { name: "Clear", type: WeatherType.Clear },
  { name: "Rain", type: WeatherType.Rain },
  { name: "Thunder", type: WeatherType.Thunder }
];
const STAFF_WEATHER_DURATION_TICKS = 20 * 600;
const STAFF_DESTRUCTION_NON_WITCH_COOLDOWN_SECONDS = 3;
const STAFF_DESTRUCTION_NON_WITCH_HEALTH_COST = 10;

const SPELL_IDS = {
  fireBomb: `${NAMESPACE}:fire_bomb`,
  iceBomb: `${NAMESPACE}:ice_bomb`,
  poisonBomb: `${NAMESPACE}:poison_bomb`
};

const SPELL_COOLDOWN_OBJECTIVES = {
  [SPELL_IDS.fireBomb]: "cd_spell_fire",
  [SPELL_IDS.iceBomb]: "cd_spell_ice",
  [SPELL_IDS.poisonBomb]: "cd_spell_poison"
};

const WEAPON_COOLDOWN_OBJECTIVES = {
  [WEAPON_IDS.witchStaff]: "cd_weapon_witch_staff"
};

const INDEPENDENT_COOLDOWNS = [
  "cd_morph",
  "cd_spell",
  "cd_spell_fire",
  "cd_spell_ice",
  "cd_spell_poison",
  "cd_warrior_switch_throw",
  "cd_warrior_tenacity_charge",
  "cd_ninja_dagger_throw",
  "cd_ninja_strikethrough",
  "cd_ninja_smoke_bomb",
  "cd_witch_necromancy",
  "cd_archer_chain_lightning",
  "cd_tank_slam",
  "cd_tank_fortify",
  "cd_tank_taunt",
  "cd_weapon_witch_staff"
];

const ABILITIES = {
  vampireBite: {
    classId: CLASS.VAMPIRE,
    slot: 1,
    name: "Vampire Fangs",
    baseline: true,
    skill: "skill_vampire_bite",
    itemId: `${NAMESPACE}:vampire_bite`,
    icon: "textures/items/vampire_bite"
  },
  batMorph: {
    classId: CLASS.VAMPIRE,
    slot: 4,
    name: "Bat Morph",
    skill: "skill_bat_morph",
    itemId: `${NAMESPACE}:bat_morph`,
    icon: "textures/items/bat_morph",
    morphState: MORPH.BAT,
    persistent: true,
    cooldown: 8,
    cooldownObjective: "cd_morph"
  },
  summonVampireTroops: {
    classId: CLASS.VAMPIRE,
    slot: 5,
    name: "Summon Vampire Troops",
    skill: "skill_summon_vampire_troops",
    itemId: `${NAMESPACE}:summon_vampire_troops`,
    icon: "textures/items/summon_vampire_troops",
    persistent: true,
    noCooldown: true
  },
  compel: {
    classId: CLASS.VAMPIRE,
    slot: 6,
    name: "Compel",
    skill: "skill_vampire_compel",
    itemId: `${NAMESPACE}:compel`,
    icon: "textures/items/compel",
    persistent: true,
    plasmaCost: 50,
    noCooldown: true
  },
  wolfBite: {
    classId: CLASS.WEREWOLF,
    slot: 1,
    name: "Werewolf Fangs",
    baseline: true,
    skill: "skill_wolf_bite",
    itemId: `${NAMESPACE}:wolf_bite`,
    icon: "textures/items/wolf_bite"
  },
  werewolfRoar: {
    classId: CLASS.WEREWOLF,
    slot: 2,
    name: "Roar",
    skill: "skill_werewolf_roar",
    itemId: `${NAMESPACE}:werewolf_roar`,
    icon: "textures/items/werewolf_roar",
    cooldown: 15,
    cooldownObjective: "cd_ability_2"
  },
  shadowWolfMorph: {
    classId: CLASS.WEREWOLF,
    slot: 3,
    name: "Shadow Wolf Morph",
    skill: "skill_shadow_wolf_morph",
    itemId: `${NAMESPACE}:shadow_wolf_morph`,
    icon: "textures/items/shadow_wolf_morph",
    morphState: MORPH.SHADOW_WOLF,
    cooldown: 8,
    cooldownObjective: "cd_morph"
  },
  bansheeInvisibility: {
    classId: CLASS.BANSHEE,
    slot: 1,
    name: "Banshee Invisibility",
    skill: "skill_banshee_invisibility",
    itemId: `${NAMESPACE}:banshee_invisibility`,
    icon: "textures/items/banshee_invisibility",
    cooldown: 2,
    cooldownObjective: "cd_ability_1"
  },
  sonicScream: {
    classId: CLASS.BANSHEE,
    slot: 2,
    name: "Sonic Scream",
    skill: "skill_sonic_scream",
    itemId: `${NAMESPACE}:sonic_scream`,
    icon: "textures/items/sonic_scream",
    noCooldown: true,
    cooldown: 0,
    cooldownObjective: "cd_ability_2"
  },
  bansheePhase: {
    classId: CLASS.BANSHEE,
    slot: 4,
    name: "Banshee Phase",
    skill: "skill_banshee_phase",
    itemId: `${NAMESPACE}:banshee_phase`,
    icon: "textures/items/banshee_invisibility",
    persistent: true,
    cooldown: 2,
    cooldownObjective: "cd_ability_4"
  },
  bansheeMorph: {
    classId: CLASS.BANSHEE,
    slot: 3,
    name: "Banshee Morph",
    skill: "skill_banshee_morph",
    itemId: `${NAMESPACE}:banshee_morph`,
    icon: "textures/items/banshee_morph",
    morphState: MORPH.BANSHEE,
    cooldown: 8,
    cooldownObjective: "cd_morph"
  },
  switchThrow: {
    subclassId: SUBCLASS.WARRIOR,
    slot: 1,
    name: "Switch Throw",
    skill: "skill_switch_throw",
    itemId: `${NAMESPACE}:switch_throw`,
    icon: "textures/items/switch_throw",
    cooldown: 4,
    cooldownObjective: "cd_warrior_switch_throw"
  },
  tenacityCharge: {
    subclassId: SUBCLASS.WARRIOR,
    slot: 2,
    name: "Tenacity Charge",
    skill: "skill_tenacity_charge",
    itemId: `${NAMESPACE}:tenacity_charge`,
    icon: "textures/items/tenacity_charge",
    cooldown: 4,
    cooldownObjective: "cd_warrior_tenacity_charge"
  },
  strikethrough: {
    subclassId: SUBCLASS.NINJA,
    slot: 1,
    name: "Strikethrough",
    skill: "skill_strikethrough",
    itemId: `${NAMESPACE}:strikethrough`,
    icon: "textures/items/strikethrough",
    cooldown: 3,
    cooldownObjective: "cd_ninja_strikethrough"
  },
  smokeBomb: {
    subclassId: SUBCLASS.NINJA,
    slot: 2,
    name: "Smoke Bomb",
    skill: "skill_smoke_bomb",
    itemId: `${NAMESPACE}:smoke_bomb`,
    icon: "textures/items/smoke_bomb",
    cooldown: 3,
    cooldownObjective: "cd_ninja_smoke_bomb"
  },
  daggerThrow: {
    subclassId: SUBCLASS.NINJA,
    slot: 3,
    name: "Dagger Throw",
    skill: "skill_dagger_throw",
    itemId: `${NAMESPACE}:dagger_throw`,
    icon: "textures/items/dagger_throw",
    cooldown: 3,
    cooldownObjective: "cd_ninja_dagger_throw"
  },
  necromancy: {
    subclassId: SUBCLASS.WITCH,
    slot: 1,
    name: "Necromancy",
    skill: "skill_necromancy",
    itemId: `${NAMESPACE}:necromancy`,
    icon: "textures/items/necromancy",
    cooldown: 15,
    cooldownObjective: "cd_witch_necromancy"
  },
  shieldSlam: {
    subclassId: SUBCLASS.TANK,
    slot: 1,
    name: "Shield Slam",
    skill: "skill_shield_slam",
    itemId: `${NAMESPACE}:shield_slam`,
    icon: "textures/items/shield_slam",
    cooldown: 3,
    cooldownObjective: "cd_tank_slam"
  },
  fortify: {
    subclassId: SUBCLASS.TANK,
    slot: 2,
    name: "Fortify",
    skill: "skill_fortify",
    itemId: `${NAMESPACE}:fortify`,
    icon: "textures/items/fortify",
    cooldown: 10,
    cooldownObjective: "cd_tank_fortify"
  },
  taunt: {
    subclassId: SUBCLASS.TANK,
    slot: 3,
    name: "Taunt",
    skill: "skill_taunt",
    itemId: `${NAMESPACE}:taunt`,
    icon: "textures/items/taunt",
    cooldown: 8,
    cooldownObjective: "cd_tank_taunt"
  }
};

const ABILITY_LIST = Object.values(ABILITIES);
const ABILITY_BY_ITEM_ID = {};
for (const ability of ABILITY_LIST) {
  ABILITY_BY_ITEM_ID[ability.itemId] = ability;
}
const ABILITY_ITEM_IDS = new Set(ABILITY_LIST.map((ability) => ability.itemId));

const PUBLIC_SKILL_NODES = [
  {
    key: "skill_public_parkours",
    name: "Parkourist",
    cost: 2,
    toggle: "public_parkourist_enabled",
    description: "Toggleable public passive. +50% sprint speed and a single-press 2-block jump while enabled."
  },
  {
    key: "skill_public_second_life",
    name: "Second Life",
    cost: 3,
    description: "Passive public skill. Prevents one lethal hit, restores health and hunger, then enters a 5 minute cooldown."
  },
  {
    key: "skill_public_adrenaline",
    name: "Adrenaline",
    cost: 3,
    description: "Toggleable public passive. At 5 hearts or lower, gain +50% movement speed and doubled melee damage."
  },
  {
    key: "skill_public_hp_regen",
    name: "HP Regen",
    cost: 2,
    toggle: "public_hp_regen_enabled",
    description: "Toggleable public passive. Regenerate slowly after 5 seconds without taking damage."
  },
  {
    key: "skill_public_xp_boost",
    name: "XP Boost",
    cost: 2,
    toggle: "public_xp_boost_enabled",
    description: "Toggleable public passive. +20% XP gain when syncing Minecraft XP levels into the RPG book."
  },
  {
    key: "skill_public_luck",
    name: "Luck",
    cost: 2,
    repeatable: true,
    max: 3,
    description: "Repeatable public skill. Level 1/2/3 gives a 5%/15%/25% chance for bonus loot from killed entities."
  }
];

const CLASS_SKILL_NODES = {
  [CLASS.VAMPIRE]: [
    { key: "skill_vampire_bite", name: "Vampire Fangs", cost: 0, ability: ABILITIES.vampireBite, description: "Baseline class fangs. Strike valid targets to feed and trigger fang effects." },
    { key: "skill_blood_thirst", name: "Blood Thirst", cost: 2, description: "Passive. Fang hits restore extra plasma, steal life, and pulse FX." },
    { key: "skill_midnight_strength", name: "Midnight Strength", cost: 2, description: "Passive. Stat-based +50% movement speed and doubled base melee damage at night, in Nether/End, or during overworld thunderstorms." },
    { key: "skill_bat_morph", name: "Bat Morph", cost: 3, ability: ABILITIES.batMorph, description: "Transform into a bat with responsive flight, mob ignore, night vision, slow fall, and an 8 second recast cooldown." },
    { key: "skill_summon_vampire_troops", name: "Summon Vampire Troops", cost: 3, ability: ABILITIES.summonVampireTroops, description: "Summons three vampire troops that follow and defend you until dismissed or replaced. Recasting replaces the active group and has a 20 second cooldown." },
    { key: "skill_vampire_compel", name: "Compel", cost: 50, ability: ABILITIES.compel, prerequisites: ["skill_blood_thirst", "skill_midnight_strength", "skill_bat_morph", "skill_summon_vampire_troops"], description: "Ultimate. Aim at a mob or player and spend 50 plasma to compel instant death." },
    { key: "skill_vampire_sun_immunity", name: "Sun Immunity", cost: 30, dynamicToggle: true, prerequisites: ["skill_vampire_bite", "skill_blood_thirst", "skill_midnight_strength", "skill_bat_morph", "skill_summon_vampire_troops", "skill_vampire_compel"], description: "Final Vampire skill. After learning every Vampire skill, including Compel, spend 30 XP to unlock toggleable sunlight immunity." }
  ],
  [CLASS.WEREWOLF]: [
    { key: "skill_wolf_bite", name: "Werewolf Fangs", cost: 0, ability: ABILITIES.wolfBite, description: "Baseline class fangs. Hit targets to poison them and trigger bonus damage." },
    { key: "skill_werewolf_roar", name: "Roar", cost: 2, ability: ABILITIES.werewolfRoar, description: "Summons three vanilla wolf allies for one minute." },
    { key: "skill_shadow_wolf_morph", name: "Shadow Wolf Morph", cost: 3, ability: ABILITIES.shadowWolfMorph, description: "Transform into a Shadow Wolf and gain +10 hearts, strength, jump, resistance, night vision, speed, and water-weakness immunity." },
    { key: "lycan_vitality", name: "Lycan Vitality", cost: 1, repeatable: true, max: 5, description: "+1 heart per tier outside Shadow Wolf morph. Max 5 tiers." },
    { key: "skill_werewolf_scent", name: "Scent", cost: 50, prerequisites: ["skill_werewolf_roar", "skill_shadow_wolf_morph"], prerequisiteLevels: { lycan_vitality: 5 }, description: "Ultimate. Hostile mobs ignore the Werewolf until you provoke them." }
  ],
  [CLASS.BANSHEE]: [
    { key: "skill_sonic_scream", name: "Sonic Scream", cost: 2, ability: ABILITIES.sonicScream, description: "AoE scream that costs one heart." },
    { key: "skill_banshee_invisibility", name: "Banshee Invisibility", cost: 2, ability: ABILITIES.bansheeInvisibility, description: "Toggle persistent invisibility ON/OFF after unlocking it." },
    { key: "skill_banshee_phase", name: "Banshee Phase", cost: 2, ability: ABILITIES.bansheePhase, description: "Toggle wall phasing ON/OFF. Phase only passes through valid horizontal walls with air behind them." },
    { key: "skill_banshee_morph", name: "Banshee Morph", cost: 3, ability: ABILITIES.bansheeMorph, description: "Transform into a translucent ghost with slow fall, jump-held levitation, night vision, and damage immunity." },
    { key: "banshee_mind_fracture", name: "Mind Fracture", cost: 3, toggle: "banshee_mind_fracture_enabled", description: "Toggle nausea on Banshee hits and Sonic Scream targets." },
    { key: "skill_banshee_soul", name: "Soul", cost: 50, prerequisites: ["skill_sonic_scream", "skill_banshee_invisibility", "skill_banshee_morph", "banshee_mind_fracture"], description: "Ultimate. Sonic Scream kills restore the Banshee to full health." }
  ],
  [CLASS.HUMAN]: [
    { key: "skill_public_haste", name: "Human Adaptability", cost: 0, description: "Humans have no primary abilities and use subclass progression." }
  ]
};

const SUBCLASS_SKILL_NODES = {
  [SUBCLASS.WARRIOR]: [
    { key: "skill_switch_throw", name: "Switch Throw", cost: 2, ability: ABILITIES.switchThrow, description: "Throws weapon energy forward and returns boomerang-style." },
    { key: "skill_tenacity_charge", name: "Tenacity Charge", cost: 2, ability: ABILITIES.tenacityCharge, description: "Short dash, path damage, and brief resistance." },
    { key: "skill_third_hit_double", name: "Third Hit Double Damage", cost: 3, description: "Every third melee hit deals bonus true damage." }
  ],
  [SUBCLASS.NINJA]: [
    { key: "skill_ninja_agility", name: "Ninja Agility", cost: 1, repeatable: true, max: 5, description: "Tier 1-5 grants +25%, +35%, +50%, +75%, and +90% sprint speed without potion effects." },
    { key: "skill_multi_jump", name: "Multi-Jump", cost: 1, repeatable: true, max: 3, description: "Level 1/2/3 grants 1/2/3 extra mid-air jumps for 4 total jumps. Any extra jump grants fall immunity until landing." },
    { key: "skill_dagger_throw", name: "Dagger Throw", cost: 2, ability: ABILITIES.daggerThrow, description: "Throws a fast dagger projectile that damages and withers the target." },
    { key: "skill_strikethrough", name: "Strikethrough", cost: 2, ability: ABILITIES.strikethrough, description: "Dash through targets, damage, and brief weakness." },
    { key: "skill_smoke_bomb", name: "Smoke Bomb", cost: 2, ability: ABILITIES.smokeBomb, description: "Smoke cloud, invisibility, speed, and nearby blindness." }
  ],
  [SUBCLASS.WITCH]: [
    { key: "skill_spell_mastery", name: "Spell Mastery", cost: 2, description: "+20% spell damage, -20% spell cooldown, and no bottle penalty." },
    { key: "skill_necromancy", name: "Necromancy", cost: 4, ability: ABILITIES.necromancy, description: "Summons three protected skeleton troops that follow and defend you until dismissed or replaced." },
    { key: "skill_staff_mastery", name: "Staff Mastery", cost: 3, description: "+20% Staff of Destruction damage." }
  ],
  [SUBCLASS.ARCHER]: [
    { key: "skill_chain_lightning", name: "Chain Lightning", cost: 3, repeatable: true, max: 3, description: "Arrow hits arc to 4/8/12 nearby enemies with lightning FX, damage, and knockback." },
    { key: "skill_crit_focus", name: "Crit Focus", cost: 2, repeatable: true, max: 5, description: "Bow crit chance scales 20% per tier up to 100%. Crits deal direct double damage." },
    { key: "skill_levitate", name: "Levitate", cost: 2, repeatable: true, max: 2, description: "Arrow hits levitate the target for 1-2 seconds with upward FX." },
    { key: "skill_explosive_arrows", name: "Explosive Arrows", cost: 3, description: "Arrow impacts create a non-block-breaking 3.5 block blast for 5 damage and knockback." }
  ],
  [SUBCLASS.TANK]: [
    { key: "skill_shield_slam", name: "Shield Slam", cost: 2, ability: ABILITIES.shieldSlam, description: "AoE ground slam with weakness." },
    { key: "skill_fortify", name: "Fortify", cost: 3, ability: ABILITIES.fortify, description: "Temporary resistance and absorption." },
    { key: "skill_taunt", name: "Taunt", cost: 2, ability: ABILITIES.taunt, description: "Aggro pulse that marks and provokes nearby mobs." }
  ]
};

const ALL_SKILL_KEYS = [
  ...PUBLIC_SKILL_NODES.map((node) => node.key),
  ...[].concat(...Object.values(CLASS_SKILL_NODES)).map((node) => node.key),
  ...[].concat(...Object.values(SUBCLASS_SKILL_NODES)).map((node) => node.key)
].filter((value, index, list) => list.indexOf(value) === index);

const SKILL_TOGGLE_ALIASES = {
  skill_public_parkours: "public_parkourist_enabled",
  skill_public_hp_regen: "public_hp_regen_enabled",
  skill_public_xp_boost: "public_xp_boost_enabled",
  skill_public_adrenaline: ADRENALINE_TOGGLE_OBJECTIVE,
  skill_spell_mastery: SPELL_MASTERY_TOGGLE_OBJECTIVE,
  skill_staff_mastery: STAFF_MASTERY_TOGGLE_OBJECTIVE,
  banshee_mind_fracture: "banshee_mind_fracture_enabled",
  skill_werewolf_scent: SCENT_TOGGLE_OBJECTIVE
};

function getSkillToggleObjective(key) {
  return SKILL_TOGGLE_ALIASES[key] || `${key}_enabled`;
}

const PASSIVE_TOGGLE_SKILLS = new Set([
  "skill_public_parkours",
  "skill_public_hp_regen",
  "skill_public_xp_boost",
  "skill_public_adrenaline",
  "skill_werewolf_scent",
  "skill_third_hit_double",
  "banshee_mind_fracture",
  "skill_spell_mastery",
  "skill_staff_mastery"
]);

function shouldSkillNodeHaveToggle(node) {
  return !!node &&
    PASSIVE_TOGGLE_SKILLS.has(node.key) &&
    !node.ability &&
    !node.repeatable;
}

const ALL_SKILL_NODES = [
  ...PUBLIC_SKILL_NODES,
  ...[].concat(...Object.values(CLASS_SKILL_NODES)),
  ...[].concat(...Object.values(SUBCLASS_SKILL_NODES))
].filter((node) => node && node.key);

const SKILL_NODE_BY_KEY = {};
for (const node of ALL_SKILL_NODES) {
  SKILL_NODE_BY_KEY[node.key] = node;
  if (shouldSkillNodeHaveToggle(node)) {
    node.toggle = node.toggle || getSkillToggleObjective(node.key);
  } else if (node.toggle) {
    delete node.toggle;
  }
  if (node.toggle && SCOREBOARDS.indexOf(node.toggle) === -1) {
    SCOREBOARDS.push(node.toggle);
  }
}

const SPELL_COOLDOWNS = {
  [SPELL_IDS.fireBomb]: 3,
  [SPELL_IDS.iceBomb]: 3,
  [SPELL_IDS.poisonBomb]: 3
};

const SPELL_FX_PARTICLES = {
  [SPELL_IDS.fireBomb]: FX_PARTICLE_IDS.orange,
  [SPELL_IDS.iceBomb]: FX_PARTICLE_IDS.blue,
  [SPELL_IDS.poisonBomb]: FX_PARTICLE_IDS.green
};

const PASSIVE_MOB_TYPES = new Set([
  "minecraft:allay",
  "minecraft:armadillo",
  "minecraft:axolotl",
  "minecraft:bat",
  "minecraft:camel",
  "minecraft:cat",
  "minecraft:chicken",
  "minecraft:cod",
  "minecraft:cow",
  "minecraft:donkey",
  "minecraft:fox",
  "minecraft:frog",
  "minecraft:glow_squid",
  "minecraft:goat",
  "minecraft:horse",
  "minecraft:llama",
  "minecraft:mooshroom",
  "minecraft:mule",
  "minecraft:ocelot",
  "minecraft:panda",
  "minecraft:parrot",
  "minecraft:pig",
  "minecraft:pufferfish",
  "minecraft:rabbit",
  "minecraft:salmon",
  "minecraft:sheep",
  "minecraft:skeleton_horse",
  "minecraft:sniffer",
  "minecraft:snow_golem",
  "minecraft:squid",
  "minecraft:strider",
  "minecraft:tadpole",
  "minecraft:tropicalfish",
  "minecraft:tropical_fish",
  "minecraft:turtle",
  "minecraft:villager",
  "minecraft:villager_v2",
  "minecraft:wandering_trader"
]);

const HOSTILE_MOB_TYPES = new Set([
  "minecraft:blaze",
  "minecraft:bogged",
  "minecraft:breeze",
  "minecraft:cave_spider",
  "minecraft:creeper",
  "minecraft:drowned",
  "minecraft:elder_guardian",
  "minecraft:enderman",
  "minecraft:endermite",
  "minecraft:evocation_illager",
  "minecraft:evoker",
  "minecraft:ghast",
  "minecraft:hoglin",
  "minecraft:guardian",
  "minecraft:husk",
  "minecraft:illusioner",
  "minecraft:magma_cube",
  "minecraft:phantom",
  "minecraft:piglin",
  "minecraft:piglin_brute",
  "minecraft:pillager",
  "minecraft:ravager",
  "minecraft:shulker",
  "minecraft:silverfish",
  "minecraft:skeleton",
  "minecraft:slime",
  "minecraft:spider",
  "minecraft:stray",
  "minecraft:vex",
  "minecraft:vindicator",
  "minecraft:warden",
  "minecraft:witch",
  "minecraft:wither",
  "minecraft:wither_skeleton",
  "minecraft:zombie_pigman",
  "minecraft:zoglin",
  "minecraft:zombified_piglin",
  "minecraft:zombie",
  "minecraft:zombie_villager",
  "minecraft:zombie_villager_v2"
]);

const PASSIVE_BUFF_DEFINITIONS = [
  {
    id: "vampire_hunger_lock",
    type: "effect",
    effect: "saturation",
    amplifier: () => 255,
    condition: (player) => getScore(player, "class_primary") === CLASS.VAMPIRE
  },
  {
    id: "public_hp_regen",
    type: "heal_out_of_combat",
    condition: (player) => isPublicSkillActive(player, "skill_public_hp_regen", "public_hp_regen_enabled"),
    amount: () => 1
  }
];

function getNameById(list, id) {
  const entry = list.find((value) => value.id === id);
  return entry ? entry.name : "None";
}

function isPlayerValid(player) {
  if (!player) {
    return false;
  }

  try {
    if (typeof player.isValid === "boolean") {
      return player.isValid;
    }
    return true;
  } catch {
    return false;
  }
}

function runTickSafely(label, callback) {
  try {
    callback();
  } catch {
    // Keep one failing tick subsystem from stopping the script engine.
  }
}

function subscribeEvent(signal, handler) {
  try {
    if (signal && typeof signal.subscribe === "function") {
      signal.subscribe(handler);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

function getOnlinePlayers() {
  try {
    if (typeof world.getPlayers === "function") {
      return world.getPlayers();
    }
  } catch {
    // Fall back to older preview naming below.
  }

  try {
    if (typeof world.getAllPlayers === "function") {
      return world.getAllPlayers();
    }
  } catch {
    // No player collection API is available yet during very early startup.
  }
  return [];
}

function getObjective(name) {
  try {
    return world.scoreboard.getObjective(name);
  } catch {
    return undefined;
  }
}

function getScore(player, objectiveName) {
  const objective = getObjective(objectiveName);
  if (!objective || !player.scoreboardIdentity) {
    return 0;
  }

  try {
    const score = objective.getScore(player.scoreboardIdentity);
    return typeof score === "number" ? score : 0;
  } catch {
    return 0;
  }
}

function runCommandCompat(target, command) {
  try {
    if (!target || typeof target.runCommand !== "function") {
      return Promise.reject(new Error("runCommand is unavailable"));
    }
    return Promise.resolve(target.runCommand(command));
  } catch (error) {
    return Promise.reject(error);
  }
}

function runPlayerCommand(player, command) {
  try {
    const result = runCommandCompat(player, command);
    if (result && typeof result.catch === "function") {
      result.catch(() => {});
    }
    return result;
  } catch (error) {
    console.warn(`[${NAMESPACE}] Command failed: ${command} :: ${error}`);
    return undefined;
  }
}


function runWorldCommand(command) {
  try {
    const result = runCommandCompat(world.getDimension("overworld"), command);
    if (result && typeof result.catch === "function") {
      result.catch(() => {});
    }
    return result;
  } catch (error) {
    console.warn(`[${NAMESPACE}] Command failed: ${command} :: ${error}`);
    return undefined;
  }
}

function setScore(player, objectiveName, value) {
  return runPlayerCommand(player, `scoreboard players set @s ${objectiveName} ${Math.floor(value)}`);
}

function setScoreIfChanged(player, objectiveName, value) {
  const next = Math.floor(value);
  if (getScore(player, objectiveName) !== next) {
    setScore(player, objectiveName, next);
  }
}

function getFxTextColor(player) {
  switch (getScore(player, "fx_color")) {
    case 1:
      return "§c";
    case 2:
      return "§9";
    case 3:
      return "§a";
    case 4:
      return "§5";
    case 5:
      return "§6";
    case 6:
      return "§e";
    default:
      return "§f";
  }
}

function formatFxMessage(player, title, message) {
  const color = getFxTextColor(player);
  const suffix = message ? ` ${color}${message}` : "";
  return `§8[${color}${title}§8]${suffix}`;
}

function getTickNow() {
  try {
    if (typeof system.currentTick === "number") {
      return system.currentTick;
    }
  } catch {
    // Fall back below.
  }
  return Math.floor(Date.now() / 50);
}

function isUiLocked(player) {
  const key = getEntityKey(player) || player.name;
  return (UI_MESSAGE_LOCKS.get(key) || 0) > getTickNow();
}

function showToast(player, title, message) {
  try {
    UI_MESSAGE_LOCKS.set(getEntityKey(player) || player.name, getTickNow() + UI_TOAST_LOCK_TICKS);
    player.onScreenDisplay.setActionBar(formatFxMessage(player, title, message));
  } catch {
    try {
      player.sendMessage(formatFxMessage(player, title, message));
    } catch {
      // Player left before the message could be sent.
    }
  }
}

function showPlasmaHud(player) {
  if (getScore(player, "class_primary") !== CLASS.VAMPIRE) {
    return;
  }
  if (isUiLocked(player)) {
    return;
  }
  try {
    player.onScreenDisplay.setActionBar(`§8[P] ${getFxTextColor(player)}${getScore(player, "plasma")}/${getScore(player, "plasma_max") || 100}`);
  } catch {
    // Actionbar support is version-dependent.
  }
}

function getEffectRemainingTicks(player, effectName) {
  try {
    const effects = typeof player.getEffects === "function" ? player.getEffects() : [];
    for (const effect of effects) {
      const typeId = String(effect.typeId || (effect.type && effect.type.id) || "").replace("minecraft:", "");
      if (typeId === effectName) {
        return {
          duration: typeof effect.duration === "number" ? effect.duration : 0,
          amplifier: typeof effect.amplifier === "number" ? effect.amplifier : 0
        };
      }
    }
  } catch {
    return { duration: 0, amplifier: 0 };
  }
  return { duration: 0, amplifier: 0 };
}

function applyPassiveEffect(player, effectName, amplifier, seconds) {
  const durationSeconds = Math.max(PASSIVE_BUFF_MAX_SECONDS, seconds || PASSIVE_BUFF_MAX_SECONDS);
  const desiredAmplifier = amplifier || 0;
  const key = `${getEntityKey(player) || player.name}:${effectName}`;
  const current = getEffectRemainingTicks(player, effectName);
  const cached = PASSIVE_EFFECT_STATES.get(key) || { amplifier: -1, expiresAt: 0 };
  const now = getTickNow();
  const refreshAt = now + PASSIVE_BUFF_REFRESH_SECONDS * 20;
  if (cached.expiresAt >= refreshAt && cached.amplifier >= desiredAmplifier && current.duration >= PASSIVE_BUFF_REFRESH_SECONDS * 20) {
    return;
  }
  if (current.duration >= PASSIVE_BUFF_REFRESH_SECONDS * 20 && current.amplifier >= desiredAmplifier) {
    PASSIVE_EFFECT_STATES.set(key, {
      amplifier: desiredAmplifier,
      expiresAt: now + current.duration
    });
    return;
  }
  runPlayerCommand(player, `effect @s ${effectName} ${durationSeconds} ${desiredAmplifier} true`);
  PASSIVE_EFFECT_STATES.set(key, {
    amplifier: desiredAmplifier,
    expiresAt: now + durationSeconds * 20
  });
}

function applyLongEffect(player, effectName, amplifier) {
  applyPassiveEffect(player, effectName, amplifier, 20);
}

function ensureScoreboards() {
  for (const retiredObjective of [
    "skill_public_adrenaline_enabled",
    "skill_spell_mastery_enabled",
    "skill_staff_mastery_enabled"
  ]) {
    try {
      if (getObjective(retiredObjective)) {
        world.scoreboard.removeObjective(retiredObjective);
      }
    } catch {
      // Retired toggle objectives are absent in clean worlds.
    }
  }
  try {
    if (!getObjective(ADRENALINE_TOGGLE_OBJECTIVE)) {
      world.scoreboard.addObjective(ADRENALINE_TOGGLE_OBJECTIVE, "Adrenaline Toggle");
    }
  } catch (error) {
    console.warn(`[${NAMESPACE}] Adrenaline toggle objective setup failed: ${error}`);
  }
  try {
    if (!getObjective(SPELL_MASTERY_TOGGLE_OBJECTIVE)) {
      world.scoreboard.addObjective(SPELL_MASTERY_TOGGLE_OBJECTIVE, "Spell Mastery Toggle");
    }
  } catch (error) {
    console.warn(`[${NAMESPACE}] Spell Mastery toggle objective setup failed: ${error}`);
  }
  try {
    if (!getObjective(STAFF_MASTERY_TOGGLE_OBJECTIVE)) {
      world.scoreboard.addObjective(STAFF_MASTERY_TOGGLE_OBJECTIVE, "Staff Mastery Toggle");
    }
  } catch (error) {
    console.warn(`[${NAMESPACE}] Staff Mastery toggle objective setup failed: ${error}`);
  }
  for (const objective of SCOREBOARDS) {
    if (objective === ADRENALINE_TOGGLE_OBJECTIVE ||
      objective === SPELL_MASTERY_TOGGLE_OBJECTIVE ||
      objective === STAFF_MASTERY_TOGGLE_OBJECTIVE) {
      continue;
    }
    if (!getObjective(objective)) {
      const displayName = COMPATIBILITY_ONLY_SCOREBOARDS.has(objective)
        ? `Compatibility ${objective.replace(/_/g, " ")}`
        : objective.replace(/_/g, " ");
      runWorldCommand(`scoreboard objectives add ${objective} dummy "${displayName}"`);
    }
  }
}

function initializePlayer(player) {
  system.runTimeout(() => {
    if (!isPlayerValid(player)) {
      return;
    }

    if (!player.hasTag("mwr_initialized")) {
      runPlayerCommand(player, "function setup/player_init");
      system.runTimeout(() => {
        if (isPlayerValid(player)) {
          ensureGuideBook(player);
          reconcileUnlockedAbilityItems(player);
        }
      }, 2);
      return;
    }

    for (const objective of SCOREBOARDS) {
      if (objective === ADRENALINE_TOGGLE_OBJECTIVE ||
        objective === SPELL_MASTERY_TOGGLE_OBJECTIVE ||
        objective === STAFF_MASTERY_TOGGLE_OBJECTIVE) {
        continue;
      }
      runPlayerCommand(player, `scoreboard players add @s ${objective} 0`);
    }

    if (getScore(player, "plasma_max") <= 0) {
      setScore(player, "plasma_max", 100);
    }
    if (getScore(player, "plasma") <= 0 && getScore(player, "class_primary") !== CLASS.VAMPIRE) {
      setScore(player, "plasma", 100);
    }
    ensureSkillTogglesInitialized(player);
    ensureGuideBook(player);
    reconcileUnlockedAbilityItems(player);
  }, 10);
}

function hasChosenBuild(player) {
  return getScore(player, "class_primary") > 0 && getScore(player, "subclass_primary") > 0;
}

function isSkillUnlocked(player, key) {
  return getScore(player, key) > 0;
}

function isAdrenalineToggleOn(player) {
  const objective = getObjective(ADRENALINE_TOGGLE_OBJECTIVE);
  const identity = player && player.scoreboardIdentity;
  if (!objective || !identity) {
    return false;
  }
  try {
    if (!objective.hasParticipant(identity)) {
      const enabled = isSkillUnlocked(player, "skill_public_adrenaline");
      objective.setScore(identity, enabled ? 1 : 0);
      return enabled;
    }
    return (objective.getScore(identity) ?? 0) > 0;
  } catch {
    return false;
  }
}

function setAdrenalineToggle(player, enabled) {
  const objective = getObjective(ADRENALINE_TOGGLE_OBJECTIVE);
  const identity = player && player.scoreboardIdentity;
  if (!objective || !identity) {
    return false;
  }
  try {
    objective.setScore(identity, enabled ? 1 : 0);
  } catch {
    return false;
  }
  if (!enabled) {
    setScore(player, "adrenaline_active", 0);
    const playerKey = getEntityKey(player) || player.name;
    const state = ADRENALINE_EFFECT_STATES.get(playerKey) || { active: false, cooldownUntil: 0 };
    state.active = false;
    ADRENALINE_EFFECT_STATES.set(playerKey, state);
  }
  return true;
}

function isSpellMasteryToggleOn(player) {
  const objective = getObjective(SPELL_MASTERY_TOGGLE_OBJECTIVE);
  const identity = player && player.scoreboardIdentity;
  if (!objective || !identity) {
    return false;
  }
  try {
    if (!objective.hasParticipant(identity)) {
      const enabled = isSkillUnlocked(player, "skill_spell_mastery");
      objective.setScore(identity, enabled ? 1 : 0);
      return enabled;
    }
    return (objective.getScore(identity) ?? 0) > 0;
  } catch {
    return false;
  }
}

function setSpellMasteryToggle(player, enabled) {
  const objective = getObjective(SPELL_MASTERY_TOGGLE_OBJECTIVE);
  const identity = player && player.scoreboardIdentity;
  if (!objective || !identity) {
    return false;
  }
  try {
    objective.setScore(identity, enabled ? 1 : 0);
    return true;
  } catch {
    return false;
  }
}

function isStaffMasteryToggleOn(player) {
  const objective = getObjective(STAFF_MASTERY_TOGGLE_OBJECTIVE);
  const identity = player && player.scoreboardIdentity;
  if (!objective || !identity) {
    return false;
  }
  try {
    if (!objective.hasParticipant(identity)) {
      const enabled = isSkillUnlocked(player, "skill_staff_mastery");
      objective.setScore(identity, enabled ? 1 : 0);
      return enabled;
    }
    return (objective.getScore(identity) ?? 0) > 0;
  } catch {
    return false;
  }
}

function setStaffMasteryToggle(player, enabled) {
  const objective = getObjective(STAFF_MASTERY_TOGGLE_OBJECTIVE);
  const identity = player && player.scoreboardIdentity;
  if (!objective || !identity) {
    return false;
  }
  try {
    objective.setScore(identity, enabled ? 1 : 0);
    return true;
  } catch {
    return false;
  }
}

function clearRetiredTargetToggleTags(player) {
  if (!player || !player.hasTag || !player.removeTag) {
    return;
  }
  for (const tag of [
    "mwr_patch_1_2_h_toggles",
    "mwr_toggle_init_adrenaline",
    "mwr_toggle_init_spell_mastery",
    "mwr_toggle_init_staff_mastery"
  ]) {
    try {
      if (player.hasTag(tag)) {
        player.removeTag(tag);
      }
    } catch {
      // A later player initialization pass can retry harmless tag cleanup.
    }
  }
}

function getSkillNodeByKey(key) {
  return SKILL_NODE_BY_KEY[key];
}

function skillBelongsToCurrentBuild(player, key) {
  const node = getSkillNodeByKey(key);
  if (!node) {
    return true;
  }
  for (const [classId, nodes] of Object.entries(CLASS_SKILL_NODES)) {
    if (nodes.indexOf(node) !== -1) {
      return getScore(player, "class_primary") === Number(classId);
    }
  }
  for (const [subclassId, nodes] of Object.entries(SUBCLASS_SKILL_NODES)) {
    if (nodes.indexOf(node) !== -1) {
      return getScore(player, "subclass_primary") === Number(subclassId);
    }
  }
  return true;
}

function ensureSkillTogglesInitialized(player) {
  ensurePublicSkillToggles(player);
  clearRetiredTargetToggleTags(player);
  if (getScore(player, "skill_toggles_ready") > 0) {
    return;
  }
  for (const node of ALL_SKILL_NODES) {
    if (!node.toggle ||
      node.key === "skill_public_adrenaline" ||
      node.key === "skill_spell_mastery" ||
      node.key === "skill_staff_mastery") {
      continue;
    }
    setScore(player, node.toggle, getSkillNodeLevel(player, node) > 0 ? 1 : 0);
  }
  setScore(player, "skill_toggles_ready", 1);
}

function isSkillToggleOn(player, key) {
  if (key === "skill_public_adrenaline") {
    return isAdrenalineToggleOn(player);
  }
  if (key === "skill_spell_mastery") {
    return isSpellMasteryToggleOn(player);
  }
  if (key === "skill_staff_mastery") {
    return isStaffMasteryToggleOn(player);
  }
  const node = getSkillNodeByKey(key);
  if (!node || !node.toggle) {
    return true;
  }
  ensureSkillTogglesInitialized(player);
  return getScore(player, node.toggle) > 0;
}

function isSkillActive(player, key) {
  return isSkillUnlocked(player, key) &&
    skillBelongsToCurrentBuild(player, key) &&
    isSkillToggleOn(player, key);
}

function getActiveSkillLevel(player, key, maxLevel) {
  if (!isSkillUnlocked(player, key) || !skillBelongsToCurrentBuild(player, key)) {
    return 0;
  }
  const raw = Math.max(0, getScore(player, key));
  return maxLevel === undefined ? raw : Math.min(maxLevel, raw);
}

function getPlayerXpLevel(player) {
  try {
    if (typeof player.level === "number") {
      return Math.max(0, Math.floor(player.level));
    }
  } catch {
    // Fall through to scoreboard-only XP.
  }
  return 0;
}

function syncXpAvailable(player) {
  const xpLevel = getPlayerXpLevel(player);
  const key = getEntityKey(player) || player.name;
  const cachedLevel = XP_LEVEL_CACHE.has(key) ? XP_LEVEL_CACHE.get(key) : xpLevel;
  const storedTotal = Math.max(0, getScore(player, "xp_total"));
  const xpBoostActive = isPublicSkillActive(player, "skill_public_xp_boost", "public_xp_boost_enabled");
  const boostedLevel = xpBoostActive
    ? Math.floor(xpLevel * 1.2)
    : xpLevel;
  const gainedLevels = Math.max(0, xpLevel - cachedLevel);
  const boostedGain = xpBoostActive
    ? Math.ceil(gainedLevels * 1.2)
    : gainedLevels;
  const total = Math.max(storedTotal + boostedGain, boostedLevel, storedTotal);
  XP_LEVEL_CACHE.set(key, xpLevel);
  if (total !== storedTotal) {
    setScore(player, "xp_total", total);
  }
  const spent = Math.max(0, getScore(player, "xp_spent"));
  const available = Math.max(0, total - spent);
  if (getScore(player, "xp_available") !== available) {
    setScore(player, "xp_available", available);
  }
  return available;
}

function getSkillNodeLevel(player, node) {
  return Math.max(0, getScore(player, node.key));
}

function getMissingSkillPrerequisite(player, node) {
  if (node.prerequisites) {
    for (const key of node.prerequisites) {
      if (!isSkillUnlocked(player, key)) {
        return key;
      }
    }
  }
  if (node.prerequisiteLevels) {
    for (const [key, level] of Object.entries(node.prerequisiteLevels)) {
      if (getScore(player, key) < level) {
        return `${key} ${level}`;
      }
    }
  }
  return "";
}

function canPurchaseNode(player, node) {
  if (getMissingSkillPrerequisite(player, node)) {
    return false;
  }
  if (node.repeatable) {
    return getSkillNodeLevel(player, node) < (node.max || 1);
  }
  return !isSkillUnlocked(player, node.key);
}

function purchaseSkillNode(player, node) {
  const available = syncXpAvailable(player);
  if (getMissingSkillPrerequisite(player, node)) {
    showToast(player, "Skill Locked", `${node.name} requires its prerequisite skills.`);
    return;
  }
  if (!canPurchaseNode(player, node)) {
    showToast(player, "Skill Tree", `${node.name} is already unlocked.`);
    return;
  }

  if (available < node.cost) {
    showToast(player, "Not Enough XP", `${node.name} costs ${node.cost} XP.`);
    return;
  }

  setScore(player, "xp_spent", getScore(player, "xp_spent") + node.cost);
  setScore(player, node.key, getScore(player, node.key) + 1);
  if (node.key === "skill_public_adrenaline") {
    setAdrenalineToggle(player, true);
  } else if (node.key === "skill_spell_mastery") {
    setSpellMasteryToggle(player, true);
  } else if (node.key === "skill_staff_mastery") {
    setStaffMasteryToggle(player, true);
  } else if (node.toggle) {
    setScore(player, node.toggle, 1);
    setScore(player, "skill_toggles_ready", 1);
  }
  setScore(player, "xp_tree_state", getScore(player, "xp_tree_state") + 1);
  syncXpAvailable(player);
  refreshRebuiltSkillFlags(player);

  if (node.ability && !node.ability.passive) {
    if (node.ability.classId && node.ability.slot >= 1 && node.ability.slot <= 5) {
      setScore(player, `ability_toggle_${node.ability.slot}`, 1);
    }
    giveAbilityItem(player, node.ability);
  }

  applyLycanVitality(player, node.key === "lycan_vitality");
  showToast(player, "Skill Unlocked", node.ability ? `${node.name} purchased. Ability item added.` : `${node.name} purchased.`);
  spawnFx(player, 1.1);
}

function resetAllSkillUnlocks(player) {
  const playerKey = getEntityKey(player) || player.name;
  resetClassAbilityCooldowns(player);
  for (const key of ALL_SKILL_KEYS) {
    setScore(player, key, 0);
  }
  for (const node of ALL_SKILL_NODES) {
    if (node.toggle &&
      node.key !== "skill_public_adrenaline" &&
      node.key !== "skill_spell_mastery" &&
      node.key !== "skill_staff_mastery") {
      setScore(player, node.toggle, 0);
    }
  }
  setScore(player, "lycan_vitality", 0);
  setScore(player, "xp_spent", 0);
  setScore(player, "xp_available", getScore(player, "xp_total"));
  setScore(player, "xp_tree_state", 0);
  setScore(player, "warrior_third_hit", 0);
  setScore(player, "tenacity_strike", 0);
  setScore(player, "morph_bonus", 0);
  setScore(player, "ww_bonus_hp", 0);
  setScore(player, "parkourist_active", 0);
  setScore(player, "adrenaline_active", 0);
  setScore(player, "midnight_strength_active", 0);
  setScore(player, "werewolf_scent_active", 0);
  setScore(player, SCENT_TOGGLE_OBJECTIVE, 0);
  setScore(player, SCENT_TOGGLE_READY_OBJECTIVE, 0);
  setScore(player, "banshee_phase_active", 0);
  setScore(player, "banshee_soul_active", 0);
  setScore(player, "fall_immunity_active", 0);
  setScore(player, "banshee_mind_fracture_enabled", 0);
  setSecondLifeScoreDirect(player, 0);
  setScore(player, "public_parkourist_enabled", 1);
  setScore(player, "public_hp_regen_enabled", 1);
  setScore(player, "public_xp_boost_enabled", 1);
  setScore(player, "public_skill_toggles_ready", 1);
  setScore(player, "skill_toggles_ready", 1);
  for (let slot = 1; slot <= 5; slot += 1) {
    setScore(player, `ability_toggle_${slot}`, 0);
  }
  setMultiJumpFallDamageSuppression(player, false);
  MULTI_JUMP_STATES.delete(playerKey);
  STAT_SPEED_STATES.delete(playerKey);
  VAMPIRE_MOVEMENT_STATES.delete(playerKey);
  MOVEMENT_DEFAULTS.delete(playerKey);
  JUMP_DEFAULTS.delete(playerKey);
  MIDNIGHT_STRENGTH_EFFECT_STATES.delete(playerKey);
  ADRENALINE_EFFECT_STATES.delete(playerKey);
  clearSecondLifeRuntimeState(player, true);
  SCENT_SCAN_STATES.delete(playerKey);
  UI_MESSAGE_LOCKS.delete(playerKey);
  if (player.hasTag && player.hasTag(BANSHEE_PHASE_TAG)) {
    player.removeTag(BANSHEE_PHASE_TAG);
  }
  if (player.hasTag && player.hasTag(SCENT_USER_TAG)) {
    player.removeTag(SCENT_USER_TAG);
  }
  for (const effectName of ["saturation", "invisibility", "resistance", "regeneration", "speed", "strength"]) {
    PASSIVE_EFFECT_STATES.delete(`${playerKey}:${effectName}`);
  }
}

function getClassSkillNodes(player) {
  return CLASS_SKILL_NODES[getScore(player, "class_primary")] || [];
}

function getSubclassSkillNodes(player) {
  return SUBCLASS_SKILL_NODES[getScore(player, "subclass_primary")] || [];
}

function getPlayerActiveAbilities(player) {
  const classId = getScore(player, "class_primary");
  const subclassId = getScore(player, "subclass_primary");
  return ABILITY_LIST.filter((ability) => {
    if (ability.passive) {
      return false;
    }
    if (ability.classId && ability.classId !== classId) {
      return false;
    }
    if (ability.subclassId && ability.subclassId !== subclassId) {
      return false;
    }
    return true;
  });
}

function getBuildSummary(player) {
  const classId = getScore(player, "class_primary");
  const subclassId = getScore(player, "subclass_primary");
  const fxId = getScore(player, "fx_color");
  const className = getNameById(CLASSES, classId);
  const subclassName = getNameById(SUBCLASSES, subclassId);
  const fxName = fxId === 0 ? "White" : getNameById(FX_COLORS, fxId);
  const availableXp = syncXpAvailable(player);
  const plasmaLine = classId === CLASS.VAMPIRE ? `\nPlasma: ${getScore(player, "plasma")}/${getScore(player, "plasma_max") || 100}` : "";
  const morphLine = getScore(player, "morph_state") > 0 ? `\nMorph: ${getMorphName(getScore(player, "morph_state"))}` : "";
  const treeState = hasChosenBuild(player) ? "Ready for XP unlocks" : "Locked until class and subclass are chosen";

  return [
    `Class: ${className}`,
    `Subclass: ${subclassName}`,
    `FX Color: ${fxName}`,
    `XP Available: ${availableXp}`,
    `Skill Tree: ${treeState}${plasmaLine}${morphLine}`
  ].join("\n");
}

async function showForm(player, form, onSelection) {
  if (!isPlayerValid(player)) {
    return;
  }

  try {
    const response = await form.show(player);
    if (response.canceled || response.selection === undefined) {
      return;
    }
    onSelection(response.selection);
  } catch (error) {
    console.warn(`[${NAMESPACE}] Form failed for ${player.name}: ${error}`);
  }
}

function getClassAbilities(classId) {
  return ABILITY_LIST.filter((ability) => ability.classId === classId);
}

function getClassCooldown(classId) {
  if (classId === CLASS.VAMPIRE) {
    return 0;
  }
  if (classId === CLASS.WEREWOLF || classId === CLASS.BANSHEE) {
    return 3;
  }
  return 0;
}

function getSubclassCooldown(subclassId) {
  switch (subclassId) {
    case SUBCLASS.WARRIOR:
      return 4;
    case SUBCLASS.NINJA:
      return 3;
    case SUBCLASS.WITCH:
      return 3;
    case SUBCLASS.ARCHER:
      return 2;
    case SUBCLASS.TANK:
      return 3;
    default:
      return 0;
  }
}

function getMorphName(state) {
  if (state === MORPH.BAT) {
    return "Bat Morph";
  }
  if (state === MORPH.SHADOW_WOLF) {
    return "Shadow Wolf Morph";
  }
  if (state === MORPH.BANSHEE) {
    return "Banshee Morph";
  }
  return "None";
}

function getFxParticle(player) {
  const fxId = getScore(player, "fx_color");
  const entry = FX_COLORS.find((color) => color.id === fxId);
  return entry ? entry.particle : FX_PARTICLE_IDS.white;
}

function spawnFx(player, height) {
  const y = typeof height === "number" ? height : 1.1;
  runPlayerCommand(player, `particle ${getFxParticle(player)} ~ ~${y} ~`);
}

function spawnForwardFxTrail(player, length, height) {
  const y = typeof height === "number" ? height : 1.0;
  for (let step = 1; step <= length; step += 1) {
    runPlayerCommand(player, `execute at @s positioned ^ ^${y} ^${step} run particle ${getFxParticle(player)} ~ ~ ~`);
  }
}

function spawnFxBurst(player, radius, count) {
  const particles = count || 8;
  for (let index = 0; index < particles; index += 1) {
    const angle = (Math.PI * 2 * index) / particles;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    runPlayerCommand(player, `execute at @s positioned ~${x.toFixed(2)} ~1 ~${z.toFixed(2)} run particle ${getFxParticle(player)} ~ ~ ~`);
  }
}

function spawnParticleSafe(dimension, particle, location) {
  try {
    dimension.spawnParticle(particle, location);
    return true;
  } catch {
    return runDimensionCommand(dimension, `particle ${particle} ${location.x.toFixed(2)} ${location.y.toFixed(2)} ${location.z.toFixed(2)}`);
  }
}

function spawnTankWindChargeFx(player, radius, waveIndex) {
  const points = 10 + waveIndex * 4;
  const particle = getFxParticle(player);
  const y = player.location.y + 0.2;
  for (let index = 0; index < points; index += 1) {
    const angle = (Math.PI * 2 * index) / points;
    const x = player.location.x + Math.cos(angle) * radius;
    const z = player.location.z + Math.sin(angle) * radius;
    const location = { x, y, z };
    spawnParticleSafe(player.dimension, "minecraft:basic_smoke_particle", location);
    spawnParticleSafe(player.dimension, "minecraft:large_explosion", { x, y: y + 0.05, z });
    spawnParticleSafe(player.dimension, particle, { x, y: y + 0.25, z });
    const inward = {
      x: player.location.x + Math.cos(angle) * Math.max(0.5, radius - 1.1),
      y: y + 0.35,
      z: player.location.z + Math.sin(angle) * Math.max(0.5, radius - 1.1)
    };
    spawnParticleSafe(player.dimension, "minecraft:basic_smoke_particle", inward);
    spawnParticleSafe(player.dimension, particle, inward);
  }
  spawnParticleSafe(player.dimension, "minecraft:large_explosion", {
    x: player.location.x,
    y: player.location.y + 0.5,
    z: player.location.z
  });
}

function getInventoryContainer(player) {
  try {
    const inventory = player.getComponent("inventory");
    return inventory ? inventory.container : undefined;
  } catch {
    return undefined;
  }
}

function hasInventoryItem(player, itemId) {
  const container = getInventoryContainer(player);
  if (!container) {
    return false;
  }

  try {
    for (let slot = 0; slot < container.size; slot += 1) {
      const stack = container.getItem(slot);
      if (stack && stack.typeId === itemId) {
        return true;
      }
    }
  } catch {
    return false;
  }
  return false;
}

function trimInventoryItemToOne(player, itemId) {
  const container = getInventoryContainer(player);
  if (!container) {
    return false;
  }

  let kept = false;
  try {
    for (let slot = 0; slot < container.size; slot += 1) {
      const stack = container.getItem(slot);
      if (!stack || stack.typeId !== itemId) {
        continue;
      }
      if (!kept) {
        stack.amount = 1;
        container.setItem(slot, stack);
        kept = true;
      } else {
        container.setItem(slot, undefined);
      }
    }
    return kept;
  } catch {
    return kept;
  }
}

function consumeOneSelectedInventoryItem(player, itemId) {
  const container = getInventoryContainer(player);
  if (!container) {
    return false;
  }

  const preferredSlot = typeof player.selectedSlotIndex === "number"
    ? player.selectedSlotIndex
    : typeof player.selectedSlot === "number"
      ? player.selectedSlot
      : -1;
  if (preferredSlot < 0 || preferredSlot >= container.size) {
    return false;
  }

  try {
    const stack = container.getItem(preferredSlot);
    if (!stack || stack.typeId !== itemId) {
      return false;
    }
    if ((stack.amount || 1) > 1) {
      stack.amount -= 1;
      container.setItem(preferredSlot, stack);
    } else {
      container.setItem(preferredSlot, undefined);
    }
    return true;
  } catch {
    return false;
  }
}

function createPersistentStack(itemId) {
  const stack = new ItemStack(itemId, 1);
  try {
    stack.keepOnDeath = true;
  } catch {
    // keepOnDeath is unavailable on older Script API previews.
  }
  return stack;
}

// These objectives are retained only so existing worlds can migrate without
// losing scoreboard data. Gameplay code does not read them.
const COMPATIBILITY_ONLY_SCOREBOARDS = new Set([
  "skill_knockback_boost",
  "skill_public_vitality",
  "cd_warrior_third_hit",
  "cd_ninja_multi_jump",
  "cd_witch_staff_mastery",
  "cd_archer_crit_focus",
  "cd_archer_knockback_boost",
  "skill_vampire_bite_enabled",
  "skill_summon_vampire_troops_enabled",
  "skill_vampire_compel_enabled",
  "skill_wolf_bite_enabled",
  "skill_werewolf_roar_enabled",
  "lycan_vitality_enabled",
  "skill_sonic_scream_enabled",
  "skill_banshee_invisibility_enabled",
  "skill_banshee_phase_enabled",
  "skill_banshee_soul_enabled",
  "skill_switch_throw_enabled",
  "skill_tenacity_charge_enabled",
  "skill_ninja_agility_enabled",
  "skill_multi_jump_enabled",
  "skill_dagger_throw_enabled",
  "skill_strikethrough_enabled",
  "skill_smoke_bomb_enabled",
  "skill_necromancy_enabled",
  "skill_chain_lightning_enabled",
  "skill_crit_focus_enabled",
  "skill_levitate_enabled",
  "skill_shield_slam_enabled",
  "skill_fortify_enabled",
  "skill_taunt_enabled",
  "skill_public_luck_enabled"
]);

function findInventorySlot(container, itemId) {
  if (!container) {
    return -1;
  }
  try {
    for (let slot = 0; slot < container.size; slot += 1) {
      const stack = container.getItem(slot);
      if (stack && stack.typeId === itemId) {
        return slot;
      }
    }
  } catch {
    return -1;
  }
  return -1;
}

function giveItemIfMissing(player, itemId) {
  if (hasInventoryItem(player, itemId)) {
    trimInventoryItemToOne(player, itemId);
    return true;
  }
  const container = getInventoryContainer(player);
  if (!container) {
    runPlayerCommand(player, `give @s ${itemId} 1`);
    return false;
  }
  try {
    return !container.addItem(createPersistentStack(itemId));
  } catch {
    runPlayerCommand(player, `give @s ${itemId} 1`);
    return false;
  }
}

function preserveDisplacedHotbarStack(player, container, stack, excludedSlot) {
  if (!stack) {
    return true;
  }
  try {
    for (let slot = 9; slot < container.size; slot += 1) {
      if (slot !== excludedSlot && !container.getItem(slot)) {
        container.setItem(slot, stack);
        return true;
      }
    }
    player.dimension.spawnItem(stack, player.location);
    return true;
  } catch {
    return false;
  }
}

function ensureItemInHotbar(player, itemId) {
  const container = getInventoryContainer(player);
  if (!container) {
    return false;
  }

  try {
    const hotbarSize = Math.min(9, container.size);
    let sourceSlot = findInventorySlot(container, itemId);
    if (sourceSlot >= 0 && sourceSlot < hotbarSize) {
      return true;
    }

    let targetSlot = -1;
    for (let slot = 0; slot < hotbarSize; slot += 1) {
      if (!container.getItem(slot)) {
        targetSlot = slot;
        break;
      }
    }
    if (targetSlot < 0) {
      const selected = typeof player.selectedSlotIndex === "number"
        ? player.selectedSlotIndex
        : typeof player.selectedSlot === "number"
          ? player.selectedSlot
          : 0;
      targetSlot = Math.max(0, Math.min(hotbarSize - 1, selected));
    }

    const targetStack = container.getItem(targetSlot);
    if (sourceSlot >= hotbarSize) {
      const sourceStack = container.getItem(sourceSlot);
      container.setItem(sourceSlot, targetStack);
      container.setItem(targetSlot, sourceStack);
      return true;
    }

    if (targetStack && !preserveDisplacedHotbarStack(player, container, targetStack, sourceSlot)) {
      return false;
    }
    container.setItem(targetSlot, createPersistentStack(itemId));
    return true;
  } catch {
    giveItemIfMissing(player, itemId);
    return false;
  }
}

function ensureGuideBook(player) {
  if (!isPlayerValid(player)) {
    return false;
  }
  const hasBook = trimInventoryItemToOne(player, RPG_BOOK_ID);
  if (hasBook) {
    return true;
  }
  return giveItemIfMissing(player, RPG_BOOK_ID);
}

function scheduleGuideBookRestore(player) {
  for (const delay of [1, 20, 60]) {
    system.runTimeout(() => {
      if (isPlayerValid(player)) {
        ensureGuideBook(player);
      }
    }, delay);
  }
}

function getHeldItemType(player) {
  const container = getInventoryContainer(player);
  if (!container) {
    return "";
  }

  const slotIndex = typeof player.selectedSlotIndex === "number"
    ? player.selectedSlotIndex
    : typeof player.selectedSlot === "number"
      ? player.selectedSlot
      : 0;

  try {
    const stack = container.getItem(slotIndex);
    return stack ? stack.typeId : "";
  } catch {
    return "";
  }
}

function getEquippedType(player, slotNames) {
  try {
    const equippable = player.getComponent("equippable") || player.getComponent("minecraft:equippable");
    if (!equippable || typeof equippable.getEquipment !== "function") {
      return "";
    }

    for (const slotName of slotNames) {
      try {
        const stack = equippable.getEquipment(slotName);
        if (stack && stack.typeId) {
          return stack.typeId;
        }
      } catch {
        // Some engine versions use different slot names.
      }
    }
  } catch {
    return "";
  }
  return "";
}

function hasEquippedAny(player, slotNames, ids) {
  const equipped = getEquippedType(player, slotNames);
  return equipped !== "" && ids.indexOf(equipped) !== -1;
}

function isSword(itemId) {
  return itemId.indexOf("sword") !== -1;
}

function isNight() {
  try {
    const time = world.getTimeOfDay();
    return time >= 13000 && time <= 23000;
  } catch {
    return false;
  }
}

function isWerewolfNightActive(player) {
  return getScore(player, "class_primary") === CLASS.WEREWOLF &&
    isOverworld(player) &&
    isNight();
}

function isDuskToDawn() {
  try {
    const time = world.getTimeOfDay();
    return time >= 12000;
  } catch {
    return false;
  }
}

function getDimensionId(entity) {
  try {
    return entity.dimension.id || "";
  } catch {
    return "";
  }
}

function isOverworld(entity) {
  const dimensionId = getDimensionId(entity);
  return dimensionId === "minecraft:overworld" || dimensionId === "overworld" || dimensionId === "";
}

function isNetherOrEnd(player) {
  const dimensionId = getDimensionId(player);
  return dimensionId === "minecraft:nether" ||
    dimensionId === "nether" ||
    dimensionId === "minecraft:the_end" ||
    dimensionId === "the_end";
}

function isThunderstorm() {
  try {
    if (typeof world.getWeather === "function") {
      return String(world.getWeather()).toLowerCase().indexOf("thunder") !== -1;
    }
  } catch {
    // Weather APIs vary by engine version.
  }

  try {
    const overworld = world.getDimension("overworld");
    if (overworld && typeof overworld.getWeather === "function") {
      return String(overworld.getWeather()).toLowerCase().indexOf("thunder") !== -1;
    }
  } catch {
    // Older builds may not expose dimension weather.
  }
  return false;
}

function isMidnightStrengthEnvironment(player) {
  if (isNetherOrEnd(player)) {
    return true;
  }
  if (!isOverworld(player)) {
    return false;
  }
  return isDuskToDawn() || isThunderstorm();
}

function isDaylightTime() {
  try {
    const time = world.getTimeOfDay();
    return time >= 0 && time < 12300;
  } catch {
    return true;
  }
}

function isTransparentForSun(typeId) {
  return typeId === "minecraft:air" ||
    typeId === "minecraft:cave_air" ||
    typeId === "minecraft:void_air" ||
    typeId.indexOf("water") !== -1;
}

function isSkyExposed(player) {
  try {
    if (player.dimension.id !== "minecraft:overworld") {
      return false;
    }

    const key = getEntityKey(player) || player.name;
    const tick = getTickNow();
    const cached = SKY_EXPOSURE_CACHE.get(key);
    if (cached && tick - cached.tick < SKY_EXPOSURE_CACHE_TICKS) {
      return cached.value;
    }

    const base = player.location;
    const x = Math.floor(base.x);
    const z = Math.floor(base.z);
    const startY = Math.floor(base.y) + 2;
    for (let y = startY; y <= 319; y += 1) {
      const block = player.dimension.getBlock({ x, y, z });
      if (block && !isTransparentForSun(block.typeId)) {
        SKY_EXPOSURE_CACHE.set(key, { tick, value: false });
        return false;
      }
    }
    SKY_EXPOSURE_CACHE.set(key, { tick, value: true });
    return true;
  } catch {
    return false;
  }
}

function isWaterBlock(typeId) {
  return typeId === "minecraft:water" || typeId.indexOf("water") !== -1;
}

function isPlayerInWater(player) {
  try {
    const location = player.location;
    const feet = player.dimension.getBlock({
      x: Math.floor(location.x),
      y: Math.floor(location.y),
      z: Math.floor(location.z)
    });
    const head = player.dimension.getBlock({
      x: Math.floor(location.x),
      y: Math.floor(location.y + 1),
      z: Math.floor(location.z)
    });
    return (feet && isWaterBlock(feet.typeId)) || (head && isWaterBlock(head.typeId));
  } catch {
    return false;
  }
}

function isPhaseBlocked(typeId) {
  return typeId === "minecraft:bedrock" ||
    typeId.indexOf("dirt") !== -1 ||
    typeId.indexOf("grass") !== -1;
}

function isAirLike(typeId) {
  return typeId === "minecraft:air" ||
    typeId === "minecraft:cave_air" ||
    typeId === "minecraft:void_air" ||
    typeId.indexOf("water") !== -1 ||
    typeId.indexOf("lava") !== -1;
}

function getBlockTypeAt(dimension, location) {
  try {
    const block = dimension.getBlock({
      x: Math.floor(location.x),
      y: Math.floor(location.y),
      z: Math.floor(location.z)
    });
    return block ? block.typeId : "minecraft:air";
  } catch {
    return "minecraft:air";
  }
}

function clearLegacyBansheePhaseTags(player) {
  try {
    for (const tag of ["mwr_banshee_phase_noclip", "mwr_banshee_return_creative", "mwr_banshee_return_adventure"]) {
      if (player.hasTag && player.hasTag(tag)) {
        player.removeTag(tag);
      }
    }
  } catch {
    // Legacy cleanup is best-effort and never changes game mode.
  }
}

function setBansheePhaseState(player, active) {
  const next = active ? 1 : 0;
  setScoreIfChanged(player, "banshee_phase_active", next);
  try {
    if (active && player.addTag && player.hasTag && !player.hasTag(BANSHEE_PHASE_TAG)) {
      player.addTag(BANSHEE_PHASE_TAG);
    } else if (!active && player.hasTag && player.hasTag(BANSHEE_PHASE_TAG)) {
      player.removeTag(BANSHEE_PHASE_TAG);
    }
  } catch {
    // Tags only mirror the scoreboard state.
  }
}

function toggleBansheePhase(player) {
  if (getScore(player, "class_primary") !== CLASS.BANSHEE || !isSkillActive(player, "skill_banshee_phase")) {
    setBansheePhaseState(player, false);
    showToast(player, "Banshee Phase", "Unlock Banshee Phase first.");
    return;
  }
  const active = getScore(player, "banshee_phase_active") > 0;
  setBansheePhaseState(player, !active);
  showToast(player, "Banshee Phase", active ? "OFF" : "ON");
  spawnFx(player, 0.9);
}

function isPhaseableWallBlock(typeId) {
  return !!typeId && !isAirLike(typeId) && !isPhaseBlocked(typeId);
}

function isBansheeBodySpaceClear(dimension, location) {
  const feetType = getBlockTypeAt(dimension, { x: location.x, y: location.y + 0.1, z: location.z });
  const chestType = getBlockTypeAt(dimension, { x: location.x, y: location.y + 0.9, z: location.z });
  const headType = getBlockTypeAt(dimension, { x: location.x, y: location.y + 1.65, z: location.z });
  return isAirLike(feetType) && isAirLike(chestType) && isAirLike(headType);
}

function getBansheeCardinalFacing(player) {
  let view = { x: 0, z: 1 };
  try {
    view = normalizeVector(player.getViewDirection());
  } catch {
    return { x: 0, z: 1 };
  }
  if (Math.abs(view.x) >= Math.abs(view.z)) {
    return { x: view.x >= 0 ? 1 : -1, z: 0 };
  }
  return { x: 0, z: view.z >= 0 ? 1 : -1 };
}

function getBansheePhaseState(player) {
  const key = getEntityKey(player) || player.name;
  const now = getTickNow();
  const current = player.location;
  const state = BANSHEE_PHASE_STATES.get(key) || {
    lastLocation: current,
    cooldownUntil: 0
  };
  return { key, now, state };
}

function isBansheeMovingHorizontallyIntoWall(player, facing, state) {
  try {
    const velocity = typeof player.getVelocity === "function" ? player.getVelocity() : undefined;
    if (velocity && Math.abs(Number(velocity.y) || 0) > 0.12) {
      return false;
    }
  } catch {
    // If velocity is unavailable, keep the horizontal input fallback below.
  }

  const input = getPlayerInputMovement(player);
  if (input.z > 0.05 || Math.abs(input.x) > 0.05 || isPlayerSprinting(player)) {
    return true;
  }

  const current = player.location;
  const last = state.lastLocation || current;
  const deltaForward = ((current.x - last.x) * facing.x) + ((current.z - last.z) * facing.z);
  return deltaForward > 0.004;
}

function getBansheeWallPhaseDestination(player, facing) {
  const location = player.location;
  const frontBlockX = Math.floor(location.x + facing.x * 0.65);
  const frontBlockZ = Math.floor(location.z + facing.z * 0.65);
  const behindBlockX = frontBlockX + facing.x;
  const behindBlockZ = frontBlockZ + facing.z;
  const front = {
    x: frontBlockX + 0.5,
    y: location.y,
    z: frontBlockZ + 0.5
  };
  const frontFeetType = getBlockTypeAt(player.dimension, { x: front.x, y: front.y + 0.1, z: front.z });
  const frontChestType = getBlockTypeAt(player.dimension, { x: front.x, y: front.y + 0.9, z: front.z });
  const frontHeadType = getBlockTypeAt(player.dimension, { x: front.x, y: front.y + 1.65, z: front.z });
  if (isPhaseBlocked(frontFeetType) || isPhaseBlocked(frontChestType) || isPhaseBlocked(frontHeadType)) {
    return undefined;
  }

  const touchingWall =
    isPhaseableWallBlock(frontFeetType) ||
    isPhaseableWallBlock(frontChestType);
  if (!touchingWall) {
    return undefined;
  }

  const destination = {
    x: facing.x === 0 ? location.x : behindBlockX + 0.5,
    y: location.y,
    z: facing.z === 0 ? location.z : behindBlockZ + 0.5
  };
  const exitProbe = {
    x: destination.x,
    y: location.y,
    z: destination.z
  };
  return isBansheeBodySpaceClear(player.dimension, destination) &&
    isBansheeBodySpaceClear(player.dimension, exitProbe)
    ? destination
    : undefined;
}

function getPlayerInputMovement(player) {
  try {
    const inputInfo = player.inputInfo;
    if (inputInfo && typeof inputInfo.getMovementVector === "function") {
      const movement = inputInfo.getMovementVector();
      return {
        x: Number(movement.x) || 0,
        z: Number(movement.y !== undefined ? movement.y : movement.z) || 0
      };
    }
  } catch {
    // Input APIs vary across Bedrock versions.
  }
  return { x: 0, z: 0 };
}

function phaseBansheeForward(player) {
  clearLegacyBansheePhaseTags(player);
  if (getScore(player, "class_primary") !== CLASS.BANSHEE) {
    setBansheePhaseState(player, false);
    return;
  }
  if (getScore(player, "banshee_phase_active") <= 0 || !isSkillActive(player, "skill_banshee_phase")) {
    if (player.hasTag && player.hasTag(BANSHEE_PHASE_TAG)) {
      player.removeTag(BANSHEE_PHASE_TAG);
    }
    return;
  }

  const phase = getBansheePhaseState(player);
  const facing = getBansheeCardinalFacing(player);
  if (phase.now < (phase.state.cooldownUntil || 0)) {
    phase.state.lastLocation = player.location;
    BANSHEE_PHASE_STATES.set(phase.key, phase.state);
    return;
  }

  if (!isBansheeMovingHorizontallyIntoWall(player, facing, phase.state)) {
    phase.state.lastLocation = player.location;
    BANSHEE_PHASE_STATES.set(phase.key, phase.state);
    return;
  }

  const destination = getBansheeWallPhaseDestination(player, facing);
  if (!destination) {
    phase.state.lastLocation = player.location;
    BANSHEE_PHASE_STATES.set(phase.key, phase.state);
    return;
  }

  try {
    player.teleport(destination, {
      dimension: player.dimension,
      rotation: player.getRotation()
    });
    phase.state.cooldownUntil = phase.now + BANSHEE_PHASE_COOLDOWN_TICKS;
    phase.state.lastLocation = destination;
    BANSHEE_PHASE_STATES.set(phase.key, phase.state);
    spawnFx(player, 0.8);
  } catch {
    // Keep the toggle state intact; a failed pass-through just skips this tick.
  }
}

function getForwardClimbDirections(player) {
  try {
    const view = normalizeVector(player.getViewDirection());
    if (Math.abs(view.x) > Math.abs(view.z)) {
      return [{ x: view.x >= 0 ? 1 : -1, z: 0 }];
    }
    if (Math.abs(view.z) > 0.05) {
      return [{ x: 0, z: view.z >= 0 ? 1 : -1 }];
    }
  } catch {
    // Fall through to broad contact probing when view data is unavailable.
  }
  return [
    { x: 1, z: 0 },
    { x: -1, z: 0 },
    { x: 0, z: 1 },
    { x: 0, z: -1 }
  ];
}

function isClimbableWerewolfSurface(typeId) {
  return !!typeId &&
    !isAirLike(typeId) &&
    typeId !== "minecraft:bedrock";
}

function hasWerewolfClimbContact(player) {
  try {
    const location = player.location;
    const baseX = Math.floor(location.x);
    const baseZ = Math.floor(location.z);
    const yChecks = [
      Math.floor(location.y),
      Math.floor(location.y + 1),
      Math.floor(location.y + 1.8)
    ];

    for (const direction of getForwardClimbDirections(player)) {
      for (const y of yChecks) {
        const block = player.dimension.getBlock({
          x: baseX + direction.x,
          y,
          z: baseZ + direction.z
        });
        if (block && isClimbableWerewolfSurface(block.typeId)) {
          return true;
        }
      }
    }
  } catch {
    return false;
  }
  return false;
}

function processWerewolfClimb(player) {
  if (getScore(player, "class_primary") !== CLASS.WEREWOLF) {
    try {
      if (player.hasTag("mwr_werewolf_climbing")) {
        runPlayerCommand(player, "effect @s levitation 0 0 true");
        player.removeTag("mwr_werewolf_climbing");
      }
    } catch {
      // Climb cleanup is best-effort if the class changes mid-climb.
    }
    return;
  }
  if (!isPlayerJumping(player) || !hasWerewolfClimbContact(player)) {
    try {
      if (player.hasTag("mwr_werewolf_climbing")) {
        runPlayerCommand(player, "effect @s levitation 0 0 true");
        player.removeTag("mwr_werewolf_climbing");
      }
    } catch {
      // Climb cleanup is best-effort on engine builds with limited tags/effects.
    }
    return;
  }

  try {
    player.addTag("mwr_werewolf_climbing");
  } catch {
    // Tags are only used to know when to clear the short climb effect.
  }
  runPlayerCommand(player, `effect @s levitation ${WEREWOLF_CLIMB_EFFECT_SECONDS} ${WEREWOLF_CLIMB_EFFECT_AMPLIFIER} true`);
  forceTickFallReset(player);
}

function isPlayerOnGround(player) {
  try {
    if (typeof player.isOnGround === "boolean") {
      return player.isOnGround;
    }
  } catch {
    // Fall back to block probing.
  }

  try {
    const location = player.location;
    const block = player.dimension.getBlock({
      x: Math.floor(location.x),
      y: Math.floor(location.y - 0.15),
      z: Math.floor(location.z)
    });
    return !!block && !isAirLike(block.typeId);
  } catch {
    return false;
  }
}

function getPlayerInputStateKey(player) {
  return getEntityKey(player) || player.name || "";
}

function setPlayerButtonHeld(player, button, held) {
  const key = getPlayerInputStateKey(player);
  if (!key || (button !== INPUT_BUTTON_JUMP && button !== INPUT_BUTTON_SNEAK)) {
    return;
  }
  const state = PLAYER_BUTTON_HELD_STATES.get(key) || {};
  state[button] = !!held;
  PLAYER_BUTTON_HELD_STATES.set(key, state);
}

function getLiveButtonState(player, button) {
  try {
    return player.inputInfo && typeof player.inputInfo.getButtonState === "function"
      ? String(player.inputInfo.getButtonState(button))
      : "";
  } catch {
    return "";
  }
}

function captureDamageIndicatorContext(target) {
  try {
    if (!target || !target.dimension || !target.location) {
      return undefined;
    }
    return {
      dimension: target.dimension,
      location: {
        x: target.location.x,
        y: target.location.y,
        z: target.location.z
      }
    };
  } catch {
    return undefined;
  }
}

function emitSkillDamageIndicator(context, owner, soundEvent, particle) {
  if (!context || !context.dimension || !context.location) {
    return;
  }
  const location = {
    x: context.location.x,
    y: context.location.y + 0.9,
    z: context.location.z
  };
  spawnParticleSafe(context.dimension, particle || "minecraft:critical_hit_emitter", location);
  if (isPlayerValid(owner)) {
    spawnParticleSafe(context.dimension, getFxParticle(owner), {
      x: location.x,
      y: location.y + 0.35,
      z: location.z
    });
  }
  const sound = soundEvent || "game.player.hurt";
  runDimensionCommand(context.dimension,
    `execute positioned ${location.x.toFixed(2)} ${location.y.toFixed(2)} ${location.z.toFixed(2)} run playsound ${sound} @a[r=24] ~ ~ ~ 0.65 1.1`);
}

function emitVanillaHurtIndicator(target, context, owner, particle) {
  if (target && isEntityAlive(target)) {
    try {
      const health = target.getComponent("minecraft:health");
      const expectedHealth = health && typeof health.currentValue === "number" ? health.currentValue : 0;
      if (health && typeof health.setCurrentValue === "function" && expectedHealth > 0.05 &&
        typeof target.applyDamage === "function") {
        target.applyDamage(0.01);
        health.setCurrentValue(expectedHealth);
      } else {
        const result = runCommandCompat(target, "damage @s 0 magic");
        if (result && typeof result.catch === "function") {
          result.catch(() => {});
        }
      }
    } catch {
      // The particle and sound remain available if the target command surface is unavailable.
    }
  }
  emitSkillDamageIndicator(context, owner, "game.player.hurt", particle);
}

function isPlayerButtonHeld(player, button) {
  const liveState = getLiveButtonState(player, button);
  if (liveState === BUTTON_STATE_PRESSED) {
    return true;
  }
  if (liveState === BUTTON_STATE_RELEASED) {
    return false;
  }

  const key = getPlayerInputStateKey(player);
  const tracked = key ? PLAYER_BUTTON_HELD_STATES.get(key) : undefined;
  return !!(tracked && tracked[button]);
}

function getPlayerMovementVector(player) {
  try {
    if (player.inputInfo && typeof player.inputInfo.getMovementVector === "function") {
      const movement = player.inputInfo.getMovementVector();
      return {
        x: Number(movement.x) || 0,
        y: Number(movement.y) || 0
      };
    }
  } catch {
    // Older runtimes may not expose per-tick movement vectors.
  }
  return { x: 0, y: 0 };
}

function isPlayerJumping(player) {
  try {
    if (typeof player.isJumping === "boolean" && player.isJumping) {
      return true;
    }
  } catch {
    // Fall back to input info below.
  }

  return isPlayerButtonHeld(player, INPUT_BUTTON_JUMP);
}

function isPlayerSneakingHeld(player) {
  try {
    if (typeof player.isSneaking === "boolean" && player.isSneaking) {
      return true;
    }
  } catch {
    // Fall back to tracked button state below.
  }
  return isPlayerButtonHeld(player, INPUT_BUTTON_SNEAK);
}

function isPlayerSprinting(player) {
  try {
    return typeof player.isSprinting === "boolean" ? player.isSprinting : false;
  } catch {
    return false;
  }
}

function ensurePublicSkillToggles(player) {
  if (getScore(player, "public_skill_toggles_ready") > 0) {
    return;
  }
  setScore(player, "public_parkourist_enabled", 1);
  setScore(player, "public_hp_regen_enabled", 1);
  setScore(player, "public_xp_boost_enabled", 1);
  setScore(player, "public_skill_toggles_ready", 1);
}

function isPublicSkillActive(player, skillKey, toggleObjective) {
  const node = getSkillNodeByKey(skillKey);
  if (node && node.toggle) {
    return isSkillActive(player, skillKey);
  }
  if (node) {
    return isSkillUnlocked(player, skillKey);
  }
  ensurePublicSkillToggles(player);
  return isSkillUnlocked(player, skillKey) && getScore(player, toggleObjective) > 0;
}

function getPublicSkillToggleLabel(player, node) {
  if (!isSkillUnlocked(player, node.key)) {
    return "";
  }
  if (node.key === "skill_vampire_sun_immunity") {
    return isVampireSunImmunitySkillActive(player) ? "ON" : "OFF";
  }
  if (!node.toggle) {
    return "";
  }
  if (node.key === "skill_public_adrenaline") {
    return isAdrenalineToggleOn(player) ? "ON" : "OFF";
  }
  if (node.key === "skill_spell_mastery") {
    return isSpellMasteryToggleOn(player) ? "ON" : "OFF";
  }
  if (node.key === "skill_staff_mastery") {
    return isStaffMasteryToggleOn(player) ? "ON" : "OFF";
  }
  return getScore(player, node.toggle) > 0 ? "ON" : "OFF";
}

function togglePublicSkill(player, node) {
  if (!isSkillUnlocked(player, node.key)) {
    return;
  }
  if (node.key === "skill_vampire_sun_immunity") {
    const next = toggleVampireSunImmunitySkill(player);
    if (typeof next === "boolean") {
      showToast(player, node.name, next ? "ON" : "OFF");
    }
    return;
  }
  if (!node.toggle) {
    return;
  }
  if (node.key === "skill_public_adrenaline") {
    const next = !isAdrenalineToggleOn(player);
    if (setAdrenalineToggle(player, next)) {
      refreshRebuiltSkillFlags(player);
      showToast(player, node.name, next ? "ON" : "OFF");
    }
    return;
  }
  if (node.key === "skill_spell_mastery") {
    const next = !isSpellMasteryToggleOn(player);
    if (setSpellMasteryToggle(player, next)) {
      refreshRebuiltSkillFlags(player);
      showToast(player, node.name, next ? "ON" : "OFF");
    }
    return;
  }
  if (node.key === "skill_staff_mastery") {
    const next = !isStaffMasteryToggleOn(player);
    if (setStaffMasteryToggle(player, next)) {
      refreshRebuiltSkillFlags(player);
      showToast(player, node.name, next ? "ON" : "OFF");
    }
    return;
  }
  ensureSkillTogglesInitialized(player);
  const next = getScore(player, node.toggle) > 0 ? 0 : 1;
  setScore(player, node.toggle, next);
  handleSkillToggleChanged(player, node, next > 0);
  refreshRebuiltSkillFlags(player);
  showToast(player, node.name, next > 0 ? "ON" : "OFF");
}

function handleSkillToggleChanged(player, node, enabled) {
  if (enabled) {
    applyLycanVitality(player, false);
    if (node.key === "skill_midnight_strength") {
      processMidnightStrengthEffect(player);
    }
    return;
  }

  const key = node.key;
  if (key === "skill_public_parkours") {
    setScore(player, "parkourist_active", 0);
    applyParkouristJumpStat(player);
  }
  if (key === "skill_midnight_strength") {
    setScore(player, "midnight_strength_active", 0);
    MIDNIGHT_STRENGTH_EFFECT_STATES.delete(getEntityKey(player) || player.name);
    if (!isAdrenalineActiveNow(player)) {
      runPlayerCommand(player, "effect @s strength 0 0 true");
    }
  }
  if (key === "skill_werewolf_scent") {
    setScoreIfChanged(player, "werewolf_scent_active", enabled ? 1 : 0);
    if (!enabled) {
      setScentUserTag(player, false);
      clearScentSuppressionTagsForPlayer(player);
      SCENT_SCAN_STATES.delete(getEntityKey(player) || player.name);
    }
  }
}

function ensureScentToggleState(player) {
  const unlocked = isPlayerValid(player) &&
    getScore(player, "class_primary") === CLASS.WEREWOLF &&
    isSkillUnlocked(player, "skill_werewolf_scent");
  if (!unlocked) {
    setScoreIfChanged(player, SCENT_TOGGLE_OBJECTIVE, 0);
    setScoreIfChanged(player, SCENT_TOGGLE_READY_OBJECTIVE, 0);
    return 0;
  }
  if (getScore(player, SCENT_TOGGLE_READY_OBJECTIVE) <= 0) {
    setScoreIfChanged(player, SCENT_TOGGLE_OBJECTIVE, 1);
    setScoreIfChanged(player, SCENT_TOGGLE_READY_OBJECTIVE, 1);
  }
  return getScore(player, SCENT_TOGGLE_OBJECTIVE) > 0 ? 1 : 0;
}

function ensureMidnightStrengthToggleState(player) {
  if (!isPlayerValid(player) ||
    getScore(player, "class_primary") !== CLASS.VAMPIRE ||
    !isSkillUnlocked(player, "skill_midnight_strength")) {
    return 0;
  }
  setScoreIfChanged(player, "skill_midnight_strength_enabled", 1);
  return 1;
}

function refreshRebuiltSkillFlags(player) {
  ensurePublicSkillToggles(player);
  ensureMidnightStrengthToggleState(player);
  const parkourist = isPublicSkillActive(player, "skill_public_parkours", "public_parkourist_enabled") ? 1 : 0;
  const adrenaline = isAdrenalineActiveNow(player) ? 1 : 0;
  const midnight = isSkillActive(player, "skill_midnight_strength") ? 1 : 0;
  const scent = ensureScentToggleState(player);
  const soul = isSkillActive(player, "skill_banshee_soul") ? 1 : 0;
  setScoreIfChanged(player, "parkourist_active", parkourist);
  setScoreIfChanged(player, "adrenaline_active", adrenaline);
  setScoreIfChanged(player, "midnight_strength_active", midnight);
  setScoreIfChanged(player, "werewolf_scent_active", scent);
  setScoreIfChanged(player, "banshee_soul_active", soul);
}

function getNinjaAgilityBonus(player) {
  const level = getActiveSkillLevel(player, "skill_ninja_agility", 5);
  return NINJA_AGILITY_SPEED_BONUSES[level] || 0;
}

function getRebuiltMovementBonus(player) {
  let bonus = 0;
  const sprinting = isPlayerSprinting(player);
  if (sprinting && getScore(player, "parkourist_active") > 0) {
    bonus += PARKOURIST_SPEED_BONUS;
  }
  if (sprinting && getScore(player, "subclass_primary") === SUBCLASS.NINJA) {
    bonus += getNinjaAgilityBonus(player);
  }
  if (sprinting && getScore(player, "class_primary") === CLASS.WEREWOLF) {
    bonus += WEREWOLF_DAY_SPEED_BONUS;
  }
  if (getScore(player, "class_primary") === CLASS.VAMPIRE && getScore(player, "midnight_strength_active") > 0 && isMidnightStrengthEnvironment(player)) {
    bonus += MIDNIGHT_STRENGTH_SPEED_BONUS;
  }
  if (getScore(player, "adrenaline_active") > 0 && isAdrenalineActiveNow(player)) {
    bonus += PARKOURIST_SPEED_BONUS;
  }
  if (sprinting && isWerewolfNightActive(player)) {
    bonus += WEREWOLF_NIGHT_SPEED_BONUS;
  }
  return bonus;
}

function isMidnightStrengthActiveNow(player) {
  return getScore(player, "class_primary") === CLASS.VAMPIRE &&
    isSkillActive(player, "skill_midnight_strength") &&
    isMidnightStrengthEnvironment(player);
}

function isAdrenalineActiveNow(player) {
  if (!isSkillActive(player, "skill_public_adrenaline") ||
    getCurrentHealth(player) > ADRENALINE_HEALTH_THRESHOLD) {
    return false;
  }
  const key = getEntityKey(player) || player.name;
  const state = ADRENALINE_EFFECT_STATES.get(key);
  return !!(state && state.active);
}

function processAdrenalineEffect(player) {
  const key = getEntityKey(player) || player.name;
  const state = ADRENALINE_EFFECT_STATES.get(key) || { active: false, cooldownUntil: 0 };
  const enabled = isSkillActive(player, "skill_public_adrenaline");
  const lowHealth = getCurrentHealth(player) <= ADRENALINE_HEALTH_THRESHOLD;
  const now = getTickNow();

  if (!enabled) {
    state.active = false;
    setScoreIfChanged(player, "adrenaline_active", 0);
    ADRENALINE_EFFECT_STATES.set(key, state);
    return;
  }

  if (state.active && !lowHealth) {
    state.active = false;
  }

  if (!state.active && lowHealth && now >= state.cooldownUntil) {
    state.active = true;
    state.cooldownUntil = now + ADRENALINE_COOLDOWN_TICKS;
  }

  if (state.active && lowHealth) {
    setScoreIfChanged(player, "adrenaline_active", 1);
    ADRENALINE_EFFECT_STATES.set(key, state);
    return;
  }

  setScoreIfChanged(player, "adrenaline_active", 0);
  ADRENALINE_EFFECT_STATES.set(key, state);
}

function processMidnightStrengthEffect(player) {
  const key = getEntityKey(player) || player.name;
  const state = MIDNIGHT_STRENGTH_EFFECT_STATES.get(key) || { active: false };
  const active = isMidnightStrengthActiveNow(player);

  if (active) {
    setScoreIfChanged(player, "midnight_strength_active", 1);
    if (!state.active) {
      runPlayerCommand(player, "effect @s strength 999999 1 true");
      state.active = true;
      MIDNIGHT_STRENGTH_EFFECT_STATES.set(key, state);
    }
    return;
  }

  if (state.active && !isAdrenalineActiveNow(player)) {
    runPlayerCommand(player, "effect @s strength 0 0 true");
  }
  MIDNIGHT_STRENGTH_EFFECT_STATES.set(key, { active: false });
}

function resetMovementMultiplier(player) {
  const key = getEntityKey(player) || player.name;
  if (!MOVEMENT_DEFAULTS.has(key)) {
    return false;
  }

  const component = getMovementComponent(player);
  const base = MOVEMENT_DEFAULTS.get(key);
  MOVEMENT_DEFAULTS.delete(key);
  if (!component || typeof component.setCurrentValue !== "function" || typeof base !== "number" || base <= 0) {
    return false;
  }

  try {
    component.setCurrentValue(base);
    return true;
  } catch {
    return false;
  }
}

function applyRebuiltMovementStats(player) {
  const key = getEntityKey(player) || player.name;
  const bonus = getRebuiltMovementBonus(player);
  if (getScore(player, "class_primary") === CLASS.VAMPIRE) {
    applyVampireMovementStats(player, bonus);
    return;
  }

  VAMPIRE_MOVEMENT_STATES.delete(key);
  if (bonus <= 0) {
    resetMovementMultiplier(player);
    STAT_SPEED_STATES.delete(key);
    return;
  }

  if (applyMovementMultiplier(player, 1 + bonus)) {
    STAT_SPEED_STATES.delete(key);
    return;
  }

  const state = STAT_SPEED_STATES.get(key) || { tick: 0 };
  state.tick += 1;
  STAT_SPEED_STATES.set(key, state);
  if (state.tick % 2 !== 0) {
    return;
  }

  let view = { x: 0, y: 0, z: 1 };
  try {
    view = normalizeVector(player.getViewDirection());
  } catch {
    // Direction data can be missing during player load.
  }
  const strength = Math.min(0.18, bonus * 0.065);
  applyEntityImpulse(player, {
    x: view.x * strength,
    y: 0,
    z: view.z * strength
  });
}

function applyVampireMovementStats(player, bonus) {
  const key = getEntityKey(player) || player.name;
  const state = VAMPIRE_MOVEMENT_STATES.get(key);

  if (bonus <= 0) {
    if (state?.applied || MOVEMENT_DEFAULTS.has(key)) {
      resetMovementMultiplier(player);
    }
    VAMPIRE_MOVEMENT_STATES.delete(key);
    STAT_SPEED_STATES.delete(key);
    return;
  }

  // Beacon and ability Speed effects own movement while present. Never clear,
  // replace, or downgrade their amplifier with the Vampire passive.
  if (getEffectRemainingTicks(player, "speed").duration > 0) {
    if (state?.applied || MOVEMENT_DEFAULTS.has(key)) {
      resetMovementMultiplier(player);
    }
    if (!state || state.applied || state.multiplier !== 0) {
      VAMPIRE_MOVEMENT_STATES.set(key, { applied: false, multiplier: 0 });
    }
    STAT_SPEED_STATES.delete(key);
    return;
  }

  const multiplier = 1 + bonus;
  if (state?.applied && Math.abs(state.multiplier - multiplier) < 0.0001) {
    return;
  }

  if (applyMovementMultiplier(player, multiplier)) {
    VAMPIRE_MOVEMENT_STATES.set(key, { applied: true, multiplier });
    STAT_SPEED_STATES.delete(key);
  }
}

function applyVerticalBurst(player, lift) {
  return applyEntityImpulse(player, { x: 0, y: lift, z: 0 });
}

function getPlayerVerticalVelocity(player) {
  try {
    const velocity = typeof player.getVelocity === "function" ? player.getVelocity() : undefined;
    return velocity && Number.isFinite(Number(velocity.y)) ? Number(velocity.y) : 0;
  } catch {
    return 0;
  }
}

function forceTickFallReset(player) {
  runPlayerCommand(player, "effect @s resistance 1 255 true");
  applyTrueDamage(player, 0);
  return true;
}

function processParkourist(player) {
  applyParkouristJumpStat(player);
}

// Multi-Jump is intentionally split into input, ground state, immunity state,
// and damage interception so a future rewrite can replace one layer at a time.
function enableMultiJumpFallImmunity(player) {
  const key = getEntityKey(player) || player.name;
  const state = getMultiJumpState(player);
  state.fallImmunityActive = true;
  state.fallImmunityUntilTick = 0;
  state.groundedGraceTicks = 0;
  state.lastYVelocity = getPlayerVerticalVelocity(player);
  MULTI_JUMP_STATES.set(key, state);
  if (player.addTag) {
    player.addTag("mwr_multi_jump_fall_immunity");
  }
  setScoreIfChanged(player, "fall_immunity_active", 1);
}

function disableMultiJumpFallImmunity(player) {
  const key = getEntityKey(player) || player.name;
  const state = getMultiJumpState(player);
  state.fallImmunityActive = false;
  state.fallImmunityUntilTick = 0;
  state.groundedGraceTicks = 0;
  MULTI_JUMP_STATES.set(key, state);
  if (player.hasTag && player.hasTag("mwr_multi_jump_fall_immunity")) {
    player.removeTag("mwr_multi_jump_fall_immunity");
  }
  setScoreIfChanged(player, "fall_immunity_active", 0);
}

function clearMultiJumpState(player) {
  const key = getEntityKey(player) || player.name;
  if (getScore(player, "fall_immunity_active") > 0 || (player.hasTag && player.hasTag("mwr_multi_jump_fall_immunity"))) {
    disableMultiJumpFallImmunity(player);
  }
  if (MULTI_JUMP_STATES.has(key)) {
    MULTI_JUMP_STATES.delete(key);
  }
  setScoreIfChanged(player, "ninja_air_jumps", 0);
}

function getMaxMultiJumps(player) {
  return getScore(player, "subclass_primary") === SUBCLASS.NINJA
    ? getActiveSkillLevel(player, "skill_multi_jump", 3)
    : 0;
}

function getMultiJumpState(player) {
  const key = getEntityKey(player) || player.name;
  let state = MULTI_JUMP_STATES.get(key);
  if (!state) {
    state = {
      jumpsUsed: 0,
      wasGrounded: isPlayerOnGround(player),
      airTicks: 0,
      lastGroundTick: isPlayerOnGround(player) ? getTickNow() : 0,
      fallImmunityActive: false,
      fallImmunityUntilTick: 0,
      groundedGraceTicks: 0,
      lastYVelocity: 0
    };
    MULTI_JUMP_STATES.set(key, state);
  }
  return state;
}

function tryUseMultiJump(player) {
  if (!isPlayerValid(player)) {
    return false;
  }

  const maxExtraJumps = getMaxMultiJumps(player);
  if (maxExtraJumps <= 0) {
    return false;
  }

  const state = getMultiJumpState(player);
  const now = getTickNow();
  const grounded = isPlayerOnGround(player);
  let yVelocity = 0;
  try {
    yVelocity = typeof player.getVelocity === "function" ? player.getVelocity().y || 0 : 0;
  } catch {
    yVelocity = 0;
  }
  const ticksSinceGround = state.lastGroundTick > 0 ? now - state.lastGroundTick : MULTI_JUMP_COYOTE_TICKS + 1;
  const staleGroundedRead = grounded && !state.wasGrounded && state.airTicks > 0;
  const withinCoyoteWindow = state.airTicks > 0 && ticksSinceGround <= MULTI_JUMP_COYOTE_TICKS;
  const airborneForExtraJump = !grounded ||
    staleGroundedRead ||
    withinCoyoteWindow ||
    (state.airTicks > 0 && yVelocity > 0.05);
  if (!airborneForExtraJump) {
    return false;
  }
  if (state.jumpsUsed >= maxExtraJumps) {
    return false;
  }
  let view = { x: 0, y: 0, z: 0 };
  if (isPlayerSprinting(player)) {
    view = getHorizontalViewDirection(player);
  }

  const jumped = applyEntityImpulse(player, {
    x: view.x * MULTI_JUMP_FORWARD_BURST,
    y: MULTI_JUMP_LIFT,
    z: view.z * MULTI_JUMP_FORWARD_BURST
  }) || applyVerticalBurst(player, MULTI_JUMP_LIFT);
  if (!jumped) {
    return false;
  }

  state.jumpsUsed += 1;
  state.wasGrounded = false;
  state.airTicks = Math.max(1, state.airTicks || 1);
  MULTI_JUMP_STATES.set(getEntityKey(player) || player.name, state);
  setScoreIfChanged(player, "ninja_air_jumps", state.jumpsUsed);
  enableMultiJumpFallImmunity(player);
  spawnFx(player, 0.6);
  return true;
}

function processRebuiltMultiJump(player) {
  const key = getEntityKey(player) || player.name;
  const maxExtraJumps = getMaxMultiJumps(player);

  if (maxExtraJumps <= 0) {
    clearMultiJumpState(player);
    return;
  }

  const grounded = isPlayerOnGround(player);
  const state = getMultiJumpState(player);
  const now = getTickNow();
  const yVelocity = getPlayerVerticalVelocity(player);

  if (grounded) {
    state.lastGroundTick = now;
    state.jumpsUsed = 0;
    state.airTicks = 0;
    state.wasGrounded = true;
    state.lastYVelocity = yVelocity;
    setScoreIfChanged(player, "ninja_air_jumps", 0);
    MULTI_JUMP_STATES.set(key, state);
    if (state.fallImmunityActive || getScore(player, "fall_immunity_active") > 0) {
      state.groundedGraceTicks = (state.groundedGraceTicks || 0) + 1;
      MULTI_JUMP_STATES.set(key, state);
      if (state.groundedGraceTicks >= MULTI_JUMP_LANDING_GRACE_TICKS) {
        disableMultiJumpFallImmunity(player);
      }
    }
    return;
  }

  state.groundedGraceTicks = 0;
  if (state.fallImmunityActive && player.addTag && player.hasTag && !player.hasTag("mwr_multi_jump_fall_immunity")) {
    player.addTag("mwr_multi_jump_fall_immunity");
  }

  state.airTicks += 1;
  state.wasGrounded = false;
  state.lastYVelocity = yVelocity;
  MULTI_JUMP_STATES.set(key, state);
}

function hasMultiJumpFallImmunity(player) {
  if (!player || player.typeId !== "minecraft:player") {
    return false;
  }

  if (getScore(player, "fall_immunity_active") > 0 ||
    (player.hasTag && player.hasTag("mwr_multi_jump_fall_immunity"))) {
    return true;
  }
  const state = MULTI_JUMP_STATES.get(getEntityKey(player) || player.name);
  return !!state && state.fallImmunityActive === true;
}

function setMultiJumpFallDamageSuppression(player, active) {
  if (!isPlayerValid(player)) {
    return;
  }
  if (active) {
    enableMultiJumpFallImmunity(player);
  } else if (hasMultiJumpFallImmunity(player) || getScore(player, "fall_immunity_active") > 0) {
    disableMultiJumpFallImmunity(player);
  }
}

function processFallDamageSystems(player) {
  if (hasMultiJumpFallImmunity(player)) {
    const yVelocity = getPlayerVerticalVelocity(player);
    const state = MULTI_JUMP_STATES.get(getEntityKey(player) || player.name);
    const airborneLongEnough = state && (state.airTicks || 0) > MULTI_JUMP_MIN_AIR_TICKS_FOR_FALL;
    if (!isPlayerOnGround(player) && (yVelocity < MULTI_JUMP_FALL_VELOCITY_THRESHOLD || airborneLongEnough)) {
      forceTickFallReset(player);
    }
  }
  const grounded = isPlayerOnGround(player);
  if (!grounded) {
    return;
  }

  const key = getEntityKey(player) || player.name;
  const state = MULTI_JUMP_STATES.get(key);
  if (state && state.fallImmunityActive) {
    state.groundedGraceTicks = (state.groundedGraceTicks || 0) + 1;
    MULTI_JUMP_STATES.set(key, state);
    if (state.groundedGraceTicks >= MULTI_JUMP_LANDING_GRACE_TICKS) {
      disableMultiJumpFallImmunity(player);
    }
  }
}

function addPlasma(player, amount) {
  const max = Math.max(1, getScore(player, "plasma_max") || 100);
  const current = getScore(player, "plasma");
  setScore(player, "plasma", Math.max(0, Math.min(max, current + amount)));
  system.runTimeout(() => showPlasmaHud(player), 1);
}

function spendVampirePlasma(player, amount) {
  const current = getScore(player, "plasma");
  if (current < amount) {
    showToast(player, "No Plasma", `Need ${amount} plasma.`);
    return false;
  }

  addPlasma(player, -amount);
  return true;
}

function applyTrueDamage(entity, amount) {
  const damage = Math.max(0, Number(amount) || 0);
  if (entity && entity.typeId === "minecraft:player" &&
    getScore(entity, "morph_state") === MORPH.BANSHEE &&
    isSkillUnlocked(entity, "skill_banshee_morph")) {
    return;
  }
  if (damage <= 0) {
    return;
  }
  if (entity && entity.typeId === "minecraft:player") {
    if (shouldSecondLifeDenyDamage(entity, damage, "scripted_true_damage")) {
      return;
    }
  }

  try {
    const health = entity.getComponent("minecraft:health");
    if (health && typeof health.currentValue === "number" && typeof health.setCurrentValue === "function") {
      health.setCurrentValue(Math.max(0, health.currentValue - damage));
      return;
    }
  } catch {
    // Fall back to command damage.
  }

  try {
    if (typeof entity.applyDamage === "function") {
      entity.applyDamage(damage);
      return;
    }
  } catch {
    // Fall back to command damage.
  }

  try {
    const result = runCommandCompat(entity, `damage @s ${Math.ceil(damage)} magic`);
    if (result && typeof result.catch === "function") {
      result.catch(() => {});
    }
  } catch {
    // Some non-player entities cannot run commands.
  }
}

function applyBansheeSonicSelfCost(player) {
  const damage = 2;
  if (!isPlayerValid(player)) {
    return false;
  }
  if (shouldSecondLifeDenyDamage(player, damage, "banshee_sonic_self_cost")) {
    return true;
  }
  const playerKey = getEntityKey(player) || player.name;
  const currentHealth = getCurrentHealth(player);
  if (playerKey && currentHealth > 0 && currentHealth <= damage) {
    const expiresAt = getTickNow() + 10;
    BANSHEE_SONIC_SELF_DEATHS.set(playerKey, {
      playerName: player.name,
      expiresAt
    });
    system.runTimeout(() => {
      const mark = BANSHEE_SONIC_SELF_DEATHS.get(playerKey);
      if (mark && mark.expiresAt <= getTickNow()) {
        BANSHEE_SONIC_SELF_DEATHS.delete(playerKey);
      }
    }, 10);
  }
  try {
    const health = player.getComponent("minecraft:health");
    if (health && typeof health.currentValue === "number" && typeof health.setCurrentValue === "function") {
      health.setCurrentValue(Math.max(0, health.currentValue - damage));
      return true;
    }
  } catch {
    // Fall back to command damage.
  }
  runPlayerCommand(player, `damage @s ${damage} magic`);
  return true;
}

function applyEntityAttackDamage(attacker, target, amount) {
  const damage = Math.max(1, Math.ceil(Number(amount) || 0));
  if (!attacker || !target || damage <= 0 || !isPlayerValid(attacker) || !isPlayerValid(target)) {
    return false;
  }
  if (target.typeId === "minecraft:player" &&
    shouldSecondLifeDenyDamage(target, damage, "scripted_entity_attack")) {
    return true;
  }

  const damageTag = `mwr_damage_target_${getTickNow()}_${Math.floor(Math.random() * 100000)}`;
  try {
    if (target.addTag) {
      target.addTag(damageTag);
      const result = runCommandCompat(attacker, `damage @e[tag=${damageTag},c=1] ${damage} entity_attack entity @s`);
      if (result && typeof result.catch === "function") {
        result.catch(() => {
          if (isPlayerValid(target)) {
            applyTrueDamage(target, damage);
          }
        });
      }
      system.runTimeout(() => {
        try {
          if (isPlayerValid(target) && target.removeTag) {
            target.removeTag(damageTag);
          }
        } catch {
          // Damage target may have died or unloaded.
        }
      }, 2);
      return true;
    }
  } catch {
    // Fall through to direct API damage.
  }

  try {
    if (typeof target.applyDamage === "function") {
      target.applyDamage(damage, { cause: "entityAttack", damagingEntity: attacker });
      return true;
    }
  } catch {
    // Direct source damage is not available for every entity type.
  }

  applyTrueDamage(target, damage);
  return true;
}

function wouldDamageBeLethal(target, amount) {
  try {
    const health = target.getComponent("minecraft:health");
    if (health && typeof health.currentValue === "number") {
      return health.currentValue <= Math.max(1, Number(amount) || 0);
    }
  } catch {
    // Unknown health surfaces are marked briefly so entityDie can still attribute the hit.
  }
  return true;
}

function applySpellPenalty(player) {
  if (getScore(player, "subclass_primary") === SUBCLASS.WITCH) {
    showToast(player, "Spell Bottle", "Witches avoid spell backlash.");
    spawnFx(player, 1.1);
    return;
  }

  let damage = 10;
  try {
    const health = player.getComponent("minecraft:health");
    if (health && typeof health.currentValue === "number") {
      damage = Math.max(1, Math.ceil(health.currentValue / 2));
    }
  } catch {
    damage = 10;
  }

  applyTrueDamage(player, damage);
  showToast(player, "Spell Backlash", "Non-witches lose half their current hearts.");
  spawnFx(player, 1.2);
}

function isWitch(player) {
  return getScore(player, "subclass_primary") === SUBCLASS.WITCH;
}

function hasSpellMastery(player) {
  return isWitch(player) && isSkillActive(player, "skill_spell_mastery");
}

function getSpellDamage(player, baseDamage) {
  let damage = baseDamage;
  if (hasSpellMastery(player)) {
    damage = Math.ceil(damage * 1.2);
  }
  return damage;
}

function getPotionDuration(_player, baseSeconds) {
  return baseSeconds;
}

function getReducedCooldown(player, baseCooldown, masterySkill) {
  if (masterySkill && isSkillActive(player, masterySkill)) {
    return Math.max(1, Math.ceil(baseCooldown * 0.8));
  }
  return baseCooldown;
}

function getSpellCooldownObjective(itemId) {
  return SPELL_COOLDOWN_OBJECTIVES[itemId] || "cd_spell";
}

function getTemporarySpellBlockKey(dimension, location) {
  const dimensionId = String((dimension && dimension.id) || "dimension");
  return `${dimensionId}:${Math.floor(location.x)}:${Math.floor(location.y)}:${Math.floor(location.z)}`;
}

function placeTemporarySpellBlock(dimension, location, blockId, durationTicks) {
  const blockLocation = {
    x: Math.floor(location.x),
    y: Math.floor(location.y),
    z: Math.floor(location.z)
  };
  const currentType = getBlockTypeAt(dimension, blockLocation);
  if (!isAirLike(currentType)) {
    return false;
  }
  const belowType = getBlockTypeAt(dimension, {
    x: blockLocation.x,
    y: blockLocation.y - 1,
    z: blockLocation.z
  });
  if (isAirLike(belowType)) {
    return false;
  }
  const key = getTemporarySpellBlockKey(dimension, blockLocation);
  const command = `setblock ${blockLocation.x} ${blockLocation.y} ${blockLocation.z} ${blockId} replace`;
  if (!runDimensionCommand(dimension, command)) {
    return false;
  }
  TEMPORARY_SPELL_BLOCKS.set(key, {
    dimension,
    location: blockLocation,
    blockId,
    expiresAt: getTickNow() + (durationTicks || SPELL_TEMP_BLOCK_DURATION_TICKS)
  });
  return true;
}

function cleanupTemporarySpellBlock(entry) {
  if (!entry || !entry.dimension || !entry.location) {
    return;
  }
  const currentType = getBlockTypeAt(entry.dimension, entry.location);
  if (currentType === entry.blockId) {
    runDimensionCommand(entry.dimension, `setblock ${entry.location.x} ${entry.location.y} ${entry.location.z} minecraft:air replace`);
  }
}

function trackTemporarySpellEntity(entity, durationTicks) {
  if (!entity) {
    return;
  }
  const key = getEntityKey(entity) || `spell_entity_${getTickNow()}_${Math.floor(Math.random() * 100000)}`;
  TEMPORARY_SPELL_ENTITIES.set(key, {
    entity,
    expiresAt: getTickNow() + (durationTicks || SPELL_TEMP_ENTITY_DURATION_TICKS)
  });
  try {
    if (entity.addTag) {
      entity.addTag("mwr_spell_fx_entity");
    }
  } catch {
    // Cosmetic entity cleanup still tracks by reference.
  }
}

function processTemporarySpellFx() {
  const now = getTickNow();
  for (const [key, entry] of Array.from(TEMPORARY_SPELL_BLOCKS.entries())) {
    if (now >= entry.expiresAt) {
      cleanupTemporarySpellBlock(entry);
      TEMPORARY_SPELL_BLOCKS.delete(key);
    }
  }
  for (const [key, entry] of Array.from(TEMPORARY_SPELL_ENTITIES.entries())) {
    if (now >= entry.expiresAt || !isEntityAlive(entry.entity)) {
      removeEntity(entry.entity);
      TEMPORARY_SPELL_ENTITIES.delete(key);
    }
  }
}

function getSpellFxOffsets(radius) {
  const offsets = [{ x: 0, z: 0 }];
  for (const offset of [
    { x: 1, z: 0 }, { x: -1, z: 0 }, { x: 0, z: 1 }, { x: 0, z: -1 },
    { x: 1, z: 1 }, { x: -1, z: 1 }, { x: 1, z: -1 }, { x: -1, z: -1 },
    { x: 2, z: 0 }, { x: -2, z: 0 }, { x: 0, z: 2 }, { x: 0, z: -2 }
  ]) {
    if (offset.x * offset.x + offset.z * offset.z <= radius * radius) {
      offsets.push(offset);
    }
  }
  return offsets;
}

function spawnFireSpellArea(player) {
  const base = player.location;
  for (const offset of getSpellFxOffsets(2.4)) {
    if (offset.x === 0 && offset.z === 0) {
      continue;
    }
    const location = { x: base.x + offset.x, y: base.y, z: base.z + offset.z };
    placeTemporarySpellBlock(player.dimension, location, "minecraft:fire", SPELL_TEMP_BLOCK_DURATION_TICKS);
  }
  spawnFxBurst(player, 3.2, 18);
  runPlayerCommand(player, "execute at @s run particle minecraft:basic_flame_particle ~ ~1 ~");
  const cleanupCenter = { x: base.x, y: base.y, z: base.z };
  system.runTimeout(() => clearFireAroundLocation(player.dimension, cleanupCenter, 2.4), SPELL_TEMP_BLOCK_DURATION_TICKS);
}

function clearFireAroundLocation(dimension, center, radius) {
  const maxRadius = Math.max(1, Math.ceil(radius || 1));
  for (let x = -maxRadius; x <= maxRadius; x += 1) {
    for (let z = -maxRadius; z <= maxRadius; z += 1) {
      if (x * x + z * z > maxRadius * maxRadius) {
        continue;
      }
      for (let y = -1; y <= 1; y += 1) {
        const location = {
          x: Math.floor(center.x + x),
          y: Math.floor(center.y + y),
          z: Math.floor(center.z + z)
        };
        if (getBlockTypeAt(dimension, location) === "minecraft:fire") {
          runDimensionCommand(dimension, `setblock ${location.x} ${location.y} ${location.z} minecraft:air replace`);
        }
      }
    }
  }
}

function spawnIceSpellArea(player) {
  const base = player.location;
  for (const offset of getSpellFxOffsets(2.6)) {
    const location = { x: base.x + offset.x, y: base.y, z: base.z + offset.z };
    placeTemporarySpellBlock(player.dimension, location, "minecraft:snow_layer", SPELL_TEMP_BLOCK_DURATION_TICKS);
  }
  spawnFxBurst(player, 3.2, 18);
  runPlayerCommand(player, "execute at @s run particle minecraft:snowflake_particle ~ ~1 ~");
}

function spawnPoisonSpellArea(player) {
  spawnFxBurst(player, 3.2, 20);
  for (let index = 0; index < 8; index += 1) {
    const angle = (Math.PI * 2 * index) / 8;
    runPlayerCommand(player, `execute at @s positioned ~${(Math.cos(angle) * 2.2).toFixed(2)} ~0.8 ~${(Math.sin(angle) * 2.2).toFixed(2)} run particle ${FX_PARTICLE_IDS.green} ~ ~ ~`);
  }
  try {
    const slime = player.dimension.spawnEntity("minecraft:slime", {
      x: player.location.x,
      y: player.location.y,
      z: player.location.z
    });
    slime.nameTag = "Poison Cloud";
    runCommandCompat(slime, "effect @s invisibility 6 0 true").catch(() => {});
    runCommandCompat(slime, "effect @s slowness 6 255 true").catch(() => {});
    trackTemporarySpellEntity(slime, SPELL_TEMP_ENTITY_DURATION_TICKS);
  } catch {
    // Poison cloud creature FX is optional; particles and poison effect still run.
  }
}

function spawnSpellFx(player, itemId) {
  const primary = SPELL_FX_PARTICLES[itemId] || getFxParticle(player);
  const secondary = itemId === SPELL_IDS.fireBomb
    ? FX_PARTICLE_IDS.red
    : itemId === SPELL_IDS.iceBomb
      ? FX_PARTICLE_IDS.white
      : FX_PARTICLE_IDS.green;

  for (let index = 0; index < 14; index += 1) {
    const angle = (Math.PI * 2 * index) / 14;
    const radius = index % 2 === 0 ? 1.4 : 2.4;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const particle = index % 3 === 0 ? secondary : primary;
    runPlayerCommand(player, `execute at @s positioned ~${x.toFixed(2)} ~1 ~${z.toFixed(2)} run particle ${particle} ~ ~ ~`);
  }
  if (itemId === SPELL_IDS.fireBomb) {
    spawnFireSpellArea(player);
  } else if (itemId === SPELL_IDS.iceBomb) {
    spawnIceSpellArea(player);
  } else if (itemId === SPELL_IDS.poisonBomb) {
    spawnPoisonSpellArea(player);
  }
}

function useSpell(player, itemId) {
  const baseCooldown = SPELL_COOLDOWNS[itemId] || 3;
  const cooldownObjective = getSpellCooldownObjective(itemId);
  const cooldown = getScore(player, cooldownObjective);
  if (cooldown > 0) {
    showToast(player, "Spell Cooldown", `${cooldown}s`);
    return;
  }

  if (!isWitch(player)) {
    applySpellPenalty(player);
  }

  const damage = getSpellDamage(player, 7);
  if (itemId === SPELL_IDS.fireBomb) {
    runPlayerCommand(player, "effect @s fire_resistance 15 1 true");
  }
  spawnSpellFx(player, itemId);
  if (itemId === SPELL_IDS.fireBomb) {
    runPlayerCommand(player, `execute at @s run damage @e[r=5,type=!minecraft:player] ${damage} fire`);
    runPlayerCommand(player, "execute at @s run effect @e[r=5,type=!minecraft:player] wither 3 0 true");
    showToast(player, "Fire Bomb", "Fire burst detonated.");
  } else if (itemId === SPELL_IDS.iceBomb) {
    runPlayerCommand(player, `execute at @s run damage @e[r=5,type=!minecraft:player] ${damage} freezing`);
    runPlayerCommand(player, "execute at @s run effect @e[r=5,type=!minecraft:player] slowness 6 2 true");
    showToast(player, "Ice Bomb", "Ice burst detonated.");
  } else if (itemId === SPELL_IDS.poisonBomb) {
    runPlayerCommand(player, `execute at @s run damage @e[r=5,type=!minecraft:player] ${damage} magic`);
    runPlayerCommand(player, "execute at @s run effect @e[r=5,type=!minecraft:player] poison 7 1 true");
    showToast(player, "Poison Bomb", "Poison burst detonated.");
  }

  setScore(player, cooldownObjective, getReducedCooldown(player, baseCooldown, "skill_spell_mastery"));
}

function getStaffCycleState(player) {
  const key = getEntityKey(player) || player.name || "staff";
  let state = STAFF_CYCLE_STATES.get(key);
  if (!state) {
    state = { timeIndex: 0, weatherIndex: 0 };
    STAFF_CYCLE_STATES.set(key, state);
  }
  return state;
}

function useStaffOfDestructionWeatherTime(player) {
  const state = getStaffCycleState(player);
  const sneaking = !!player.isSneaking;

  try {
    if (sneaking) {
      const weather = STAFF_WEATHER_SEQUENCE[state.weatherIndex % STAFF_WEATHER_SEQUENCE.length];
      state.weatherIndex = (state.weatherIndex + 1) % STAFF_WEATHER_SEQUENCE.length;
      player.dimension.setWeather(weather.type, STAFF_WEATHER_DURATION_TICKS);
      showToast(player, "Staff of Destruction", `Weather: ${weather.name}`);
    } else {
      const time = STAFF_TIME_SEQUENCE[state.timeIndex % STAFF_TIME_SEQUENCE.length];
      state.timeIndex = (state.timeIndex + 1) % STAFF_TIME_SEQUENCE.length;
      world.setTimeOfDay(time.tick);
      showToast(player, "Staff of Destruction", `Time: ${time.name}`);
    }
    spawnFx(player, 1.0);
    spawnFxBurst(player, 2.0, 8);
    if (!isWitch(player)) {
      applyTrueDamage(player, STAFF_DESTRUCTION_NON_WITCH_HEALTH_COST);
    }
    return true;
  } catch {
    showToast(player, "Staff of Destruction", "The world resisted the shift.");
    return false;
  }
}

function useWeaponActive(player, itemId) {
  if (!isPlayerValid(player) || !itemId) {
    return;
  }

  const cooldownObjective = getWeaponCooldownObjective(itemId);
  const witchStaffUser = itemId === WEAPON_IDS.witchStaff && isWitch(player);
  if (!witchStaffUser) {
    const cooldown = getScore(player, cooldownObjective);
    if (cooldown > 0) {
      showToast(player, "Weapon Cooldown", `${cooldown}s`);
      return;
    }
  }

  if (itemId === WEAPON_IDS.witchStaff) {
    if (useStaffOfDestructionWeatherTime(player)) {
      setScore(player, cooldownObjective, witchStaffUser ? 0 : STAFF_DESTRUCTION_NON_WITCH_COOLDOWN_SECONDS);
    }
  }
}

function removeRoarWolvesForOwner(player) {
  const playerKey = getEntityKey(player) || player.name || "";
  for (const [wolfKey, entry] of ACTIVE_ROAR_WOLVES) {
    if (!entry) {
      continue;
    }
    if (entry.ownerPlayerKey === playerKey || entry.ownerName === player.name) {
      removeEntity(entry.wolf);
      ACTIVE_ROAR_WOLVES.delete(wolfKey);
    }
  }
}

function cleanupWerewolfRebirthState(player) {
  clearScentSuppressionTagsForPlayer(player);
  try {
    for (const tag of [SCENT_USER_TAG, "mwr_werewolf_climbing", "mwr_morphed"]) {
      if (player.hasTag && player.hasTag(tag)) {
        player.removeTag(tag);
      }
    }
  } catch {
    // Tags may already be clear.
  }
  removeRoarWolvesForOwner(player);
  SCENT_SCAN_STATES.delete(getEntityKey(player) || player.name);
  setScore(player, "morph_state", MORPH.NONE);
  setScore(player, "morph_request", MORPH.NONE);
  setScore(player, "morph_bonus", 0);
  setScore(player, "lycan_vitality", 0);
  setScore(player, "ww_bonus_hp", 0);
  setScore(player, "werewolf_scent_active", 0);
  setScore(player, SCENT_TOGGLE_OBJECTIVE, 0);
  setScore(player, SCENT_TOGGLE_READY_OBJECTIVE, 0);
  runPlayerCommand(player, "effect @s health_boost 0 0 true");
  runPlayerCommand(player, "effect @s levitation 0 0 true");
  runPlayerCommand(player, "effect @s weakness 0 0 true");
  runPlayerCommand(player, "effect @s slowness 0 0 true");
  runPlayerCommand(player, "effect @s clear speed");
  runPlayerCommand(player, "effect @s strength 0 0 true");
}

function clearActiveAbilityRuntimeForPlayer(player) {
  const playerKey = getEntityKey(player) || player.name;
  for (const [key, state] of Array.from(ACTIVE_SWITCH_THROWS.entries())) {
    if (state.ownerKey === playerKey) {
      removeEntity(state.entity);
      ACTIVE_SWITCH_THROWS.delete(key);
    }
  }
  for (const [key, state] of Array.from(ACTIVE_DAGGER_THROWS.entries())) {
    if (state.ownerKey === playerKey) {
      removeEntity(state.entity);
      ACTIVE_DAGGER_THROWS.delete(key);
    }
  }
  ACTIVE_TENACITY_CHARGES.delete(playerKey);
  for (const [key, mark] of Array.from(SWITCH_THROW_KILL_MARKS.entries())) {
    if (mark && mark.ownerName === player.name) {
      SWITCH_THROW_KILL_MARKS.delete(key);
    }
  }
  for (const [key, mark] of Array.from(SONIC_SCREAM_KILL_MARKS.entries())) {
    if (mark && (mark.ownerKey === playerKey || mark.ownerName === player.name)) {
      SONIC_SCREAM_KILL_MARKS.delete(key);
    }
  }
}

function clearClassAbilityItems(player) {
  const container = getInventoryContainer(player);
  if (!container) {
    for (const itemId of ABILITY_ITEM_IDS) {
      runPlayerCommand(player, `clear @s ${itemId}`);
    }
    return;
  }
  try {
    for (let slot = 0; slot < container.size; slot += 1) {
      const stack = container.getItem(slot);
      if (stack && ABILITY_ITEM_IDS.has(stack.typeId)) {
        container.setItem(slot, undefined);
      }
    }
  } catch {
    for (const itemId of ABILITY_ITEM_IDS) {
      runPlayerCommand(player, `clear @s ${itemId}`);
    }
  }
}

function clearRebirthClassTags(player) {
  const fixedTags = new Set([
    SCENT_USER_TAG,
    BANSHEE_PHASE_TAG,
    NECROMANCY_OWNER_TAG,
    NECROMANCY_OWNER_ID_TAG,
    NECROMANCY_OWNER_NAME_TAG,
    NECROMANCY_OWNER_UUID_TAG,
    "mwr_werewolf_climbing",
    "mwr_morphed",
    "mwr_banshee_invisible",
    "mwr_banshee_phase_noclip",
    "mwr_bat_morph_active",
    "mwr_bat_tiny_profile",
    "mwr_second_life_invulnerable"
  ]);
  try {
    for (const tag of player.getTags ? player.getTags() : []) {
      if (fixedTags.has(tag) ||
        tag.indexOf("mwr_morph_") === 0 ||
        tag.indexOf("mwr_owner_") === 0 ||
        tag.indexOf("owner_id_") === 0 ||
        tag.indexOf("owner_name_") === 0 ||
        tag.indexOf("owner_uuid_") === 0) {
        player.removeTag(tag);
      }
    }
  } catch {
    // Tag cleanup is best-effort after authoritative scoreboards are reset.
  }
}

function resetClassRuntimeState(player) {
  clearActiveAbilityRuntimeForPlayer(player);
  clearClassAbilityItems(player);
  clearMorph(player);
  cleanupNecromancyRebirthState(player);
  cleanupVampireTroopsForOwner(player);
  cleanupWerewolfRebirthState(player);
  clearRebirthClassTags(player);
  setBatFlightAbility(player, false);
  setScore(player, "morph_state", MORPH.NONE);
  setScore(player, "morph_request", MORPH.NONE);
  setScore(player, "morph_bonus", 0);
  setScore(player, "plasma_max", 100);
  setScore(player, "plasma", 100);
  setScore(player, "plasma_drain", 0);
  if (player.hasTag) {
    for (const tag of ["mwr_bat_morph_active", "mwr_bat_tiny_profile", "mwr_morphed", "mwr_morph_bat", "mwr_morph_shadow_wolf", "mwr_morph_banshee"]) {
      try {
        if (player.hasTag(tag)) {
          player.removeTag(tag);
        }
      } catch {
        // Tags may be unavailable while the player is unloading.
      }
    }
  }
  runPlayerCommand(player, "effect @s slow_falling 0 0 true");
  runPlayerCommand(player, "effect @s levitation 0 0 true");
}

function performRebirth(player) {
  const refunded = getScore(player, "xp_spent");
  resetClassRuntimeState(player);
  setScore(player, "class_primary", 0);
  setScore(player, "class_request", 0);
  setScore(player, "class_confirmed", 0);
  setScore(player, "subclass_primary", 0);
  setScore(player, "subclass_request", 0);
  setScore(player, "subclass_confirmed", 0);
  clearLegacyBansheePhaseTags(player);
  setBansheePhaseState(player, false);
  player.removeTag("mwr_banshee_invisible");
  runPlayerCommand(player, "effect @s invisibility 0 0 true");
  resetAllSkillUnlocks(player);
  setScore(player, "rebirth_count", getScore(player, "rebirth_count") + 1);
  ensureGuideBook(player);
  showToast(player, "Rebirth Complete", `Class, subclass, and skills reset. ${refunded} XP refunded.`);
  spawnFx(player, 1.2);
}

function performRebirthFromItem(player, consumeSelectedSlot) {
  if (!isPlayerValid(player)) {
    return;
  }
  if (player.hasTag && player.hasTag("mwr_rebirth_processing")) {
    return;
  }
  try {
    if (player.addTag) {
      player.addTag("mwr_rebirth_processing");
    }
  } catch {
    // The item lock is best-effort; the reset below is still authoritative.
  }
  if (consumeSelectedSlot && !consumeOneSelectedInventoryItem(player, REBIRTH_POTION_ID)) {
    try {
      player.removeTag("mwr_rebirth_processing");
    } catch {
      // The selected-slot guard failed before Rebirth changed player state.
    }
    return;
  }
  performRebirth(player);
  system.runTimeout(() => {
    if (isPlayerValid(player) && player.hasTag && player.hasTag("mwr_rebirth_processing")) {
      player.removeTag("mwr_rebirth_processing");
    }
  }, 20);
}

function isAbilityEnabled(player, ability) {
  if (ability.skill) {
    return isSkillUnlocked(player, ability.skill);
  }
  return true;
}

function giveAbilityItem(player, ability) {
  if (typeof ability === "string") {
    const node = getSkillNodeByKey(ability);
    ability = ABILITY_BY_ITEM_ID[ability] || (node ? node.ability : undefined);
  }
  if (!ability || ability.passive) {
    return;
  }
  scheduleAbilityItemGrant(player, ability);
}

function isAbilityGrantEligible(player, ability) {
  if (!isPlayerValid(player) || !ability || ability.passive) {
    return false;
  }
  if (ability.classId && getScore(player, "class_primary") !== ability.classId) {
    return false;
  }
  if (ability.subclassId && getScore(player, "subclass_primary") !== ability.subclassId) {
    return false;
  }
  return ability.baseline || (ability.skill && isSkillUnlocked(player, ability.skill));
}

function scheduleAbilityItemGrant(player, ability) {
  if (!isAbilityGrantEligible(player, ability)) {
    return false;
  }
  if (hasInventoryItem(player, ability.itemId)) {
    trimInventoryItemToOne(player, ability.itemId);
    ensureItemInHotbar(player, ability.itemId);
    return false;
  }
  giveItemIfMissing(player, ability.itemId);
  ensureItemInHotbar(player, ability.itemId);
  return true;
}

function reconcileUnlockedAbilityItems(player) {
  if (!isPlayerValid(player)) {
    return 0;
  }
  let restored = 0;
  for (const ability of getPlayerActiveAbilities(player)) {
    if (!isAbilityGrantEligible(player, ability)) {
      continue;
    }
    const hadItem = hasInventoryItem(player, ability.itemId);
    if (scheduleAbilityItemGrant(player, ability) || !hadItem) {
      restored += 1;
    }
  }
  return restored;
}

function scheduleUnlockedAbilityItemGrants(player) {
  return reconcileUnlockedAbilityItems(player);
}

function setAbilityToggle(player, ability, enabled) {
  if (ability.slot >= 1 && ability.slot <= 5) {
    setScore(player, `ability_toggle_${ability.slot}`, enabled ? 1 : 0);
  }
  if (enabled) {
    giveAbilityItem(player, ability);
    showToast(player, "Ability Enabled", `${ability.name} was restored immediately.`);
  } else {
    showToast(player, "Ability Disabled", `${ability.name} stays in your hotbar.`);
  }
}

function resetAbilityToggles(player) {
  for (let index = 1; index <= 5; index += 1) {
    setScore(player, `ability_toggle_${index}`, 0);
  }
}

function hasActiveSwitchThrowForOwner(player) {
  const ownerKey = getEntityKey(player) || player.name;
  for (const state of ACTIVE_SWITCH_THROWS.values()) {
    if (state.ownerKey === ownerKey) {
      return true;
    }
  }
  return false;
}

function canUseAbility(player, ability) {
  const classId = getScore(player, "class_primary");
  const subclassId = getScore(player, "subclass_primary");
  if (ability.passive) {
    showToast(player, "Passive Skill", `${ability.name} is always active once unlocked.`);
    return false;
  }

  if (ability.classId && classId !== ability.classId) {
    showToast(player, "Wrong Class", `${ability.name} does not belong to your class.`);
    return false;
  }

  if (ability.subclassId && subclassId !== ability.subclassId) {
    showToast(player, "Wrong Subclass", `${ability.name} does not belong to your subclass.`);
    return false;
  }

  if (ability.skill && !isSkillUnlocked(player, ability.skill)) {
    showToast(player, "Skill Locked", `${ability.name} must be unlocked in the XP tree.`);
    return false;
  }

  if (!isAbilityEnabled(player, ability)) {
    showToast(player, "Ability Disabled", "Turn this slot on in the RPG Book.");
    return false;
  }

  if (ability.morphState && getScore(player, "morph_state") === ability.morphState) {
    return true;
  }

  if (ability.noCooldown) {
    return true;
  }

  if (ability.itemId === ABILITIES.switchThrow.itemId) {
    if (hasActiveSwitchThrowForOwner(player)) {
      showToast(player, "Switch Throw", "Weapon is still returning.");
      return false;
    }
    const cooldown = getScore(player, ability.cooldownObjective);
    if (cooldown > 0) {
      showToast(player, "Cooldown", `${ability.name}: ${cooldown}s`);
      return false;
    }
    setScore(player, ability.cooldownObjective, ability.cooldown || 4);
    return true;
  }

  const cdObjective = ability.cooldownObjective || `cd_ability_${ability.slot}`;
  const cooldown = getScore(player, cdObjective);
  if (cooldown > 0) {
    showToast(player, "Cooldown", `${ability.name}: ${cooldown}s`);
    return false;
  }

  if (ability.classId === CLASS.VAMPIRE && ability.itemId !== ABILITIES.vampireBite.itemId &&
    !spendVampirePlasma(player, 5)) {
    return false;
  }

  const nextCooldown = ability.cooldown !== undefined
    ? ability.cooldown
    : ability.subclassId
      ? getSubclassCooldown(subclassId)
      : getClassCooldown(classId);
  setScore(player, cdObjective, nextCooldown);
  if (!ability.subclassId) {
    setScore(player, "cd_class", nextCooldown);
  }
  return true;
}

function grantBaselineClassItems(player, classId, isInitialGrant) {
  for (const ability of ABILITY_LIST) {
    if (ability.classId === classId && ability.baseline) {
      if (ability.skill) {
        setScore(player, ability.skill, 1);
        const node = getSkillNodeByKey(ability.skill);
        if (node && node.key === "skill_public_adrenaline") {
          setAdrenalineToggle(player, true);
        } else if (node && node.key === "skill_spell_mastery") {
          setSpellMasteryToggle(player, true);
        } else if (node && node.key === "skill_staff_mastery") {
          setStaffMasteryToggle(player, true);
        } else if (node && node.toggle) {
          setScore(player, node.toggle, 1);
        }
      }
      setScore(player, `ability_toggle_${ability.slot}`, 1);
      giveAbilityItem(player, ability);
    }
  }
}

function handleAbilityUse(player, ability) {
  if (!canUseAbility(player, ability)) {
    return;
  }

  spawnFx(player, 1.1);
  switch (ability.itemId) {
    case ABILITIES.vampireBite.itemId:
      showToast(player, "Vampire Fangs", "Strike any mob or non-Werewolf player to feed.");
      break;
    case ABILITIES.batMorph.itemId:
      useBatMorph(player);
      break;
    case ABILITIES.summonVampireTroops.itemId:
      summonVampireTroopPlaceholders(player);
      break;
    case ABILITIES.compel.itemId:
      useCompel(player);
      break;
    case ABILITIES.wolfBite.itemId:
      showToast(player, "Werewolf Fangs", "Hit a target to poison it. Vampires suffer longer.");
      break;
    case ABILITIES.werewolfRoar.itemId:
      useWerewolfRoar(player);
      break;
    case ABILITIES.shadowWolfMorph.itemId:
      useShadowWolfMorph(player);
      break;
    case ABILITIES.bansheeInvisibility.itemId:
      toggleBansheeInvisibility(player);
      break;
    case ABILITIES.sonicScream.itemId:
      useBansheeSonicScream(player);
      break;
    case ABILITIES.bansheePhase.itemId:
      toggleBansheePhase(player);
      break;
    case ABILITIES.bansheeMorph.itemId:
      useBansheeMorph(player);
      break;
    case ABILITIES.switchThrow.itemId:
      spawnForwardFxTrail(player, 5, 1.1);
      launchSwitchThrow(player);
      break;
    case ABILITIES.tenacityCharge.itemId:
      performTenacityCharge(player);
      break;
    case ABILITIES.daggerThrow.itemId:
      launchDaggerThrow(player);
      break;
    case ABILITIES.strikethrough.itemId:
      dashThroughTargets(player, 5, 7, "Strikethrough", (target) => {
        try {
          runCommandCompat(target, "effect @s weakness 4 0 true").catch(() => {});
        } catch {
          runPlayerCommand(player, "execute at @s run effect @e[r=4,c=1,type=!minecraft:player] weakness 4 0 true");
        }
      });
      showToast(player, "Strikethrough", "Dashed through the target.");
      break;
    case ABILITIES.smokeBomb.itemId:
      runPlayerCommand(player, "execute at @s run particle minecraft:basic_smoke_particle ~ ~0.2 ~");
      spawnFxBurst(player, 2.2, 12);
      runPlayerCommand(player, `effect @s invisibility ${getPotionDuration(player, 5)} 0 true`);
      runPlayerCommand(player, `effect @s speed ${getPotionDuration(player, 5)} 1 true`);
      runPlayerCommand(player, `execute at @s run effect @e[r=6,type=!minecraft:player] blindness ${getPotionDuration(player, 4)} 0 true`);
      showToast(player, "Smoke Bomb", "Smoke screen deployed.");
      break;
    case ABILITIES.necromancy.itemId:
      spawnFxBurst(player, 2.6, 12);
      summonNecromancyMinions(player);
      break;
    case ABILITIES.shieldSlam.itemId:
      doShieldSlam(player);
      break;
    case ABILITIES.fortify.itemId:
      runPlayerCommand(player, `effect @s resistance ${getPotionDuration(player, 12)} 1 true`);
      runPlayerCommand(player, `effect @s absorption ${getPotionDuration(player, 12)} 2 true`);
      showToast(player, "Fortify", "Resistance and absorption active.");
      break;
    case ABILITIES.taunt.itemId:
      applyTaunt(player);
      break;
    default:
      break;
  }
}

function doShieldSlam(player) {
  const waves = [
    { delay: 0, radius: 3.2, damage: 4, knockback: 2.0 },
    { delay: 4, radius: 4.8, damage: 4, knockback: 2.6 },
    { delay: 8, radius: 6.4, damage: 5, knockback: 3.2 }
  ];
  for (const wave of waves) {
    system.runTimeout(() => {
      spawnFx(player, 0.3);
      spawnTankWindChargeFx(player, wave.radius, waves.indexOf(wave) + 1);
      const targets = getNearbyDamageTargets(player.dimension, player.location, wave.radius, {});
      for (const target of targets) {
        const indicatorContext = captureDamageIndicatorContext(target);
        applyTrueDamage(target, wave.damage);
        emitVanillaHurtIndicator(target, indicatorContext, player, "minecraft:critical_hit_emitter");
        applyArcherKnockback(target, player.location, wave.knockback, 0.42);
        try {
          runCommandCompat(target, "effect @s slowness 2 2 true").catch(() => {});
          runCommandCompat(target, "effect @s weakness 3 1 true").catch(() => {});
        } catch {
          // Stagger effects are best-effort.
        }
      }
    }, wave.delay);
  }
  showToast(player, "Shield Slam", "Shockwave released.");
}

function getWeaponCooldownObjective(itemId) {
  return WEAPON_COOLDOWN_OBJECTIVES[itemId] || "cd_weapon_witch_staff";
}

function getEntityKey(entity) {
  if (!entity) {
    return "";
  }
  try {
    return entity.id || entity.name || "";
  } catch {
    return "";
  }
}

function getPlayerByKey(key) {
  for (const player of getOnlinePlayers()) {
    if (getEntityKey(player) === key || player.name === key) {
      return player;
    }
  }
  return undefined;
}

function isEntityAlive(entity) {
  if (!entity) {
    return false;
  }
  try {
    if (typeof entity.isValid === "boolean") {
      return entity.isValid;
    }
    return true;
  } catch {
    return false;
  }
}

function isCustomProjectileEntity(entity) {
  return !!entity && CUSTOM_PROJECTILE_ENTITY_IDS.has(String(entity.typeId || ""));
}

function distanceSquared(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

function normalizeVector(vector) {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
  if (length <= 0) {
    return { x: 0, y: 0, z: 0 };
  }
  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length
  };
}

function getNearbyDamageTargets(dimension, location, maxDistance, excludedIds) {
  const exclusions = excludedIds || {};
  try {
    return dimension.getEntities({ location, maxDistance }).filter((entity) => {
      if (!entity || exclusions[getEntityKey(entity)] || entity.typeId === "minecraft:player") {
        return false;
      }
      if (isCustomProjectileEntity(entity) || entity.hasTag("mwr_necromancy_minion")) {
        return false;
      }
      return entity.typeId.indexOf("item") === -1 &&
        entity.typeId.indexOf("xp_orb") === -1 &&
        entity.typeId.indexOf("arrow") === -1;
    });
  } catch {
    return [];
  }
}

function getNearbyProjectileTargets(dimension, location, maxDistance, excludedIds) {
  const exclusions = excludedIds || {};
  try {
    return dimension.getEntities({ location, maxDistance }).filter((entity) => {
      if (!entity || exclusions[getEntityKey(entity)]) {
        return false;
      }
      if (isCustomProjectileEntity(entity) || entity.hasTag("mwr_necromancy_minion")) {
        return false;
      }
      return entity.typeId.indexOf("item") === -1 &&
        entity.typeId.indexOf("xp_orb") === -1 &&
        entity.typeId.indexOf("arrow") === -1 &&
        entity.typeId.indexOf("projectile") === -1;
    });
  } catch {
    return [];
  }
}

function getNearbyWarriorAbilityTargets(dimension, location, maxDistance, excludedIds) {
  const exclusions = excludedIds || {};
  try {
    return dimension.getEntities({ location, maxDistance }).filter((entity) => {
      if (!entity || exclusions[getEntityKey(entity)]) {
        return false;
      }
      if (isCustomProjectileEntity(entity) ||
        (entity.hasTag && entity.hasTag("mwr_necromancy_minion"))) {
        return false;
      }
      return entity.typeId.indexOf("item") === -1 &&
        entity.typeId.indexOf("xp_orb") === -1 &&
        entity.typeId.indexOf("arrow") === -1 &&
        entity.typeId.indexOf("projectile") === -1;
    });
  } catch {
    return [];
  }
}

function getFirstWarriorTargetAlongPath(dimension, start, end, radius, excludedIds) {
  const delta = {
    x: end.x - start.x,
    y: end.y - start.y,
    z: end.z - start.z
  };
  const distance = Math.sqrt(delta.x * delta.x + delta.y * delta.y + delta.z * delta.z);
  const steps = Math.max(1, Math.ceil(distance / SWITCH_THROW_PATH_STEP));
  for (let index = 1; index <= steps; index += 1) {
    const scale = index / steps;
    const probe = {
      x: start.x + delta.x * scale,
      y: start.y + delta.y * scale,
      z: start.z + delta.z * scale
    };
    const targets = getNearbyWarriorAbilityTargets(dimension, probe, radius, excludedIds);
    if (targets.length > 0) {
      return targets[0];
    }
  }
  return undefined;
}

function getEntityDisplayName(entity) {
  if (!entity) {
    return "Unknown";
  }
  try {
    if (entity.typeId === "minecraft:player" && entity.name) {
      return entity.name;
    }
    if (entity.nameTag) {
      return entity.nameTag;
    }
    return String(entity.typeId || "target").replace("minecraft:", "").replace(/_/g, " ");
  } catch {
    return "target";
  }
}

function getDistanceSquared(a, b) {
  if (!a || !b) {
    return 999999;
  }
  const dx = (a.x || 0) - (b.x || 0);
  const dy = (a.y || 0) - (b.y || 0);
  const dz = (a.z || 0) - (b.z || 0);
  return dx * dx + dy * dy + dz * dz;
}

function sendWorldMessage(message) {
  try {
    world.sendMessage(message);
    return;
  } catch {
    // Fall back to per-player messages below.
  }

  for (const player of getOnlinePlayers()) {
    try {
      player.sendMessage(message);
    } catch {
      // Player left before the message could be sent.
    }
  }
}

function isCompelProtectedTarget(entity, player) {
  if (!entity || getEntityKey(entity) === getEntityKey(player)) {
    return true;
  }

  try {
    const blockedTags = [
      "mwr_protected",
      "minecraft_world_rpg_protected",
      `${NAMESPACE}:protected`,
      "protected"
    ];
    for (const tag of blockedTags) {
      if (entity.hasTag && entity.hasTag(tag)) {
        return true;
      }
    }
  } catch {
    return true;
  }

  const typeId = String(entity.typeId || "");
  return isCustomProjectileEntity(entity) ||
    typeId.indexOf("item") !== -1 ||
    typeId.indexOf("xp_orb") !== -1 ||
    typeId.indexOf("arrow") !== -1 ||
    typeId.indexOf("projectile") !== -1 ||
    (entity.hasTag && entity.hasTag("mwr_necromancy_minion"));
}

function getCompelTarget(player) {
  try {
    if (typeof player.getEntitiesFromViewDirection === "function") {
      const hits = player.getEntitiesFromViewDirection({ maxDistance: 32 });
      for (const hit of hits) {
        const entity = hit.entity || hit;
        if (!isCompelProtectedTarget(entity, player)) {
          return entity;
        }
      }
    }
  } catch {
    // Fall back to manual crosshair scoring below.
  }

  try {
    const view = normalizeVector(player.getViewDirection());
    const origin = {
      x: player.location.x,
      y: player.location.y + 1.5,
      z: player.location.z
    };
    const candidates = player.dimension.getEntities({ location: player.location, maxDistance: 32 });
    let best = undefined;
    let bestScore = -9999;

    for (const entity of candidates) {
      if (isCompelProtectedTarget(entity, player)) {
        continue;
      }

      const center = {
        x: entity.location.x,
        y: entity.location.y + 0.8,
        z: entity.location.z
      };
      const delta = {
        x: center.x - origin.x,
        y: center.y - origin.y,
        z: center.z - origin.z
      };
      const distance = Math.sqrt(distanceSquared(center, origin));
      if (distance <= 0.01) {
        continue;
      }

      const direction = normalizeVector(delta);
      const dot = direction.x * view.x + direction.y * view.y + direction.z * view.z;
      const projected = dot * distance;
      const lateralSq = Math.max(0, distance * distance - projected * projected);
      if (dot < 0.92 || projected <= 0 || lateralSq > 4) {
        continue;
      }

      const score = dot * 100 - distance;
      if (score > bestScore) {
        bestScore = score;
        best = entity;
      }
    }

    return best;
  } catch {
    return undefined;
  }
}

function getRoarSafeKey(value) {
  return String(value || "roar").replace(/[^A-Za-z0-9_]/g, "_").slice(0, 80);
}

function getRoarOwnerKey(player) {
  return getRoarSafeKey(getEntityKey(player) || player.name || "werewolf");
}

function getRoarTargetTag(ownerKey) {
  return `mwr_roar_target_${ownerKey}_${getTickNow()}_${Math.floor(Math.random() * 10000)}`;
}

function isRoarIgnoredEntity(entity, owner) {
  if (!entity || entity === owner) {
    return true;
  }
  if (isPlayerInAnyMorph(entity)) {
    return true;
  }
  if (entity.hasTag && (entity.hasTag(ROAR_WOLF_TAG) || entity.hasTag("mwr_necromancy_minion"))) {
    return true;
  }
  const typeId = String(entity.typeId || "");
  return typeId === SWITCH_THROW_PROJECTILE_ID ||
    typeId === DAGGER_THROW_PROJECTILE_ID ||
    typeId.indexOf("item") !== -1 ||
    typeId.indexOf("xp_orb") !== -1 ||
    typeId.indexOf("arrow") !== -1 ||
    typeId.indexOf("projectile") !== -1;
}

function getRoarEntriesForOwner(ownerKey) {
  return Array.from(ACTIVE_ROAR_WOLVES.entries()).filter(([, entry]) => entry.ownerKey === ownerKey);
}

function cleanupRoarTargetTag(entry) {
  if (!entry || !entry.targetTag) {
    return;
  }
  const tagStillUsed = Array.from(ACTIVE_ROAR_WOLVES.values()).some((other) => other.targetTag === entry.targetTag);
  if (tagStillUsed) {
    return;
  }

  try {
    if (entry.target && entry.target.removeTag) {
      entry.target.removeTag(entry.targetTag);
    }
  } catch {
    // Target cleanup is best-effort after despawn/death.
  }
}

function removeRoarWolfEntry(key, entry, removeWolf) {
  ACTIVE_ROAR_WOLVES.delete(key);
  cleanupRoarTargetTag(entry);
  if (removeWolf && entry && entry.wolf) {
    removeEntity(entry.wolf);
  }
}

function isRoarSpawnLocationClear(dimension, location, usedLocations) {
  for (const used of usedLocations) {
    if (getDistanceSquared(used, location) < WEREWOLF_ROAR_SPAWN_CLEARANCE_SQ) {
      return false;
    }
  }

  try {
    const feet = dimension.getBlock({
      x: Math.floor(location.x),
      y: Math.floor(location.y),
      z: Math.floor(location.z)
    });
    const head = dimension.getBlock({
      x: Math.floor(location.x),
      y: Math.floor(location.y + 1),
      z: Math.floor(location.z)
    });
    const ground = dimension.getBlock({
      x: Math.floor(location.x),
      y: Math.floor(location.y - 1),
      z: Math.floor(location.z)
    });
    if (!feet || !head || !ground || !isAirLike(feet.typeId) || !isAirLike(head.typeId) || isAirLike(ground.typeId)) {
      return false;
    }
  } catch {
    return false;
  }

  try {
    const blockers = dimension.getEntities({ location, maxDistance: 0.9 }).filter((entity) => !isRoarIgnoredEntity(entity));
    return blockers.length === 0;
  } catch {
    return true;
  }
}

function getRoarSpawnCandidates(player, target) {
  const bases = [];
  if (target && isPlayerValid(target)) {
    bases.push(target.location);
  }
  bases.push(player.location);

  const offsets = [
    { x: 2.0, z: 0 },
    { x: -2.0, z: 0 },
    { x: 0, z: 2.0 },
    { x: 0, z: -2.0 },
    { x: 1.6, z: 1.6 },
    { x: -1.6, z: 1.6 },
    { x: 1.6, z: -1.6 },
    { x: -1.6, z: -1.6 },
    { x: 2.8, z: 0 },
    { x: -2.8, z: 0 },
    { x: 0, z: 2.8 },
    { x: 0, z: -2.8 },
    { x: 2.8, z: 2.8 },
    { x: -2.8, z: 2.8 },
    { x: 2.8, z: -2.8 },
    { x: -2.8, z: -2.8 },
    { x: 3.6, z: 0 },
    { x: -3.6, z: 0 },
    { x: 0, z: 3.6 },
    { x: 0, z: -3.6 }
  ];

  const candidates = [];
  for (const base of bases) {
    for (const offset of offsets) {
      candidates.push({ x: base.x + offset.x, y: base.y, z: base.z + offset.z });
    }
  }
  return candidates;
}

function isRoarOwnerTarget(entryOrOwner, target) {
  if (!entryOrOwner || !target) {
    return false;
  }
  const ownerKey = entryOrOwner.ownerPlayerKey || getEntityKey(entryOrOwner) || entryOrOwner.name;
  const ownerName = entryOrOwner.ownerName || entryOrOwner.name;
  return (ownerKey && getEntityKey(target) === ownerKey) ||
    (ownerName && target.name === ownerName) ||
    target === entryOrOwner;
}

function tameRoarWolfToOwner(wolf, owner) {
  if (!wolf || !owner) {
    return false;
  }
  if (wolf.hasTag && wolf.hasTag("mwr_roar_tamed")) {
    return true;
  }
  const markTamed = () => {
    try {
      if (wolf.addTag) {
        wolf.addTag("mwr_roar_tamed");
      }
    } catch {
      // Tagging is only used to avoid repeated tame attempts.
    }
  };
  try {
    const tameable = wolf.getComponent("minecraft:tameable") || wolf.getComponent("tameable");
    if (tameable && typeof tameable.tame === "function") {
      tameable.tame(owner);
      markTamed();
      return true;
    }
  } catch {
    // Fall through to vanilla event attempts below.
  }
  try {
    if (typeof wolf.triggerEvent === "function") {
      wolf.triggerEvent("minecraft:on_tame");
      markTamed();
      return true;
    }
  } catch {
    // Fall through to command event below.
  }
  try {
    runCommandCompat(wolf, "event entity @s minecraft:on_tame").catch(() => {});
    markTamed();
    return true;
  } catch {
    return false;
  }
}

function primeRoarWolf(wolf, owner) {
  try {
    wolf.nameTag = "Roar Wolf";
  } catch {
    // Some entity name surfaces can be locked.
  }
  tameRoarWolfToOwner(wolf, owner);
  try {
    if (typeof wolf.triggerEvent === "function") {
      wolf.triggerEvent("minecraft:become_angry");
    }
  } catch {
    // Fall back below.
  }
  try {
    runCommandCompat(wolf, "event entity @s minecraft:become_angry").catch(() => {});
  } catch {
    // Vanilla wolf anger events vary between engine versions.
  }
}

function setRoarWolfAiTarget(wolf, target, ownerOrEntry) {
  if (!wolf || !target || !isPlayerValid(wolf) || !isPlayerValid(target) || isRoarOwnerTarget(ownerOrEntry, target)) {
    return false;
  }
  try {
    wolf.target = target;
    return true;
  } catch {
    // The target property is pre-release on some engine versions.
  }
  try {
    if (typeof wolf.triggerEvent === "function") {
      wolf.triggerEvent("minecraft:become_angry");
    }
  } catch {
    // Vanilla target assignment is best-effort across engine versions.
  }
  return false;
}

function registerRoarWolf(player, wolf, target, targetTag, ownerKey, expiresAt, spawnedIndex) {
  let wolfKey = getEntityKey(wolf) || `${ownerKey}_${getTickNow()}_${spawnedIndex}`;
  while (ACTIVE_ROAR_WOLVES.has(wolfKey)) {
    wolfKey = `${ownerKey}_${getTickNow()}_${spawnedIndex}_${Math.floor(Math.random() * 100000)}`;
  }
  wolf.addTag(ROAR_WOLF_TAG);
  wolf.addTag("mwr_roar_spawn_protected");
  wolf.addTag(`mwr_owner_${ownerKey}`);
  ACTIVE_ROAR_WOLVES.set(wolfKey, {
    wolf,
    wolfKey,
    target,
    targetKey: getEntityKey(target),
    targetTag,
    targetMode: target ? "look" : "idle",
    ownerKey,
    ownerPlayerKey: getEntityKey(player) || player.name,
    ownerName: player.name,
    spawnTick: getTickNow(),
    expiresAt,
    lastTargetTick: 0,
    lastMeleeTick: 0
  });
  healEntityToFull(wolf);
  try {
    wolf.addEffect("resistance", WEREWOLF_ROAR_SPAWN_PROTECTION_TICKS, { amplifier: 255, showParticles: false });
  } catch {
    runPlayerCommand(wolf, "effect @s resistance 1 255 true");
  }
  primeRoarWolf(wolf, player);
  setRoarWolfAiTarget(wolf, target, player);
  system.runTimeout(() => {
    try {
      if (isPlayerValid(wolf) && wolf.hasTag && wolf.hasTag("mwr_roar_spawn_protected")) {
        wolf.removeTag("mwr_roar_spawn_protected");
      }
    } catch {
      // Wolf may have despawned or died.
    }
  }, WEREWOLF_ROAR_SPAWN_PROTECTION_TICKS);
}

function spawnRoarWolfAt(player, location, target, targetTag, ownerKey, expiresAt, spawnedIndex, usedLocations) {
  let wolf;
  try {
    wolf = player.dimension.spawnEntity(ROAR_WOLF_ENTITY_ID, location);
  } catch {
    try {
      wolf = player.dimension.spawnEntity("minecraft:wolf", location);
    } catch {
      return undefined;
    }
  }
  usedLocations.push(location);
  registerRoarWolf(player, wolf, target, targetTag, ownerKey, expiresAt, spawnedIndex);
  return wolf;
}

function spawnRoarWolfGroup(player, target, ownerKey, targetTag) {
  const expiresAt = getTickNow() + WEREWOLF_ROAR_WOLF_LIFETIME_TICKS;
  const usedLocations = [];
  const spawned = [];
  const yOffsets = [0, 1, -1, 2, -2];

  for (const candidate of getRoarSpawnCandidates(player, target)) {
    for (const yOffset of yOffsets) {
      const location = {
        x: candidate.x,
        y: candidate.y + yOffset,
        z: candidate.z
      };
      if (!isRoarSpawnLocationClear(player.dimension, location, usedLocations)) {
        continue;
      }
      const wolf = spawnRoarWolfAt(player, location, target, targetTag, ownerKey, expiresAt, spawned.length, usedLocations);
      if (wolf) {
        spawned.push(wolf);
      }
      if (spawned.length >= WEREWOLF_ROAR_WOLF_COUNT) {
        return spawned;
      }
    }
  }

  for (const wolf of spawned) {
    const entry = getActiveRoarWolfEntry(wolf);
    const key = entry ? entry.wolfKey : getEntityKey(wolf);
    if (key && ACTIVE_ROAR_WOLVES.has(key)) {
      removeRoarWolfEntry(key, ACTIVE_ROAR_WOLVES.get(key), true);
    } else {
      removeEntity(wolf);
    }
  }
  return [];
}

function assignRoarGroupTarget(ownerKey, target, targetMode) {
  const entries = getRoarEntriesForOwner(ownerKey);
  if (entries.length === 0 || isRoarIgnoredEntity(target)) {
    return 0;
  }
  if (entries.some(([, entry]) => isRoarOwnerTarget(entry, target))) {
    return 0;
  }

  const oldEntries = entries.map(([, entry]) => ({
    target: entry.target,
    targetTag: entry.targetTag
  }));
  const targetTag = getRoarTargetTag(ownerKey);
  try {
    target.addTag(targetTag);
  } catch {
    // Direct entity references still drive the wolves if tag assignment is unavailable.
  }

  for (const [, entry] of entries) {
    entry.target = target;
    entry.targetKey = getEntityKey(target);
    entry.targetTag = targetTag;
    entry.targetMode = targetMode;
    entry.lastTargetTick = 0;
    setRoarWolfAiTarget(entry.wolf, target, entry);
  }

  for (const oldEntry of oldEntries) {
    cleanupRoarTargetTag(oldEntry);
  }
  return entries.length;
}

function driveRoarWolfAttack(entry, now, owner) {
  const wolf = entry.wolf;
  const target = entry.target;
  if (!wolf || !target || !isPlayerValid(wolf) || !isPlayerValid(target)) {
    return;
  }
  if (isRoarOwnerTarget(entry, target)) {
    entry.target = undefined;
    entry.targetTag = "";
    entry.targetMode = "idle";
    return;
  }

  if (now - (entry.lastTargetTick || 0) < WEREWOLF_ROAR_RETARGET_INTERVAL_TICKS) {
    return;
  }
  entry.lastTargetTick = now;

  primeRoarWolf(wolf, owner);
  setRoarWolfAiTarget(wolf, target, entry);

  if (now - (entry.lastMeleeTick || 0) < WEREWOLF_ROAR_MELEE_INTERVAL_TICKS) {
    return;
  }
  try {
    if (distanceSquared(wolf.location, target.location) <= WEREWOLF_ROAR_MELEE_RANGE_SQ) {
      entry.lastMeleeTick = now;
      applyEntityAttackDamage(wolf, target, WEREWOLF_ROAR_MELEE_DAMAGE);
    }
  } catch {
    // Natural wolf melee remains the primary path if close-range damage assist cannot run.
  }
}

function useWerewolfRoar(player) {
  const ownerKey = getRoarOwnerKey(player);
  const target = getCompelTarget(player);
  const targetTag = target && !isRoarIgnoredEntity(target, player) ? getRoarTargetTag(ownerKey) : "";
  if (targetTag) {
    try {
      target.addTag(targetTag);
    } catch {
      // Direct entity references still drive the wolves if tag assignment is unavailable.
    }
  }

  const spawned = spawnRoarWolfGroup(player, targetTag ? target : undefined, ownerKey, targetTag);
  if (spawned.length !== WEREWOLF_ROAR_WOLF_COUNT) {
    if (targetTag && target && target.removeTag) {
      try {
        target.removeTag(targetTag);
      } catch {
        // Target may have despawned during spawn attempts.
      }
    }
    showToast(player, "Roar", "No safe space for the pack.");
    return;
  }

  showToast(player, "Roar", targetTag ? `Wolves attack ${getEntityDisplayName(target)}.` : "Wolves wait for your next target.");
  spawnFxBurst(player, 2.4, 12);
}

function retargetRoarWolvesFromOwnerHit(player, target) {
  if (!player || player.typeId !== "minecraft:player" || isRoarIgnoredEntity(target, player)) {
    return;
  }
  const ownerKey = getRoarOwnerKey(player);
  const count = assignRoarGroupTarget(ownerKey, target, "owner_hit");
  if (count > 0) {
    showToast(player, "Roar", `Wolves target ${getEntityDisplayName(target)}.`);
  }
}

function retargetRoarWolvesFromOwnerHurt(player, attacker) {
  if (!player || player.typeId !== "minecraft:player" || isRoarIgnoredEntity(attacker, player)) {
    return;
  }
  const ownerKey = getRoarOwnerKey(player);
  const count = assignRoarGroupTarget(ownerKey, attacker, "owner_hurt");
  if (count > 0) {
    showToast(player, "Roar", `Wolves defend against ${getEntityDisplayName(attacker)}.`);
  }
}

function getActiveRoarWolfEntry(entity) {
  const key = getEntityKey(entity);
  if (key && ACTIVE_ROAR_WOLVES.has(key)) {
    return ACTIVE_ROAR_WOLVES.get(key);
  }
  for (const entry of ACTIVE_ROAR_WOLVES.values()) {
    if (entry.wolf === entity || getEntityKey(entry.wolf) === key) {
      return entry;
    }
  }
  return undefined;
}

function processRoarWolves() {
  const now = getTickNow();
  for (const [key, entry] of Array.from(ACTIVE_ROAR_WOLVES.entries())) {
    const wolf = entry.wolf;
    const owner = getPlayerByKey(entry.ownerPlayerKey) || Array.from(getOnlinePlayers()).find((player) => player.name === entry.ownerName);

    if (!wolf || !isPlayerValid(wolf)) {
      removeRoarWolfEntry(key, entry, false);
      continue;
    }

    if (now >= entry.expiresAt) {
      removeRoarWolfEntry(key, entry, true);
      continue;
    }

    if (!isPlayerValid(owner)) {
      continue;
    }

    if (!entry.target || !isPlayerValid(entry.target)) {
      const oldEntry = {
        target: entry.target,
        targetTag: entry.targetTag
      };
      entry.target = undefined;
      entry.targetTag = "";
      entry.targetMode = "idle";
      cleanupRoarTargetTag(oldEntry);
      continue;
    }

    driveRoarWolfAttack(entry, now, owner);
  }
}

function markCompelKill(target, player) {
  const targetKey = getEntityKey(target);
  if (!targetKey || !isPlayerValid(player)) {
    return;
  }
  const mark = {
    owner: player,
    ownerKey: getEntityKey(player),
    expiresAt: getTickNow() + COMPEL_KILL_MARK_TICKS
  };
  COMPEL_KILL_MARKS.set(targetKey, mark);
  system.runTimeout(() => {
    if (COMPEL_KILL_MARKS.get(targetKey) === mark) {
      COMPEL_KILL_MARKS.delete(targetKey);
    }
  }, COMPEL_KILL_MARK_TICKS);
}

function consumeCompelKillOwner(target) {
  const targetKey = getEntityKey(target);
  if (!targetKey) {
    return undefined;
  }
  const mark = COMPEL_KILL_MARKS.get(targetKey);
  COMPEL_KILL_MARKS.delete(targetKey);
  if (!mark || getTickNow() > mark.expiresAt) {
    return undefined;
  }
  const owner = isPlayerValid(mark.owner) ? mark.owner : getPlayerByKey(mark.ownerKey);
  return owner && getScore(owner, "class_primary") === CLASS.VAMPIRE ? owner : undefined;
}

function compelKillTarget(player, target) {
  markCompelKill(target, player);
  if (target && target.typeId === "minecraft:player") {
    applyTrueDamage(target, 10000);
    return;
  }

  try {
    if (typeof target.applyDamage === "function") {
      target.applyDamage(10000, { cause: "magic", damagingEntity: player });
      return;
    }
  } catch {
    // Fall back to command damage below.
  }

  try {
    const result = runCommandCompat(target, "damage @s 10000 magic");
    if (result && typeof result.catch === "function") {
      result.catch(() => {});
    }
    return;
  } catch {
    // Fall back to kill below.
  }

  try {
    if (typeof target.kill === "function") {
      target.kill();
      return;
    }
  } catch {
    // Some entities cannot be killed by script.
  }
}

function useCompel(player) {
  const target = getCompelTarget(player);
  if (!target) {
    showToast(player, "Compel", "Aim at a mob or player first.");
    return;
  }

  if (!spendVampirePlasma(player, ABILITIES.compel.plasmaCost || 50)) {
    return;
  }

  const victimName = getEntityDisplayName(target);
  spawnFx(player, 1.3);
  try {
    runCommandCompat(target, `particle ${getFxParticle(player)} ~ ~1 ~`).catch(() => {});
  } catch {
    // Particle support varies for entity command contexts.
  }
  compelKillTarget(player, target);
  sendWorldMessage(`${victimName} was compelled to be slain by ${player.name}`);
}

function applyEntityImpulse(entity, impulse) {
  try {
    if (typeof entity.applyImpulse === "function") {
      entity.applyImpulse(impulse);
      return true;
    }
  } catch {
    // Fall back below.
  }
  return false;
}

function healEntity(entity, amount) {
  try {
    const health = entity.getComponent("minecraft:health");
    if (health && typeof health.currentValue === "number" && typeof health.effectiveMax === "number" && typeof health.setCurrentValue === "function") {
      health.setCurrentValue(Math.min(health.effectiveMax, health.currentValue + amount));
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

function healPlayerByAmount(player, amount) {
  const healAmount = Math.max(1, Math.ceil(Number(amount) || 0));
  if (!isPlayerValid(player) || healAmount <= 0) {
    return false;
  }
  if (healEntity(player, healAmount)) {
    return true;
  }
  runPlayerCommand(player, `effect @s instant_health 1 ${Math.max(0, Math.ceil(healAmount / 4) - 1)} true`);
  return true;
}

function healEntityToFull(entity) {
  try {
    const health = entity.getComponent("minecraft:health");
    if (health && typeof health.setCurrentValue === "function") {
      const maxHealth = typeof health.effectiveMax === "number"
        ? health.effectiveMax
        : typeof health.defaultValue === "number"
          ? health.defaultValue
          : 20;
      health.setCurrentValue(maxHealth);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

function fillHealthAfterMaxHealthChange(player) {
  system.runTimeout(() => {
    if (isPlayerValid(player)) {
      healEntityToFull(player);
    }
  }, 1);
}

function getCurrentHealth(entity) {
  try {
    const health = entity.getComponent("minecraft:health");
    if (health && typeof health.currentValue === "number") {
      return health.currentValue;
    }
  } catch {
    // Use the vanilla player default below.
  }
  return 20;
}

function isSecondLifeActive(player) {
  const playerKey = getEntityKey(player) || (player && player.name) || "";
  return isPlayerValid(player) &&
    playerKey !== "" &&
    !SECOND_LIFE_CLAIMS.has(playerKey) &&
    isSkillUnlocked(player, "skill_public_second_life") &&
    getScore(player, "second_life_cd") <= 0;
}

function isSecondLifeInvulnerable(player) {
  const key = getEntityKey(player) || player.name;
  const expiresAt = SECOND_LIFE_INVULNERABILITY.get(key) || 0;
  return expiresAt > getTickNow();
}

function setSecondLifeScoreDirect(player, value) {
  const objective = getObjective("second_life_cd");
  if (!objective || !player || !player.scoreboardIdentity) {
    return false;
  }
  try {
    objective.setScore(player.scoreboardIdentity, Math.max(0, Math.floor(value)));
    return true;
  } catch {
    return false;
  }
}

function restoreSecondLifeHealth(player) {
  try {
    const health = player.getComponent("minecraft:health");
    if (!health || typeof health.setCurrentValue !== "function") {
      return false;
    }
    const maximum = typeof health.effectiveMax === "number" ? health.effectiveMax : SECOND_LIFE_RESTORE_HEALTH;
    health.setCurrentValue(Math.min(SECOND_LIFE_RESTORE_HEALTH, maximum));
    return true;
  } catch {
    return false;
  }
}

function refillSecondLifeAttribute(player, componentId) {
  try {
    const component = player.getComponent(componentId);
    if (!component) {
      return false;
    }
    if (typeof component.resetToMaxValue === "function") {
      component.resetToMaxValue();
      return true;
    }
    if (typeof component.setCurrentValue === "function" && typeof component.effectiveMax === "number") {
      component.setCurrentValue(component.effectiveMax);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

function applySecondLifeEffect(player, effectId, durationTicks, amplifier) {
  try {
    player.addEffect(effectId, durationTicks, {
      amplifier,
      showParticles: false
    });
    return true;
  } catch {
    return false;
  }
}

function getSecondLifeVoidThreshold(player) {
  try {
    const range = player.dimension.heightRange;
    if (range && Number.isFinite(range.min)) {
      return range.min - SECOND_LIFE_VOID_MARGIN;
    }
  } catch {
    // Use the Overworld floor fallback below.
  }
  return -64 - SECOND_LIFE_VOID_MARGIN;
}

function getSecondLifeRescueDestination(player) {
  try {
    if (typeof player.getSpawnPoint === "function") {
      const spawn = player.getSpawnPoint();
      if (spawn && spawn.dimension && Number.isFinite(spawn.x) && Number.isFinite(spawn.y) && Number.isFinite(spawn.z)) {
        return {
          dimension: spawn.dimension,
          location: { x: spawn.x, y: spawn.y + 1, z: spawn.z }
        };
      }
    }
  } catch {
    // Use the world spawn fallback below.
  }

  try {
    const spawn = world.getDefaultSpawnLocation();
    return {
      dimension: world.getDimension("overworld"),
      location: { x: spawn.x, y: spawn.y + 1, z: spawn.z }
    };
  } catch {
    return undefined;
  }
}

function rescueSecondLifePlayerFromVoid(player) {
  const destination = getSecondLifeRescueDestination(player);
  if (!destination) {
    return false;
  }
  try {
    player.teleport(destination.location, {
      dimension: destination.dimension,
      checkForBlocks: false,
      keepVelocity: false
    });
    return true;
  } catch {
    return false;
  }
}

function playSecondLifeTotemFx(player) {
  runPlayerCommand(player, "playsound random.totem @s ~ ~ ~ 1 1");
  for (const delay of [0, 4, 8]) {
    system.runTimeout(() => {
      if (!isPlayerValid(player)) {
        return;
      }
      spawnParticleSafe(player.dimension, "minecraft:totem_particle", {
        x: player.location.x,
        y: player.location.y + 1,
        z: player.location.z
      });
    }, delay);
  }
}

function completeSecondLifeClaim(player, playerKey, rescueFromVoid) {
  try {
    if (!isPlayerValid(player)) {
      return;
    }
    if (rescueFromVoid) {
      rescueSecondLifePlayerFromVoid(player);
    }
    setSecondLifeScoreDirect(player, SECOND_LIFE_COOLDOWN_SECONDS);
    restoreSecondLifeHealth(player);
    refillSecondLifeAttribute(player, "minecraft:player.hunger");
    refillSecondLifeAttribute(player, "minecraft:player.saturation");
    applySecondLifeEffect(player, "resistance", 20 * 10, 1);
    applySecondLifeEffect(player, "regeneration", 20 * 10, 1);
    applySecondLifeEffect(player, "fire_resistance", 20 * 15, 0);
    applySecondLifeEffect(player, "saturation", 20, 0);
    try {
      if (typeof player.extinguishFire === "function") {
        player.extinguishFire(true);
      }
    } catch {
      // Fire Resistance still protects the revived player.
    }
    SECOND_LIFE_INVULNERABILITY.set(playerKey, getTickNow() + SECOND_LIFE_INVULNERABLE_TICKS);
    if (player.addTag && (!player.hasTag || !player.hasTag("mwr_second_life_invulnerable"))) {
      player.addTag("mwr_second_life_invulnerable");
    }
    playSecondLifeTotemFx(player);
    showToast(player, "Second Life", "Second Life activated — on cooldown for 5 minutes");
  } finally {
    SECOND_LIFE_CLAIMS.delete(playerKey);
  }
}

function claimSecondLife(player, _damageCause, options) {
  if (!isSecondLifeActive(player)) {
    return false;
  }
  const playerKey = getEntityKey(player) || player.name;
  SECOND_LIFE_CLAIMS.add(playerKey);
  SECOND_LIFE_INVULNERABILITY.set(playerKey, getTickNow() + SECOND_LIFE_INVULNERABLE_TICKS);
  const rescueFromVoid = !!(options && options.rescueFromVoid);
  system.run(() => completeSecondLifeClaim(player, playerKey, rescueFromVoid));
  return true;
}

function shouldSecondLifeDenyDamage(player, incomingDamage, damageCause) {
  if (!player || player.typeId !== "minecraft:player") {
    return false;
  }
  if (isSecondLifeInvulnerable(player)) {
    return true;
  }
  const damage = Math.max(0, Number(incomingDamage) || 0);
  return damage > 0 && damage >= getCurrentHealth(player) && claimSecondLife(player, damageCause);
}

function resetClassAbilityCooldowns(player) {
  setScore(player, "cd_class", 0);
  for (let slot = 1; slot <= 5; slot += 1) {
    setScore(player, `cd_ability_${slot}`, 0);
  }
  for (const objective of INDEPENDENT_COOLDOWNS) {
    setScore(player, objective, 0);
  }
}

function clearSecondLifeRuntimeState(player, resetCooldown) {
  const playerKey = getEntityKey(player) || player.name;
  SECOND_LIFE_INVULNERABILITY.delete(playerKey);
  SECOND_LIFE_CLAIMS.delete(playerKey);
  try {
    if (player.hasTag && player.hasTag("mwr_second_life_invulnerable")) {
      player.removeTag("mwr_second_life_invulnerable");
    }
  } catch {
    // Player state may already be unloading.
  }
  if (resetCooldown) {
    setSecondLifeScoreDirect(player, 0);
  }
}

function processSecondLifeInvulnerability(player) {
  const playerKey = getEntityKey(player) || player.name;
  if (isSecondLifeInvulnerable(player)) {
    return;
  }
  SECOND_LIFE_INVULNERABILITY.delete(playerKey);
  if (player.hasTag && player.hasTag("mwr_second_life_invulnerable")) {
    player.removeTag("mwr_second_life_invulnerable");
  }
}

function processSecondLifeCooldown(player) {
  const current = getScore(player, "second_life_cd");
  if (current <= 0) {
    return;
  }
  const next = current - 1;
  setSecondLifeScoreDirect(player, next);
  if (next === 0 && isSkillUnlocked(player, "skill_public_second_life")) {
    showToast(player, "Second Life", "Ready.");
    spawnFx(player, 0.8);
  }
}

function processSecondLifeVoidRescue(player) {
  if (!isPlayerValid(player) || isSecondLifeInvulnerable(player) || !isSecondLifeActive(player)) {
    return;
  }
  try {
    if (player.location.y < getSecondLifeVoidThreshold(player)) {
      claimSecondLife(player, "void", { rescueFromVoid: true });
    }
  } catch {
    // An unloading player cannot be rescued until the next valid tick.
  }
}

function resetSecondLifeOnSpawn(player) {
  clearSecondLifeRuntimeState(player, false);
  if (!setSecondLifeScoreDirect(player, 0)) {
    system.runTimeout(() => {
      if (isPlayerValid(player)) {
        setSecondLifeScoreDirect(player, 0);
      }
    }, 20);
  }
}

function getMovementComponent(player) {
  try {
    return player.getComponent("minecraft:movement") || player.getComponent("movement");
  } catch {
    return undefined;
  }
}

function getJumpStrengthComponent(player) {
  const componentIds = [
    "minecraft:jump_strength",
    "jump_strength",
    "minecraft:jump.static",
    "minecraft:jump.dynamic"
  ];
  for (const componentId of componentIds) {
    try {
      const component = player.getComponent(componentId);
      if (component) {
        return component;
      }
    } catch {
      // Try the next known jump component shape.
    }
  }
  return undefined;
}

function setJumpComponentValue(component, value) {
  try {
    if (component && typeof component.setCurrentValue === "function") {
      component.setCurrentValue(value);
      return true;
    }
  } catch {
    // Some player components are read-only on certain engine versions.
  }

  try {
    if (component && typeof component.value === "number") {
      component.value = value;
      return true;
    }
  } catch {
    // Continue to command fallback.
  }
  return false;
}

function runJumpAttributeFallback(player, active) {
  const value = active ? PARKOURIST_JUMP_STRENGTH_TWO_BLOCK : VANILLA_JUMP_STRENGTH_FALLBACK;
  runPlayerCommand(player, `attribute @s minecraft:generic.jump_strength base set ${value}`);
  runPlayerCommand(player, `attribute @s minecraft:jump_strength base set ${value}`);
}

function applyParkouristJumpEffectFallback(player, active, state) {
  if (active) {
    runPlayerCommand(player, `effect @s jump_boost ${PARKOURIST_JUMP_BOOST_SECONDS} ${PARKOURIST_JUMP_BOOST_AMPLIFIER} true`);
    state.effectFallback = true;
    return;
  }

  if (state.effectFallback) {
    runPlayerCommand(player, "effect @s jump_boost 0 0 true");
    state.effectFallback = false;
  }
}

function applyParkouristJumpStat(player) {
  const key = getEntityKey(player) || player.name;
  const active = getScore(player, "parkourist_active") > 0;
  const state = JUMP_DEFAULTS.get(key) || {
    base: 0,
    active: undefined,
    commandFallback: false,
    effectFallback: false
  };

  const component = getJumpStrengthComponent(player);
  if (component) {
    state.base = typeof component.defaultValue === "number" && component.defaultValue > 0
      ? component.defaultValue
      : VANILLA_JUMP_STRENGTH_FALLBACK;
    const target = active ? PARKOURIST_JUMP_STRENGTH_TWO_BLOCK : state.base;
    if (setJumpComponentValue(component, target)) {
      state.active = active;
      state.commandFallback = false;
      applyParkouristJumpEffectFallback(player, false, state);
      JUMP_DEFAULTS.set(key, state);
      return;
    }
  }

  const previousActive = state.active;
  state.active = active;
  state.commandFallback = true;
  state.base = VANILLA_JUMP_STRENGTH_FALLBACK;
  if (active || previousActive !== false) {
    runJumpAttributeFallback(player, active);
  }
  applyParkouristJumpEffectFallback(player, active, state);
  JUMP_DEFAULTS.set(key, state);
}

function applyMovementMultiplier(player, multiplier) {
  const key = getEntityKey(player) || player.name;
  const component = getMovementComponent(player);
  if (!component || typeof component.setCurrentValue !== "function") {
    return false;
  }

  let base = MOVEMENT_DEFAULTS.get(key);
  if (typeof base !== "number" || base <= 0) {
    base = typeof component.defaultValue === "number" && component.defaultValue > 0
      ? component.defaultValue
      : typeof component.currentValue === "number" && component.currentValue > 0
        ? component.currentValue
        : 0.1;
    MOVEMENT_DEFAULTS.set(key, base);
  }

  const effectiveMin = typeof component.effectiveMin === "number" ? component.effectiveMin : 0;
  const effectiveMax = typeof component.effectiveMax === "number" ? component.effectiveMax : 1;
  const next = Math.max(effectiveMin, Math.min(effectiveMax, base * Math.max(1, multiplier)));
  try {
    component.setCurrentValue(next);
    return true;
  } catch {
    // Some engine builds expose the component read-only for players.
  }
  return false;
}

function maintainPassiveBuffs(player) {
  for (const buff of PASSIVE_BUFF_DEFINITIONS) {
    if (buff.type === "movement" || !buff.condition(player)) {
      continue;
    }
    if (buff.type === "effect") {
      const amplifier = typeof buff.amplifier === "function" ? buff.amplifier(player) : 0;
      applyPassiveEffect(player, buff.effect, amplifier, PASSIVE_BUFF_MAX_SECONDS);
    } else if (buff.type === "heal_out_of_combat") {
      const regenDelay = getScore(player, "hp_regen_delay");
      if (regenDelay <= 0) {
        const amount = typeof buff.amount === "function" ? buff.amount(player) : 1;
        healEntity(player, amount);
      }
    }
  }
}

function teleportEntity(entity, location) {
  try {
    entity.teleport(location, { dimension: entity.dimension });
    return true;
  } catch {
    return false;
  }
}

function removeEntity(entity) {
  if (!entity) {
    return;
  }
  try {
    if (typeof entity.remove === "function") {
      entity.remove();
      return;
    }
  } catch {
    // Fall back below.
  }
  try {
    runCommandCompat(entity, "kill @s").catch(() => {});
  } catch {
    // Entity already gone.
  }
}

function dashThroughTargets(player, distance, damage, label, onHit) {
  let view;
  try {
    view = normalizeVector(player.getViewDirection());
  } catch {
    view = { x: 0, y: 0, z: 1 };
  }

  const start = player.location;
  const hit = {};
  for (let step = 1; step <= distance; step += 1) {
    const probe = {
      x: start.x + view.x * step,
      y: start.y + 1,
      z: start.z + view.z * step
    };
    runPlayerCommand(player, `particle ${getFxParticle(player)} ${probe.x} ${probe.y} ${probe.z}`);
    for (const target of getNearbyDamageTargets(player.dimension, probe, 1.4, hit)) {
      hit[getEntityKey(target)] = true;
      const indicatorContext = captureDamageIndicatorContext(target);
      applyTrueDamage(target, damage);
      emitVanillaHurtIndicator(target, indicatorContext, player, "minecraft:critical_hit_emitter");
      if (onHit) {
        onHit(target);
      }
    }
  }

  const destination = {
    x: start.x + view.x * distance,
    y: start.y,
    z: start.z + view.z * distance
  };
  try {
    player.teleport(destination, {
      dimension: player.dimension,
      rotation: player.getRotation()
    });
  } catch {
    runPlayerCommand(player, `tp @s ^ ^ ^${distance}`);
  }
  showToast(player, label, Object.keys(hit).length > 0 ? "Damaged enemies along the dash path." : "Dashed forward.");
}

function getHorizontalViewDirection(player) {
  try {
    const view = player.getViewDirection();
    const horizontal = normalizeVector({ x: view.x, y: 0, z: view.z });
    if (Math.abs(horizontal.x) > 0.001 || Math.abs(horizontal.z) > 0.001) {
      return horizontal;
    }
  } catch {
    // Fall back below.
  }
  return { x: 0, y: 0, z: 1 };
}

function applyTenacityMovementBurst(player, view, openingBurst) {
  const horizontal = normalizeVector({ x: view.x, y: 0, z: view.z });
  const dashView = (Math.abs(horizontal.x) > 0.001 || Math.abs(horizontal.z) > 0.001)
    ? horizontal
    : { x: 0, y: 0, z: 1 };

  if (openingBurst) {
    try {
      if (typeof player.applyKnockback === "function") {
        player.applyKnockback({
          x: dashView.x * TENACITY_CHARGE_KNOCKBACK_STRENGTH,
          z: dashView.z * TENACITY_CHARGE_KNOCKBACK_STRENGTH
        }, 0.1);
      }
    } catch {
      try {
        player.applyKnockback(dashView.x, dashView.z, TENACITY_CHARGE_KNOCKBACK_STRENGTH, 0.1);
      } catch {
        // Impulses below carry the dash when knockback signatures vary.
      }
    }
  }

  applyEntityImpulse(player, {
    x: dashView.x * TENACITY_CHARGE_IMPULSE,
    y: openingBurst ? 0.04 : 0.01,
    z: dashView.z * TENACITY_CHARGE_IMPULSE
  });
}

function startTenacityChargeDash(player, view) {
  const key = getEntityKey(player) || player.name;
  ACTIVE_TENACITY_CHARGES.set(key, {
    player,
    view,
    start: player.location,
    ticksLeft: TENACITY_CHARGE_DASH_TICKS,
    nextBlastDistance: TENACITY_CHARGE_BLAST_SPACING * 0.5,
    detonated: false
  });
  applyTenacityMovementBurst(player, view, true);
}

function getTenacityBlastLocation(start, view, distance) {
  return {
    x: start.x + view.x * distance,
    y: start.y,
    z: start.z + view.z * distance
  };
}

function getTenacityHorizontalDistance(start, current) {
  if (!start || !current) {
    return 0;
  }
  const dx = (current.x || 0) - (start.x || 0);
  const dz = (current.z || 0) - (start.z || 0);
  return Math.sqrt(dx * dx + dz * dz);
}

function processTenacityChargeBlasts(state, maxDistance) {
  let hitCount = 0;
  const cappedDistance = Math.min(TENACITY_CHARGE_DISTANCE, Math.max(0, maxDistance));
  while (state.nextBlastDistance <= cappedDistance + 0.001) {
    const blastLocation = getTenacityBlastLocation(state.start, state.view, state.nextBlastDistance);
    hitCount += detonateTenacityCharge(state.player, blastLocation);
    state.nextBlastDistance += TENACITY_CHARGE_BLAST_SPACING;
  }
  return hitCount;
}

function settleTenacityMomentum(player, view) {
  const horizontal = normalizeVector({ x: view.x, y: 0, z: view.z });
  if (Math.abs(horizontal.x) <= 0.001 && Math.abs(horizontal.z) <= 0.001) {
    return;
  }
  applyEntityImpulse(player, {
    x: -horizontal.x * 0.32,
    y: 0,
    z: -horizontal.z * 0.32
  });
}

function processTenacityCharges() {
  for (const [key, state] of Array.from(ACTIVE_TENACITY_CHARGES.entries())) {
    if (!state || !isPlayerValid(state.player)) {
      ACTIVE_TENACITY_CHARGES.delete(key);
      continue;
    }
    let hitCount = 0;
    if (state.ticksLeft > 0) {
      const actualDistance = getTenacityHorizontalDistance(state.start, state.player.location);
      if (actualDistance >= TENACITY_CHARGE_DISTANCE) {
        state.ticksLeft = 0;
      } else {
        applyTenacityMovementBurst(state.player, state.view, false);
        state.ticksLeft -= 1;
      }
      const elapsedTicks = TENACITY_CHARGE_DASH_TICKS - state.ticksLeft;
      const plannedDistance = Math.max(actualDistance, (TENACITY_CHARGE_DISTANCE * elapsedTicks) / TENACITY_CHARGE_DASH_TICKS);
      hitCount += processTenacityChargeBlasts(state, plannedDistance);
    }
    if (state.ticksLeft <= 0 && !state.detonated) {
      state.detonated = true;
      hitCount += processTenacityChargeBlasts(state, TENACITY_CHARGE_DISTANCE);
      settleTenacityMomentum(state.player, state.view);
      showToast(state.player, "Tenacity Charge", hitCount > 0 ? "Chain explosions hit enemies." : "Chain explosions fired.");
      ACTIVE_TENACITY_CHARGES.delete(key);
    }
  }
}

function applyTenacityExplosionDamage(player, target) {
  if (target && target.typeId === "minecraft:player" &&
    shouldSecondLifeDenyDamage(target, TENACITY_CHARGE_DAMAGE, "scripted_tenacity_explosion")) {
    return true;
  }
  try {
    if (typeof target.applyDamage === "function") {
      target.applyDamage(TENACITY_CHARGE_DAMAGE, { cause: "entityExplosion", damagingEntity: player });
      return true;
    }
  } catch {
    // Fall back below.
  }

  try {
    if (typeof target.applyDamage === "function") {
      target.applyDamage(TENACITY_CHARGE_DAMAGE, { cause: "explosion", damagingEntity: player });
      return true;
    }
  } catch {
    // Fall back below.
  }

  try {
    const result = runCommandCompat(target, `damage @s ${TENACITY_CHARGE_DAMAGE} entity_explosion`);
    if (result && typeof result.catch === "function") {
      result.catch(() => {});
    }
    return true;
  } catch {
    // Direct health mutation is the last-resort fallback.
  }

  applyTrueDamage(target, TENACITY_CHARGE_DAMAGE);
  return true;
}

function applyTenacityExplosionReaction(player, target, impactLocation) {
  const origin = {
    x: impactLocation.x,
    y: impactLocation.y + 0.8,
    z: impactLocation.z
  };
  const direction = normalizeVector({
    x: target.location.x - origin.x,
    y: 0,
    z: target.location.z - origin.z
  });
  const push = (Math.abs(direction.x) > 0.001 || Math.abs(direction.z) > 0.001)
    ? direction
    : getHorizontalViewDirection(player);

  applyEntityImpulse(target, {
    x: push.x * 0.85,
    y: 0.28,
    z: push.z * 0.85
  });
}

function createTenacityExplosionFx(player, location) {
  try {
    if (typeof player.dimension.createExplosion === "function") {
      player.dimension.createExplosion(location, 0.25, {
        breaksBlocks: false,
        causesFire: false,
        source: player
      });
    }
  } catch {
    // Particle and sound fallback below still communicates the blast.
  }
  runPlayerCommand(player, `particle minecraft:large_explosion ${location.x} ${location.y} ${location.z}`);
  runPlayerCommand(player, `playsound random.explode @a[r=18] ${location.x} ${location.y} ${location.z} 0.8 1.4`);
}

function detonateTenacityCharge(player, impactLocation) {
  const exclusions = {};
  exclusions[getEntityKey(player)] = true;
  const hit = {};
  const blastLocation = {
    x: impactLocation.x,
    y: impactLocation.y + 1.0,
    z: impactLocation.z
  };

  createTenacityExplosionFx(player, blastLocation);
  for (const yOffset of [0.2, 1.0, 1.8]) {
    const probe = {
      x: impactLocation.x,
      y: impactLocation.y + yOffset,
      z: impactLocation.z
    };
    for (const target of getNearbyWarriorAbilityTargets(player.dimension, probe, TENACITY_CHARGE_SWEEP_RADIUS, exclusions)) {
      const key = getEntityKey(target);
      if (hit[key]) {
        continue;
      }
      hit[key] = true;
      exclusions[key] = true;
      applyTenacityExplosionDamage(player, target);
      applyTenacityExplosionReaction(player, target, impactLocation);
    }
  }
  return Object.keys(hit).length;
}

function performTenacityCharge(player) {
  const view = getHorizontalViewDirection(player);
  runPlayerCommand(player, `effect @s resistance ${TENACITY_CHARGE_RESISTANCE_SECONDS} 1 true`);
  spawnForwardFxTrail(player, TENACITY_CHARGE_DISTANCE, 0.8);
  startTenacityChargeDash(player, view);
  showToast(player, "Tenacity Charge", "Charging to impact.");
}

function applySwitchThrowHit(owner, target) {
  const damage = 8;
  const indicatorContext = captureDamageIndicatorContext(target);
  markSwitchThrowKill(owner, target, damage);
  applyTrueDamage(target, damage);
  emitVanillaHurtIndicator(target, indicatorContext, owner, "minecraft:critical_hit_emitter");
  try {
    runCommandCompat(target, "effect @s slowness 4 1 false").catch(() => {});
    runCommandCompat(target, "effect @s weakness 4 0 false").catch(() => {});
  } catch {
    // Damage is authoritative; debuffs are best-effort if the target command surface is unavailable.
  }
  spawnFx(owner, 1.0);
}

function markSwitchThrowKill(owner, target, damage) {
  const targetKey = getEntityKey(target);
  if (!owner || !target || !targetKey || !wouldDamageBeLethal(target, damage)) {
    return;
  }
  SWITCH_THROW_KILL_MARKS.set(targetKey, {
    ownerName: owner.name || getEntityDisplayName(owner),
    expiresAt: getTickNow() + SWITCH_THROW_KILL_MARK_TICKS
  });
}

function consumeSwitchThrowKillMark(entity) {
  const key = getEntityKey(entity);
  if (!key || !SWITCH_THROW_KILL_MARKS.has(key)) {
    return undefined;
  }
  const mark = SWITCH_THROW_KILL_MARKS.get(key);
  SWITCH_THROW_KILL_MARKS.delete(key);
  if (!mark || getTickNow() > mark.expiresAt) {
    return undefined;
  }
  return mark;
}

function cleanupSwitchThrowKillMarks() {
  const now = getTickNow();
  for (const [key, mark] of Array.from(SWITCH_THROW_KILL_MARKS.entries())) {
    if (!mark || now > mark.expiresAt) {
      SWITCH_THROW_KILL_MARKS.delete(key);
    }
  }
}

function performSwitchThrowFallback(player, view) {
  const start = {
    x: player.location.x,
    y: player.location.y + 1.2,
    z: player.location.z
  };
  const end = {
    x: start.x + view.x * 6,
    y: start.y + view.y * 6,
    z: start.z + view.z * 6
  };
  const exclusions = {};
  exclusions[getEntityKey(player)] = true;
  const target = getFirstWarriorTargetAlongPath(player.dimension, start, end, SWITCH_THROW_HIT_RADIUS, exclusions);
  if (target) {
    applySwitchThrowHit(player, target);
    showToast(player, "Switch Throw", "Weapon energy struck and returned.");
    return;
  }
  showToast(player, "Switch Throw", "Weapon energy returned.");
}

function launchSwitchThrow(player) {
  let view;
  try {
    view = normalizeVector(player.getViewDirection());
  } catch {
    view = { x: 0, y: 0, z: 1 };
  }

  const start = {
    x: player.location.x + view.x,
    y: player.location.y + 1.2,
    z: player.location.z + view.z
  };

  let projectile;
  try {
    projectile = player.dimension.spawnEntity(SWITCH_THROW_PROJECTILE_ID, start);
  } catch {
    projectile = undefined;
  }

  if (!projectile) {
    performSwitchThrowFallback(player, view);
    return;
  }

  const projectileKey = getEntityKey(projectile);
  projectile.addTag("mwr_switch_throw_projectile");
  projectile.addTag(`mwr_owner_${player.name.replace(/[^A-Za-z0-9_]/g, "_")}`);
  applyEntityImpulse(projectile, {
    x: view.x * 1.8,
    y: view.y * 1.8,
    z: view.z * 1.8
  });
  ACTIVE_SWITCH_THROWS.set(projectileKey, {
    entity: projectile,
    ownerKey: getEntityKey(player) || player.name,
    direction: view,
    returning: false,
    hit: false,
    ticks: 0,
    lastLocation: start
  });
  showToast(player, "Switch Throw", "Weapon projectile launched.");
}

function processSwitchThrows() {
  cleanupSwitchThrowKillMarks();
  for (const [key, state] of ACTIVE_SWITCH_THROWS) {
    const projectile = state.entity;
    const owner = getPlayerByKey(state.ownerKey);
    if (!isEntityAlive(projectile) || !isPlayerValid(owner)) {
      ACTIVE_SWITCH_THROWS.delete(key);
      removeEntity(projectile);
      continue;
    }

    state.ticks += SWITCH_THROW_UPDATE_INTERVAL_TICKS;
    let location = projectile.location;
    try {
      projectile.dimension.spawnParticle(getFxParticle(owner), location);
    } catch {
      runPlayerCommand(owner, `particle ${getFxParticle(owner)} ${location.x} ${location.y} ${location.z}`);
    }

    if (!state.returning) {
      const excluded = {};
      excluded[getEntityKey(owner)] = true;
      excluded[getEntityKey(projectile)] = true;
      const next = {
        x: location.x + state.direction.x * 0.75 * SWITCH_THROW_UPDATE_INTERVAL_TICKS,
        y: location.y + state.direction.y * 0.75 * SWITCH_THROW_UPDATE_INTERVAL_TICKS,
        z: location.z + state.direction.z * 0.75 * SWITCH_THROW_UPDATE_INTERVAL_TICKS
      };
      const target = getFirstWarriorTargetAlongPath(
        projectile.dimension,
        state.lastLocation || location,
        next,
        SWITCH_THROW_HIT_RADIUS,
        excluded
      );
      if (target) {
        applySwitchThrowHit(owner, target);
        state.hit = true;
        state.returning = true;
      } else if (state.ticks >= 18) {
        state.returning = true;
      } else {
        teleportEntity(projectile, next);
        state.lastLocation = next;
      }
    }

    if (state.returning) {
      location = projectile.location;
      const ownerTarget = {
        x: owner.location.x,
        y: owner.location.y + 1.1,
        z: owner.location.z
      };
      const towardOwner = normalizeVector({
        x: ownerTarget.x - location.x,
        y: ownerTarget.y - location.y,
        z: ownerTarget.z - location.z
      });
      teleportEntity(projectile, {
        x: location.x + towardOwner.x * 0.95 * SWITCH_THROW_UPDATE_INTERVAL_TICKS,
        y: location.y + towardOwner.y * 0.95 * SWITCH_THROW_UPDATE_INTERVAL_TICKS,
        z: location.z + towardOwner.z * 0.95 * SWITCH_THROW_UPDATE_INTERVAL_TICKS
      });

      if (distanceSquared(projectile.location, ownerTarget) <= 2.25 || state.ticks > 60) {
        removeEntity(projectile);
        ACTIVE_SWITCH_THROWS.delete(key);
        showToast(owner, "Switch Throw", state.hit ? "Weapon returned after impact." : "Weapon returned.");
      }
    }
  }
}

function applyDaggerThrowWither(target) {
  try {
    target.addEffect("wither", 60, { amplifier: 0, showParticles: true });
    return;
  } catch {
    // Fall through to the target-local command surface on older Script API builds.
  }
  try {
    runCommandCompat(target, "effect @s wither 3 0 false").catch(() => {});
  } catch {
    // Direct damage remains authoritative if the target cannot accept effects.
  }
}

function launchDaggerThrow(player) {
  let view;
  try {
    view = normalizeVector(player.getViewDirection());
  } catch {
    view = { x: 0, y: 0, z: 1 };
  }

  const start = {
    x: player.location.x + view.x,
    y: player.location.y + 1.25,
    z: player.location.z + view.z
  };

  let projectile;
  try {
    projectile = player.dimension.spawnEntity(DAGGER_THROW_PROJECTILE_ID, start);
  } catch {
    projectile = undefined;
  }

  if (!projectile) {
    const excluded = {};
    excluded[getEntityKey(player)] = true;
    const targets = getNearbyProjectileTargets(player.dimension, {
      x: start.x + view.x * 4,
      y: start.y + view.y * 4,
      z: start.z + view.z * 4
    }, 2.2, excluded);
    if (targets.length > 0) {
      const target = targets[0];
      const indicatorContext = captureDamageIndicatorContext(target);
      applyTrueDamage(target, 8);
      applyDaggerThrowWither(target);
      emitVanillaHurtIndicator(target, indicatorContext, player, "minecraft:critical_hit_emitter");
    }
    spawnForwardFxTrail(player, 6, 1.1);
    showToast(player, "Dagger Throw", targets.length > 0 ? "Dagger struck the target." : "Dagger flew wide.");
    return;
  }

  const projectileKey = getEntityKey(projectile);
  projectile.addTag("mwr_dagger_throw_projectile");
  projectile.addTag(`mwr_owner_${player.name.replace(/[^A-Za-z0-9_]/g, "_")}`);
  ACTIVE_DAGGER_THROWS.set(projectileKey, {
    entity: projectile,
    ownerKey: getEntityKey(player) || player.name,
    direction: view,
    ticks: 0
  });
  showToast(player, "Dagger Throw", "Dagger launched.");
}

function processDaggerThrows() {
  for (const [key, state] of ACTIVE_DAGGER_THROWS) {
    const projectile = state.entity;
    const owner = getPlayerByKey(state.ownerKey);
    if (!isEntityAlive(projectile) || !isPlayerValid(owner)) {
      ACTIVE_DAGGER_THROWS.delete(key);
      removeEntity(projectile);
      continue;
    }

    state.ticks += DAGGER_THROW_UPDATE_INTERVAL_TICKS;
    const location = projectile.location;
    const nextLocation = {
      x: location.x + state.direction.x * DAGGER_THROW_STEP_PER_TICK * DAGGER_THROW_UPDATE_INTERVAL_TICKS,
      y: location.y + state.direction.y * DAGGER_THROW_STEP_PER_TICK * DAGGER_THROW_UPDATE_INTERVAL_TICKS,
      z: location.z + state.direction.z * DAGGER_THROW_STEP_PER_TICK * DAGGER_THROW_UPDATE_INTERVAL_TICKS
    };

    if (state.ticks % DAGGER_THROW_PARTICLE_INTERVAL === 0) {
      try {
        projectile.dimension.spawnParticle(getFxParticle(owner), location);
      } catch {
        runPlayerCommand(owner, `particle ${getFxParticle(owner)} ${location.x} ${location.y} ${location.z}`);
      }
    }

    if (state.ticks % DAGGER_THROW_COLLISION_INTERVAL === 0) {
      const excluded = {};
      excluded[getEntityKey(owner)] = true;
      excluded[getEntityKey(projectile)] = true;
      const collisionLocation = {
        x: (location.x + nextLocation.x) / 2,
        y: (location.y + nextLocation.y) / 2,
        z: (location.z + nextLocation.z) / 2
      };
      const targets = getNearbyProjectileTargets(projectile.dimension, collisionLocation, DAGGER_THROW_COLLISION_RADIUS, excluded);
      if (targets.length > 0) {
        const target = targets[0];
        const indicatorContext = captureDamageIndicatorContext(target);
        applyTrueDamage(target, 8);
        applyDaggerThrowWither(target);
        emitVanillaHurtIndicator(target, indicatorContext, owner, "minecraft:critical_hit_emitter");
        spawnFx(owner, 1.0);
        showToast(owner, "Dagger Throw", "Target withered.");
        removeEntity(projectile);
        ACTIVE_DAGGER_THROWS.delete(key);
        continue;
      }
    }

    if (state.ticks >= DAGGER_THROW_MAX_TICKS) {
      removeEntity(projectile);
      ACTIVE_DAGGER_THROWS.delete(key);
      continue;
    }

    teleportEntity(projectile, nextLocation);
  }
}

function getNecromancyOwnerKey(player) {
  return getEntityKey(player) || player.name || "witch";
}

function getNecromancyOwnerTag(player) {
  return `mwr_owner_${getRoarSafeKey(player.name || getNecromancyOwnerKey(player))}`;
}

function getNecromancyOwnerKeyTag(player) {
  return `mwr_owner_key_${getRoarSafeKey(getNecromancyOwnerKey(player))}`;
}

function getNecromancyOwnerNameTag(player) {
  return `mwr_owner_name_${getRoarSafeKey(player.name || "witch")}`;
}

function getNecromancyDurableOwnerTags(player) {
  const ownerKey = getNecromancyOwnerKey(player);
  const ownerName = player.name || ownerKey || "witch";
  const ownerUuid = getEntityKey(player) || ownerKey || ownerName;
  return [
    NECROMANCY_OWNER_ID_TAG,
    NECROMANCY_OWNER_NAME_TAG,
    NECROMANCY_OWNER_UUID_TAG,
    `owner_id_${getRoarSafeKey(ownerKey)}`,
    `owner_name_${getRoarSafeKey(ownerName)}`,
    `owner_uuid_${getRoarSafeKey(ownerUuid)}`
  ];
}

function isNecromancyMinion(entity) {
  try {
    return !!entity && entity.hasTag && entity.hasTag("mwr_necromancy_minion");
  } catch {
    return false;
  }
}

function getActiveNecromancyGroupEntry(entity) {
  if (!isNecromancyMinion(entity)) {
    return undefined;
  }
  const entityKey = getEntityKey(entity);
  for (const [ownerKey, group] of NECROMANCY_GROUPS.entries()) {
    if (group.skeletons.some((skeleton) => skeleton === entity || getEntityKey(skeleton) === entityKey)) {
      return { ownerKey, group };
    }
  }
  return undefined;
}

function getNecromancyDamageGroupEntry(source) {
  const attacker = source && source.damagingEntity;
  if (isNecromancyMinion(attacker)) {
    return getActiveNecromancyGroupEntry(attacker);
  }
  return undefined;
}

function isNecromancyOwner(group, entity) {
  if (!group || !entity) {
    return false;
  }
  return (group.ownerPlayerKey && getEntityKey(entity) === group.ownerPlayerKey) ||
    (group.ownerName && entity.name === group.ownerName) ||
    (group.ownerTag && entity.hasTag && entity.hasTag(group.ownerTag));
}

function isNecromancyOwnerMorph(group, entity) {
  if (!group || !entity || !entity.hasTag) {
    return false;
  }
  return !!(group.ownerTag && entity.hasTag(group.ownerTag) && (
    entity.hasTag("mwr_morphed") ||
    entity.hasTag("mwr_morph_bat") ||
    entity.hasTag("mwr_morph_shadow_wolf") ||
    entity.hasTag("mwr_morph_banshee") ||
    entity.hasTag("mwr_bat_morph_active")
  ));
}

function getNecromancySkeletonKey(skeleton) {
  return getEntityKey(skeleton) || `${Math.floor(skeleton.location.x)}:${Math.floor(skeleton.location.y)}:${Math.floor(skeleton.location.z)}`;
}

function isNecromancyIgnoredTarget(target, owner) {
  if (!target || target === owner || !isEntityAlive(target) || target.typeId === "minecraft:player") {
    return true;
  }
  if (owner &&
    target.typeId === "minecraft:player" &&
    (target.name === owner.name || getEntityKey(target) === getEntityKey(owner))) {
    return true;
  }
  if (owner &&
    target.typeId === "minecraft:player" &&
    target.hasTag &&
    target.hasTag(NECROMANCY_SUMMONER_TAG)) {
    return true;
  }
  if (target.hasTag && (
    target.hasTag("mwr_morphed") ||
    target.hasTag("mwr_morph_bat") ||
    target.hasTag("mwr_morph_shadow_wolf") ||
    target.hasTag("mwr_morph_banshee") ||
    target.hasTag("mwr_bat_morph_active")
  )) {
    return true;
  }
  if (isNecromancyMinion(target) || (target.hasTag && target.hasTag(ROAR_WOLF_TAG))) {
    return true;
  }
  const typeId = String(target.typeId || "");
  return typeId === SWITCH_THROW_PROJECTILE_ID ||
    typeId === DAGGER_THROW_PROJECTILE_ID ||
    typeId.indexOf("item") !== -1 ||
    typeId.indexOf("xp_orb") !== -1;
}

function isNecromancySpawnLocationClear(dimension, location, usedLocations) {
  for (const used of usedLocations) {
    if (distanceSquared(used, location) < 1.5) {
      return false;
    }
  }
  try {
    const feet = dimension.getBlock({
      x: Math.floor(location.x),
      y: Math.floor(location.y),
      z: Math.floor(location.z)
    });
    const head = dimension.getBlock({
      x: Math.floor(location.x),
      y: Math.floor(location.y + 1),
      z: Math.floor(location.z)
    });
    const ground = dimension.getBlock({
      x: Math.floor(location.x),
      y: Math.floor(location.y - 1),
      z: Math.floor(location.z)
    });
    if (!feet || !head || !ground || !isAirLike(feet.typeId) || !isAirLike(head.typeId) || isAirLike(ground.typeId)) {
      return false;
    }
  } catch {
    return false;
  }
  try {
    return dimension.getEntities({ location, maxDistance: 0.8 }).filter((entity) => !isNecromancyMinion(entity)).length === 0;
  } catch {
    return true;
  }
}

function getNecromancySpawnCandidates(player) {
  const offsets = [
    { x: 1.5, z: 1.5 },
    { x: -1.5, z: 1.5 },
    { x: 1.5, z: -1.5 },
    { x: -1.5, z: -1.5 },
    { x: 2.5, z: 0 },
    { x: -2.5, z: 0 },
    { x: 0, z: 2.5 },
    { x: 0, z: -2.5 },
    { x: 2.5, z: 2.5 },
    { x: -2.5, z: 2.5 },
    { x: 2.5, z: -2.5 },
    { x: -2.5, z: -2.5 }
  ];
  const candidates = [];
  for (const offset of offsets) {
    candidates.push({
      x: player.location.x + offset.x,
      y: player.location.y,
      z: player.location.z + offset.z
    });
  }
  return candidates;
}

function tryRunEntityCommand(entity, command) {
  try {
    if (entity && typeof entity.runCommand === "function") {
      runCommandCompat(entity, command).catch(() => {});
      return true;
    }
  } catch {
    // Entity command support is version-dependent.
  }
  return false;
}

function primeNecromancyMinion(skeleton, ownerTag, owner) {
  skeleton.addTag("mwr_necromancy_minion");
  skeleton.addTag("mwr_necromancy_ally");
  skeleton.addTag(NECROMANCY_ALLY_TAG);
  skeleton.addTag("mwr_necromancy_idle");
  skeleton.addTag(ownerTag);
  if (owner) {
    skeleton.addTag(getNecromancyOwnerKeyTag(owner));
    skeleton.addTag(getNecromancyOwnerNameTag(owner));
    for (const tag of getNecromancyDurableOwnerTags(owner)) {
      skeleton.addTag(tag);
    }
  }
  try {
    skeleton.nameTag = "Necromancy Skeleton";
  } catch {
    // Name tags are cosmetic only.
  }
  maintainNecromancyMinionProtection(skeleton, 181);
  healEntityToFull(skeleton);
  setNecromancyMinionIdle(skeleton, true);
}

function maintainNecromancyMinionProtection(skeleton, seconds) {
  const duration = Math.max(2, Math.ceil(seconds || 3));
  tryRunEntityCommand(skeleton, `effect @s resistance ${duration} 255 true`);
  tryRunEntityCommand(skeleton, `effect @s regeneration ${duration} 255 true`);
}

function setNecromancyMinionIdle(skeleton, idle) {
  if (!isEntityAlive(skeleton)) {
    return;
  }
  try {
    if (idle) {
      if (skeleton.addTag && skeleton.hasTag && !skeleton.hasTag("mwr_necromancy_idle")) {
        skeleton.addTag("mwr_necromancy_idle");
      }
      skeleton.target = undefined;
      tryRunEntityCommand(skeleton, "effect @s weakness 3 255 true");
      tryRunEntityCommand(skeleton, "event entity @s minecraft_world_rpg:idle");
    } else {
      if (skeleton.hasTag && skeleton.hasTag("mwr_necromancy_idle")) {
        skeleton.removeTag("mwr_necromancy_idle");
      }
      tryRunEntityCommand(skeleton, "effect @s weakness 0 0 true");
      tryRunEntityCommand(skeleton, "event entity @s minecraft_world_rpg:commanded");
    }
  } catch {
    // Idle state is reinforced by the damage guard even if target assignment is read-only.
  }
}

function setNecromancyMinionTarget(skeleton, target) {
  if (!isEntityAlive(skeleton) || !target || !isPlayerValid(target)) {
    setNecromancyMinionIdle(skeleton, true);
    return false;
  }
  setNecromancyMinionIdle(skeleton, false);
  try {
    skeleton.target = target;
    tryRunEntityCommand(skeleton, "effect @s speed 2 0 true");
    return true;
  } catch {
    return false;
  }
}

function setNecromancyTargetTag(target, active) {
  if (!target || !target.addTag || !target.removeTag) {
    return;
  }
  try {
    if (active) {
      if (!target.hasTag || !target.hasTag(NECROMANCY_TARGET_TAG)) {
        target.addTag(NECROMANCY_TARGET_TAG);
      }
    } else if (!isNecromancyTargetUsedByAnyGroup(target) && target.hasTag && target.hasTag(NECROMANCY_TARGET_TAG)) {
      target.removeTag(NECROMANCY_TARGET_TAG);
    }
  } catch {
    // Target tags are a behavior hint; script damage guards still protect allies.
  }
}

function isNecromancyTargetUsedByAnyGroup(target) {
  const targetKey = getEntityKey(target);
  if (!targetKey) {
    return false;
  }
  for (const group of NECROMANCY_GROUPS.values()) {
    if (group.target && getEntityKey(group.target) === targetKey) {
      return true;
    }
  }
  return false;
}

function getProjectileEventTarget(event) {
  try {
    const hit = event.getEntityHit();
    return hit ? hit.entity : undefined;
  } catch {
    return undefined;
  }
}

function summonNecromancyMinions(player) {
  const ownerKey = getNecromancyOwnerKey(player);
  const ownerTag = getNecromancyOwnerTag(player);
  despawnNecromancyGroup(ownerKey);
  cleanupNecromancyEntitiesForOwner(player, ownerTag);

  const skeletons = [];
  const usedLocations = [];
  const yOffsets = [0, 1, -1, 2, -2];
  for (const candidate of getNecromancySpawnCandidates(player)) {
    for (const yOffset of yOffsets) {
      if (skeletons.length >= 3) {
        break;
      }
      const location = {
        x: candidate.x,
        y: candidate.y + yOffset,
        z: candidate.z
      };
      if (!isNecromancySpawnLocationClear(player.dimension, location, usedLocations)) {
        continue;
      }
      try {
        const skeletonType = NECROMANCY_SKELETON_ENTITY_IDS[skeletons.length % NECROMANCY_SKELETON_ENTITY_IDS.length] || NECROMANCY_SKELETON_ENTITY_ID;
        const skeleton = player.dimension.spawnEntity(skeletonType, location);
        usedLocations.push(location);
        primeNecromancyMinion(skeleton, ownerTag, player);
        skeletons.push(skeleton);
      } catch {
        // Skip unsafe or failed spawns instead of creating untracked hostile skeletons.
      }
    }
    if (skeletons.length >= 3) {
      break;
    }
  }

  if (skeletons.length < 3) {
    const fallbackOffsets = [
      { x: 1.4, y: 0, z: 1.4 },
      { x: -1.4, y: 0, z: 1.4 },
      { x: 0, y: 0, z: -1.8 }
    ];
    for (let index = skeletons.length; index < 3; index += 1) {
      const offset = fallbackOffsets[index % fallbackOffsets.length];
      try {
        const skeletonType = NECROMANCY_SKELETON_ENTITY_IDS[index % NECROMANCY_SKELETON_ENTITY_IDS.length] || NECROMANCY_SKELETON_ENTITY_ID;
        const skeleton = player.dimension.spawnEntity(skeletonType, {
          x: player.location.x + offset.x,
          y: player.location.y + offset.y,
          z: player.location.z + offset.z
        });
        primeNecromancyMinion(skeleton, ownerTag, player);
        skeletons.push(skeleton);
      } catch {
        // Keep any already spawned minions rather than discarding the whole cast.
      }
    }
  }

  NECROMANCY_GROUPS.set(ownerKey, {
    ownerName: player.name,
    ownerPlayerKey: getEntityKey(player) || player.name,
    ownerTag,
    skeletons,
    target: undefined,
    targetKey: "",
    targetMode: "idle",
    expiresAt: getTickNow() + NECROMANCY_LIFETIME_TICKS,
    lastUpkeepTick: 0,
    lastAttackTicks: {}
  });
  try {
    player.addTag(NECROMANCY_OWNER_TAG);
    player.addTag(NECROMANCY_SUMMONER_TAG);
    player.addTag(ownerTag);
    player.addTag(getNecromancyOwnerKeyTag(player));
    player.addTag(getNecromancyOwnerNameTag(player));
    for (const tag of getNecromancyDurableOwnerTags(player)) {
      player.addTag(tag);
    }
  } catch {
    // Owner tags are only needed for minion behavior filters.
  }
  showToast(player, "Necromancy", "Three impervious skeleton troops rise for 3 minutes.");
  spawnFx(player, 1.2);
}

function despawnNecromancyGroup(ownerKey) {
  const group = NECROMANCY_GROUPS.get(ownerKey);
  if (!group) {
    return;
  }
  const previousTarget = group.target;
  group.target = undefined;
  setNecromancyTargetTag(previousTarget, false);
  const owner = getPlayerByKey(ownerKey) || Array.from(getOnlinePlayers()).find((player) => player.name === group.ownerName);
  if (owner && owner.removeTag) {
    try {
      owner.removeTag(NECROMANCY_OWNER_TAG);
      owner.removeTag(NECROMANCY_SUMMONER_TAG);
      owner.removeTag(group.ownerTag);
      owner.removeTag(getNecromancyOwnerKeyTag(owner));
      owner.removeTag(getNecromancyOwnerNameTag(owner));
      for (const tag of getNecromancyDurableOwnerTags(owner)) {
        owner.removeTag(tag);
      }
    } catch {
      // Owner may have left or tags may already be gone.
    }
  }
  for (const skeleton of group.skeletons) {
    removeEntity(skeleton);
  }
  NECROMANCY_GROUPS.delete(ownerKey);
}

function clearNecromancyTags(entity, ownerTag) {
  if (!entity || !entity.removeTag) {
    return;
  }
  const fixedTags = [
    NECROMANCY_OWNER_TAG,
    NECROMANCY_SUMMONER_TAG,
    NECROMANCY_ALLY_TAG,
    NECROMANCY_TARGET_TAG,
    NECROMANCY_OWNER_ID_TAG,
    NECROMANCY_OWNER_NAME_TAG,
    NECROMANCY_OWNER_UUID_TAG,
    "mwr_necromancy_minion",
    "mwr_necromancy_ally",
    "mwr_necromancy_idle",
    "mwr_necromancy_projectile",
    "necromancy_aiming"
  ];
  for (const tag of fixedTags) {
    try {
      if (!entity.hasTag || entity.hasTag(tag)) {
        entity.removeTag(tag);
      }
    } catch {
      // Tag may not exist on this entity anymore.
    }
  }
  try {
    if (typeof entity.getTags === "function") {
      for (const tag of entity.getTags()) {
        if ((tag.indexOf("mwr_owner_") === 0 ||
          tag.indexOf("mwr_owner_key_") === 0 ||
          tag.indexOf("mwr_owner_name_") === 0 ||
          tag.indexOf("owner_id_") === 0 ||
          tag.indexOf("owner_name_") === 0 ||
          tag.indexOf("owner_uuid_") === 0) &&
          (!ownerTag ||
            tag === ownerTag ||
            tag.indexOf("mwr_owner_key_") === 0 ||
            tag.indexOf("mwr_owner_name_") === 0 ||
            tag.indexOf("owner_id_") === 0 ||
            tag.indexOf("owner_name_") === 0 ||
            tag.indexOf("owner_uuid_") === 0)) {
          entity.removeTag(tag);
        }
      }
    } else if (ownerTag) {
      entity.removeTag(ownerTag);
    }
  } catch {
    // Entity tag reads can fail while unloading.
  }
}

function cleanupNecromancyEntitiesForOwner(player, ownerTag) {
  const dimensionIds = ["overworld", "nether", "the_end"];
  for (const dimensionId of dimensionIds) {
    let dimension;
    try {
      dimension = world.getDimension(dimensionId);
    } catch {
      dimension = undefined;
    }
    if (!dimension) {
      continue;
    }
    try {
      for (const entity of dimension.getEntities({ tags: [ownerTag] })) {
        clearNecromancyTags(entity, ownerTag);
        removeEntity(entity);
      }
    } catch {
      // Loaded-entity cleanup is best-effort after authoritative registries clear.
    }
  }
  clearNecromancyTags(player, ownerTag);
}

function cleanupNecromancyRebirthState(player) {
  const ownerKey = getNecromancyOwnerKey(player);
  const ownerTag = getNecromancyOwnerTag(player);
  despawnNecromancyGroup(ownerKey);
  for (const [groupOwnerKey, group] of Array.from(NECROMANCY_GROUPS.entries())) {
    if (group.ownerPlayerKey === ownerKey || group.ownerName === player.name || group.ownerTag === ownerTag) {
      despawnNecromancyGroup(groupOwnerKey);
    }
  }
  cleanupNecromancyEntitiesForOwner(player, ownerTag);
}

function assignNecromancyGroupTarget(owner, target, targetMode) {
  if (!owner || owner.typeId !== "minecraft:player" || isNecromancyIgnoredTarget(target, owner)) {
    return 0;
  }
  const ownerKey = getNecromancyOwnerKey(owner);
  const group = NECROMANCY_GROUPS.get(ownerKey);
  if (!group || !group.skeletons || group.skeletons.length === 0) {
    return 0;
  }
  const previousTarget = group.target;
  group.target = undefined;
  setNecromancyTargetTag(previousTarget, false);
  group.target = target;
  group.targetKey = getEntityKey(target);
  group.targetMode = targetMode;
  group.lastAttackTicks = group.lastAttackTicks || {};
  setNecromancyTargetTag(target, true);
  for (const skeleton of group.skeletons) {
    if (!isEntityAlive(skeleton)) {
      continue;
    }
    setNecromancyMinionTarget(skeleton, target);
  }
  return group.skeletons.length;
}

function retargetNecromancyFromOwnerHit(player, target) {
  assignNecromancyGroupTarget(player, target, "owner_hit");
}

function findNearestSummonHostile(owner, maxDistance) {
  if (!isPlayerValid(owner)) {
    return undefined;
  }
  let candidates = [];
  try {
    candidates = owner.dimension.getEntities({
      location: owner.location,
      maxDistance
    });
  } catch {
    return undefined;
  }
  const hostiles = candidates.filter((entity) =>
    entity !== owner &&
    isPlayerValid(entity) &&
    !isNecromancyMinion(entity) &&
    !isVampireTroop(entity) &&
    !(entity.hasTag && entity.hasTag(ROAR_WOLF_TAG)) &&
    isHostileMob(entity));
  hostiles.sort((a, b) => distanceSquared(a.location, owner.location) - distanceSquared(b.location, owner.location));
  return hostiles[0];
}

function applySummonMagicDamage(attacker, target, amount) {
  const damage = Math.max(1, Math.ceil(Number(amount) || 0));
  if (!isEntityAlive(attacker) || !isPlayerValid(target) || damage <= 0) {
    return false;
  }
  if (target.typeId === "minecraft:player" &&
    shouldSecondLifeDenyDamage(target, damage, "scripted_summon_magic")) {
    return true;
  }

  const damageTag = `mwr_summon_magic_${getTickNow()}_${Math.floor(Math.random() * 100000)}`;
  try {
    target.addTag(damageTag);
    const result = runCommandCompat(attacker, `damage @e[tag=${damageTag},c=1] ${damage} magic`);
    if (result && typeof result.catch === "function") {
      result.catch(() => {
        if (isPlayerValid(target)) {
          applyTrueDamage(target, damage);
        }
      });
    }
    system.runTimeout(() => {
      try {
        if (isPlayerValid(target) && target.hasTag && target.hasTag(damageTag)) {
          target.removeTag(damageTag);
        }
      } catch {
        // The target may die or unload before tag cleanup.
      }
    }, 2);
    return true;
  } catch {
    applyTrueDamage(target, damage);
    return true;
  }
}

function getNecromancyFollowSlotOffset(slotIndex) {
  const offsets = [
    { side: -1.4, back: 2.4 },
    { side: 1.4, back: 2.4 },
    { side: 0, back: 3.8 }
  ];
  return offsets[Math.max(0, slotIndex || 0) % offsets.length];
}

function getNecromancyFollowLocation(owner, slotIndex) {
  let view = { x: 0, y: 0, z: 1 };
  try {
    view = normalizeVector(owner.getViewDirection());
  } catch {
    // Default forward vector is fine when view direction is unavailable.
  }
  const flatForward = normalizeVector({ x: view.x, y: 0, z: view.z });
  const forward = flatForward.x || flatForward.z ? flatForward : { x: 0, y: 0, z: 1 };
  const side = { x: -forward.z, y: 0, z: forward.x };
  const offset = getNecromancyFollowSlotOffset(slotIndex);
  return {
    x: owner.location.x - forward.x * offset.back + side.x * offset.side,
    y: owner.location.y,
    z: owner.location.z - forward.z * offset.back + side.z * offset.side
  };
}

function moveNecromancyMinionTowardOwner(skeleton, owner, slotIndex) {
  if (!isEntityAlive(skeleton) || !isPlayerValid(owner)) {
    return;
  }
  const followLocation = getNecromancyFollowLocation(owner, slotIndex);
  const distanceToOwner = distanceSquared(skeleton.location, owner.location);
  const distanceToSlot = distanceSquared(skeleton.location, followLocation);
  if (distanceToSlot <= 2.25) {
    return;
  }
  if (distanceToOwner > 900) {
    teleportEntity(skeleton, followLocation);
    return;
  }
  const direction = normalizeVector({
    x: followLocation.x - skeleton.location.x,
    y: Math.max(-0.5, Math.min(0.5, followLocation.y - skeleton.location.y)),
    z: followLocation.z - skeleton.location.z
  });
  applyEntityImpulse(skeleton, {
    x: direction.x * 0.12,
    y: direction.y * 0.04,
    z: direction.z * 0.12
  });
}

function processNecromancyGroups() {
  const now = getTickNow();
  for (const [ownerKey, group] of NECROMANCY_GROUPS) {
    if (now >= group.expiresAt) {
      despawnNecromancyGroup(ownerKey);
      continue;
    }
    const owner = getPlayerByKey(ownerKey) || Array.from(getOnlinePlayers()).find((player) => player.name === group.ownerName);
    if (!isPlayerValid(owner)) {
      despawnNecromancyGroup(ownerKey);
      continue;
    }

    const targetValid = group.target &&
      isPlayerValid(group.target) &&
      !isNecromancyIgnoredTarget(group.target, owner);
    if (!targetValid) {
      const previousTarget = group.target;
      group.target = undefined;
      group.targetKey = "";
      group.targetMode = "idle";
      setNecromancyTargetTag(previousTarget, false);
    }
    const liveSkeletons = [];
    for (const skeleton of group.skeletons) {
      if (!isEntityAlive(skeleton)) {
        continue;
      }
      liveSkeletons.push(skeleton);
      if (now - (group.lastUpkeepTick || 0) >= 20) {
        maintainNecromancyMinionProtection(skeleton, 3);
        spawnParticleSafe(skeleton.dimension, getFxParticle(owner), {
          x: skeleton.location.x,
          y: skeleton.location.y + 1.3,
          z: skeleton.location.z
        });
      }

      if (group.target) {
        setNecromancyMinionTarget(skeleton, group.target);
      } else {
        setNecromancyMinionTarget(skeleton, undefined);
        moveNecromancyMinionTowardOwner(skeleton, owner, liveSkeletons.length - 1);
      }
    }
    group.skeletons = liveSkeletons;
    if (now - (group.lastUpkeepTick || 0) >= 20) {
      group.lastUpkeepTick = now;
    }
    if (group.skeletons.length === 0) {
      despawnNecromancyGroup(ownerKey);
    }
  }
}

function getArcherSkillLevel(player, objective, maxLevel) {
  return getActiveSkillLevel(player, objective, maxLevel);
}

function spawnTemporaryEntity(dimension, entityId, location, lifetimeTicks) {
  try {
    const entity = dimension.spawnEntity(entityId, location);
    system.runTimeout(() => removeEntity(entity), Math.max(1, lifetimeTicks || 8));
    return entity;
  } catch {
    return undefined;
  }
}

function spawnArcherProjectileMarker(player, entityId, location) {
  const marker = spawnTemporaryEntity(player.dimension, entityId, location, 8);
  if (marker && marker.addTag) {
    try {
      marker.addTag("mwr_archer_projectile_fx");
    } catch {
      // Cosmetic marker only.
    }
  }
}

function getNearbyArcherTargets(dimension, location, maxDistance, excludedIds) {
  const exclusions = excludedIds || {};
  try {
    return dimension.getEntities({ location, maxDistance }).filter((entity) => {
      if (!entity || exclusions[getEntityKey(entity)] || isCustomProjectileEntity(entity)) {
        return false;
      }
      if (entity.hasTag && (entity.hasTag("mwr_necromancy_minion") || entity.hasTag(ROAR_WOLF_TAG))) {
        return false;
      }
      const typeId = String(entity.typeId || "");
      return typeId.indexOf("item") === -1 &&
        typeId.indexOf("xp_orb") === -1 &&
        typeId.indexOf("arrow") === -1 &&
        typeId.indexOf("projectile") === -1;
    });
  } catch {
    return [];
  }
}

function spawnParticleLine(dimension, particle, start, end, steps) {
  const count = Math.max(2, steps || 8);
  for (let index = 0; index <= count; index += 1) {
    const t = index / count;
    const location = {
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t,
      z: start.z + (end.z - start.z) * t
    };
    try {
      dimension.spawnParticle(particle, location);
    } catch {
      runDimensionCommand(dimension, `particle ${particle} ${location.x.toFixed(2)} ${location.y.toFixed(2)} ${location.z.toFixed(2)}`);
    }
  }
}

function applyArcherKnockback(target, origin, horizontalStrength, verticalStrength) {
  const direction = normalizeVector({
    x: target.location.x - origin.x,
    y: 0,
    z: target.location.z - origin.z
  });
  try {
    if (typeof target.applyKnockback === "function") {
      target.applyKnockback({ x: direction.x * horizontalStrength, z: direction.z * horizontalStrength }, verticalStrength);
      return;
    }
  } catch {
    // Fall back below.
  }
  try {
    target.applyKnockback(direction.x, direction.z, horizontalStrength, verticalStrength);
  } catch {
    applyEntityImpulse(target, {
      x: direction.x * horizontalStrength * 0.35,
      y: verticalStrength,
      z: direction.z * horizontalStrength * 0.35
    });
  }
}

function canUseArcherChainLightning(player) {
  const key = getEntityKey(player) || player.name || "archer";
  return getTickNow() >= (ARCHER_CHAIN_LIGHTNING_COOLDOWNS.get(key) || 0);
}

function setArcherChainLightningCooldown(player) {
  const key = getEntityKey(player) || player.name || "archer";
  ARCHER_CHAIN_LIGHTNING_COOLDOWNS.set(key, getTickNow() + ARCHER_CHAIN_LIGHTNING_COOLDOWN_TICKS);
}

function chainLightning(player, firstTarget) {
  const level = getArcherSkillLevel(player, "skill_chain_lightning", 3);
  const maxTargets = Math.min(ARCHER_CHAIN_LIGHTNING_MAX_TARGETS, level * ARCHER_CHAIN_LIGHTNING_TARGETS_PER_LEVEL);
  if (maxTargets <= 0 || !firstTarget) {
    return 0;
  }

  spawnArcherProjectileMarker(player, CHAIN_LIGHTNING_ARROW_ENTITY_ID, firstTarget.location);
  const hit = {};
  hit[getEntityKey(firstTarget)] = true;
  let source = firstTarget;
  let arcs = 0;
  const particle = getFxParticle(player);

  while (arcs < maxTargets && source && source.location) {
    const candidates = getNearbyArcherTargets(source.dimension, source.location, 7, hit);
    if (candidates.length === 0) {
      break;
    }
    candidates.sort((a, b) => distanceSquared(a.location, source.location) - distanceSquared(b.location, source.location));
    const target = candidates[0];
    hit[getEntityKey(target)] = true;
    const sourcePoint = { x: source.location.x, y: source.location.y + 1, z: source.location.z };
    const targetPoint = { x: target.location.x, y: target.location.y + 1, z: target.location.z };
    spawnParticleLine(source.dimension, particle, sourcePoint, targetPoint, 8);
    applyTrueDamage(target, Math.max(2, 6 - Math.floor(arcs / 3)));
    applyArcherKnockback(target, source.location, 1.0, 0.18);
    try {
      runCommandCompat(target, "effect @s glowing 2 0 true").catch(() => {});
    } catch {
      // Lightning FX already landed.
    }
    source = target;
    arcs += 1;
  }
  return arcs;
}

function tryApplyCritFocus(player, target) {
  const level = getArcherSkillLevel(player, "skill_crit_focus", 5);
  if (level <= 0 || Math.random() >= level / 5) {
    return false;
  }
  const indicatorContext = captureDamageIndicatorContext(target);
  spawnArcherProjectileMarker(player, CRIT_FOCUS_ARROW_ENTITY_ID, target.location);
  applyTrueDamage(target, ARCHER_BASE_ARROW_DAMAGE);
  emitSkillDamageIndicator(indicatorContext, player, "game.player.hurt", "minecraft:critical_hit_emitter");
  return true;
}

function applyLevitateArrow(player, target) {
  const level = getArcherSkillLevel(player, "skill_levitate", 2);
  if (level <= 0) {
    return;
  }
  spawnArcherProjectileMarker(player, LEVITATE_ARROW_ENTITY_ID, target.location);
  try {
    if (typeof target.addEffect === "function") {
      target.addEffect("levitation", 20 * level, { amplifier: 0, showParticles: false });
    } else {
      runCommandCompat(target, `effect @s levitation ${level} 0 true`).catch(() => {});
    }
  } catch {
    try {
      runCommandCompat(target, `effect @s levitation ${level} 0 true`).catch(() => {});
    } catch {
      // Direct target effect failed; do not use radius fallbacks that hit the wrong mob.
    }
  }
  const location = target.location;
  for (let step = 0; step < 5; step += 1) {
    const angle = step * 1.256;
    const particleLocation = {
      x: location.x + Math.cos(angle) * 0.55,
      y: location.y + 0.4 + step * 0.28,
      z: location.z + Math.sin(angle) * 0.55
    };
    try {
      target.dimension.spawnParticle(getFxParticle(player), particleLocation);
    } catch {
      runPlayerCommand(player, `execute positioned ${particleLocation.x} ${particleLocation.y} ${particleLocation.z} run particle ${getFxParticle(player)} ~ ~ ~`);
    }
  }
}

function applyExplosiveArrow(player, impactTarget) {
  if (!isSkillUnlocked(player, "skill_explosive_arrows") ||
    !skillBelongsToCurrentBuild(player, "skill_explosive_arrows") ||
    !impactTarget || impactTarget === player || !isPlayerValid(impactTarget)) {
    return;
  }
  const location = impactTarget.location;
  const playerKey = getEntityKey(player);
  if (playerKey) {
    const expiresAt = getTickNow() + ARCHER_EXPLOSIVE_SELF_GUARD_TICKS;
    ARCHER_EXPLOSIVE_SELF_GUARDS.set(playerKey, expiresAt);
    system.runTimeout(() => {
      if ((ARCHER_EXPLOSIVE_SELF_GUARDS.get(playerKey) || 0) <= expiresAt) {
        ARCHER_EXPLOSIVE_SELF_GUARDS.delete(playerKey);
      }
    }, ARCHER_EXPLOSIVE_SELF_GUARD_TICKS + 1);
  }
  spawnArcherProjectileMarker(player, EXPLOSIVE_ARROW_ENTITY_ID, location);
  spawnParticleLine(player.dimension, getFxParticle(player), { x: location.x - 1.2, y: location.y + 1, z: location.z }, { x: location.x + 1.2, y: location.y + 1, z: location.z }, 6);
  runPlayerCommand(player, `execute positioned ${location.x} ${location.y + 0.5} ${location.z} run particle minecraft:large_explosion ~ ~ ~`);
  runPlayerCommand(player, `playsound random.explode @a[r=18] ${location.x} ${location.y} ${location.z} 0.8 1.2`);
  applyTrueDamage(impactTarget, ARCHER_EXPLOSIVE_DAMAGE);
  applyArcherKnockback(impactTarget, location, 1.35, 0.3);
}

function applyTaunt(player) {
  runPlayerCommand(player, `effect @s strength ${getPotionDuration(player, 10)} 1 true`);
  runPlayerCommand(player, `effect @s absorption ${getPotionDuration(player, 10)} 1 true`);
  const targets = getNearbyDamageTargets(player.dimension, player.location, 10, {});
  for (const target of targets) {
    try {
      target.addTag(getTauntTagForPlayer(player));
      runCommandCompat(target, "effect @s glowing 8 0 true").catch(() => {});
      target.target = player;
      if (typeof target.triggerEvent === "function") {
        target.triggerEvent("minecraft:become_angry");
      }
      runCommandCompat(target, "event entity @s minecraft:become_angry").catch(() => {});
      runCommandCompat(target, "event entity @s minecraft:angry").catch(() => {});
    } catch {
      // Not every mob exposes anger events.
    }
  }
  showToast(player, "Taunt", "Nearby mobs are provoked. Strength and absorption active.");
  spawnFx(player, 1.2);
  spawnFxBurst(player, 4.0, 16);
}

function isBansheeMindFractureActive(player) {
  return getScore(player, "class_primary") === CLASS.BANSHEE &&
    isSkillActive(player, "banshee_mind_fracture") &&
    getScore(player, "banshee_mind_fracture_enabled") > 0;
}

function applyBansheeMindFracture(player, target) {
  if (!isBansheeMindFractureActive(player) || !target || !isPlayerValid(target)) {
    return false;
  }
  try {
    runCommandCompat(target, "effect @s nausea 5 0 true").catch(() => {});
  } catch {
    runPlayerCommand(player, "execute at @s run effect @e[r=4,c=1,type=!minecraft:player] nausea 5 0 true");
  }
  spawnFx(player, 1.0);
  return true;
}

function isBansheeSonicTarget(entity, player) {
  if (!entity || entity === player || !isPlayerValid(entity)) {
    return false;
  }
  const typeId = String(entity.typeId || "");
  if (typeId === SWITCH_THROW_PROJECTILE_ID || typeId === DAGGER_THROW_PROJECTILE_ID) {
    return false;
  }
  return typeId.indexOf("item") === -1 &&
    typeId.indexOf("xp_orb") === -1 &&
    typeId.indexOf("arrow") === -1 &&
    typeId.indexOf("projectile") === -1;
}

function getBansheeSonicRayDirections(view) {
  let right = normalizeVector({ x: view.z, y: 0, z: -view.x });
  if (Math.abs(right.x) + Math.abs(right.z) < 0.01) {
    right = { x: 1, y: 0, z: 0 };
  }
  const up = normalizeVector({
    x: right.y * view.z - right.z * view.y,
    y: right.z * view.x - right.x * view.z,
    z: right.x * view.y - right.y * view.x
  });
  const directions = [];
  for (let yaw = -32; yaw <= 32; yaw += 8) {
    for (let pitch = -32; pitch <= 32; pitch += 8) {
      if (Math.sqrt(yaw * yaw + pitch * pitch) > BANSHEE_SONIC_HALF_ANGLE_DEGREES) {
        continue;
      }
      const yawRadians = yaw * Math.PI / 180;
      const pitchRadians = pitch * Math.PI / 180;
      const forwardScale = Math.cos(yawRadians) * Math.cos(pitchRadians);
      const sideScale = Math.sin(yawRadians) * Math.cos(pitchRadians);
      const upScale = Math.sin(pitchRadians);
      directions.push(normalizeVector({
        x: view.x * forwardScale + right.x * sideScale + up.x * upScale,
        y: view.y * forwardScale + right.y * sideScale + up.y * upScale,
        z: view.z * forwardScale + right.z * sideScale + up.z * upScale
      }));
    }
  }
  return directions;
}

function getNearestBansheeSonicHitOnRay(origin, ray, candidates) {
  let nearest;
  for (const candidate of candidates) {
    const delta = {
      x: candidate.center.x - origin.x,
      y: candidate.center.y - origin.y,
      z: candidate.center.z - origin.z
    };
    const projected = delta.x * ray.x + delta.y * ray.y + delta.z * ray.z;
    if (projected <= 0.1 || projected > BANSHEE_SONIC_RANGE) {
      continue;
    }
    const deltaLengthSq = delta.x * delta.x + delta.y * delta.y + delta.z * delta.z;
    const lateralSq = Math.max(0, deltaLengthSq - projected * projected);
    const rayRadius = BANSHEE_SONIC_RAY_HIT_RADIUS + projected * 0.07;
    if (lateralSq > rayRadius * rayRadius || (nearest && projected >= nearest.projected)) {
      continue;
    }
    nearest = { entity: candidate.entity, projected };
  }
  return nearest;
}

function getBansheeSonicTargets(player) {
  let view;
  try {
    view = normalizeVector(player.getViewDirection());
  } catch {
    view = { x: 0, y: 0, z: 1 };
  }
  const origin = {
    x: player.location.x,
    y: player.location.y + 1.35,
    z: player.location.z
  };
  const candidates = [];
  const coneCosine = Math.cos(BANSHEE_SONIC_HALF_ANGLE_DEGREES * Math.PI / 180);
  try {
    for (const entity of player.dimension.getEntities({ location: player.location, maxDistance: BANSHEE_SONIC_RANGE + 2 })) {
      if (!isBansheeSonicTarget(entity, player)) {
        continue;
      }
      const center = {
        x: entity.location.x,
        y: entity.location.y + 0.8,
        z: entity.location.z
      };
      const delta = {
        x: center.x - origin.x,
        y: center.y - origin.y,
        z: center.z - origin.z
      };
      const distance = Math.sqrt(delta.x * delta.x + delta.y * delta.y + delta.z * delta.z);
      if (distance <= 0.1 || distance > BANSHEE_SONIC_RANGE) {
        continue;
      }
      const direction = {
        x: delta.x / distance,
        y: delta.y / distance,
        z: delta.z / distance
      };
      const dot = direction.x * view.x + direction.y * view.y + direction.z * view.z;
      if (dot >= coneCosine) {
        candidates.push({ entity, center, distance });
      }
    }
  } catch {
    return [];
  }
  const hits = new Map();
  for (const ray of getBansheeSonicRayDirections(view)) {
    const hit = getNearestBansheeSonicHitOnRay(origin, ray, candidates);
    if (!hit) {
      continue;
    }
    const key = getEntityKey(hit.entity);
    if (!key || hits.has(key)) {
      continue;
    }
    hits.set(key, hit);
  }
  return Array.from(hits.values())
    .sort((a, b) => a.projected - b.projected)
    .map((entry) => entry.entity);
}

function markSonicScreamTarget(player, target) {
  const key = getEntityKey(target);
  if (!key) {
    return;
  }
  SONIC_SCREAM_KILL_MARKS.set(key, {
    ownerKey: getEntityKey(player) || player.name,
    ownerName: player.name,
    expiresAt: getTickNow() + BANSHEE_SOUL_MARK_TICKS
  });
}

function consumeSonicScreamKillMark(entity) {
  const key = getEntityKey(entity);
  if (!key) {
    return undefined;
  }
  const mark = SONIC_SCREAM_KILL_MARKS.get(key);
  SONIC_SCREAM_KILL_MARKS.delete(key);
  if (!mark || getTickNow() > mark.expiresAt) {
    return undefined;
  }
  return mark;
}

function tryActivateBansheeSoul(deadEntity) {
  const mark = consumeSonicScreamKillMark(deadEntity);
  if (!mark) {
    return false;
  }
  const owner = getPlayerByKey(mark.ownerKey) || Array.from(getOnlinePlayers()).find((player) => player.name === mark.ownerName);
  if (isPlayerValid(owner) && getScore(owner, "class_primary") === CLASS.BANSHEE) {
  }
  if (!isPlayerValid(owner) ||
    getScore(owner, "class_primary") !== CLASS.BANSHEE ||
    getScore(owner, "banshee_soul_active") <= 0 ||
    !isSkillActive(owner, "skill_banshee_soul")) {
    return false;
  }
  healEntityToFull(owner);
  runPlayerCommand(owner, "effect @s saturation 2 255 true");
  showToast(owner, "Soul", `Sonic Scream consumed ${getEntityDisplayName(deadEntity)} and restored you.`);
  spawnFx(owner, 1.4);
  return true;
}

function spawnBansheeSonicFx(player) {
  let view;
  try {
    view = normalizeVector(player.getViewDirection());
  } catch {
    view = { x: 0, y: 0, z: 1 };
  }
  const side = normalizeVector({ x: -view.z, y: 0, z: view.x });
  const up = { x: 0, y: 1, z: 0 };
  for (let step = 1; step <= BANSHEE_SONIC_RANGE; step += 1) {
    const angle = step * 1.35;
    const radius = 0.25 + step * 0.035;
    const swirlX = Math.cos(angle) * radius;
    const swirlY = Math.sin(angle) * radius;
    const x = view.x * step + side.x * swirlX + up.x * swirlY;
    const y = 1.35 + view.y * step + side.y * swirlX + up.y * swirlY;
    const z = view.z * step + side.z * swirlX + up.z * swirlY;
    runPlayerCommand(player, `execute at @s positioned ~${x.toFixed(2)} ~${y.toFixed(2)} ~${z.toFixed(2)} run particle minecraft:sonic_explosion ~ ~ ~`);
    if (step % 2 === 0) {
      runPlayerCommand(player, `execute at @s positioned ~${x.toFixed(2)} ~${y.toFixed(2)} ~${z.toFixed(2)} run particle ${getFxParticle(player)} ~ ~ ~`);
    }
  }
  runPlayerCommand(player, "playsound mob.warden.sonic_boom @a[r=24] ~ ~ ~ 0.8 1.0");
}

function useBansheeSonicScream(player) {
  spawnBansheeSonicFx(player);
  applyBansheeSonicSelfCost(player);
  const targets = getBansheeSonicTargets(player);
  let damagedTargets = 0;
  for (const target of targets) {
    const damage = BANSHEE_SONIC_DAMAGE_MIN + Math.floor(Math.random() * (BANSHEE_SONIC_DAMAGE_MAX - BANSHEE_SONIC_DAMAGE_MIN + 1));
    const previousHealth = getCurrentHealth(target);
    const indicatorContext = captureDamageIndicatorContext(target);
    markSonicScreamTarget(player, target);
    applyTrueDamage(target, damage);
    const damageApplied = !isPlayerValid(target) || getCurrentHealth(target) < previousHealth;
    if (!damageApplied) {
      SONIC_SCREAM_KILL_MARKS.delete(getEntityKey(target));
      continue;
    }
    damagedTargets += 1;
    emitVanillaHurtIndicator(target, indicatorContext, player, "minecraft:sonic_explosion");
    applyBansheeMindFracture(player, target);
  }
  if (damagedTargets > 0) {
    showToast(player, "Sonic Scream", `Hit ${damagedTargets} target(s).`);
  }
}

function toggleBansheeInvisibility(player) {
  if (player.hasTag("mwr_banshee_invisible")) {
    player.removeTag("mwr_banshee_invisible");
    runPlayerCommand(player, "effect @s invisibility 0 0 true");
    showToast(player, "Banshee Invisibility", "OFF");
  } else {
    player.addTag("mwr_banshee_invisible");
    runPlayerCommand(player, "effect @s invisibility 999999 0 true");
    showToast(player, "Banshee Invisibility", "ON");
  }
}

function getMorphShellId(morphKey) {
  return MORPH_SHELL_ITEM_IDS[morphKey] || "";
}

function getMorphShellSlotType(player) {
  return getEquippedType(player, ["Head", "head", "slot.armor.head"]);
}

function getEquippedStack(player, slotNames) {
  try {
    const equippable = player.getComponent("equippable") || player.getComponent("minecraft:equippable");
    if (!equippable || typeof equippable.getEquipment !== "function") {
      return undefined;
    }

    for (const slotName of slotNames) {
      try {
        const stack = equippable.getEquipment(slotName);
        if (stack && stack.typeId) {
          return stack;
        }
      } catch {
        // Some engine versions use different slot names.
      }
    }
  } catch {
    // Missing components are handled by callers.
  }
  return undefined;
}

function clearEquippedSlot(player, slotNames) {
  let cleared = false;
  try {
    const equippable = player.getComponent("equippable") || player.getComponent("minecraft:equippable");
    if (equippable && typeof equippable.setEquipment === "function") {
      for (const slotName of slotNames) {
        try {
          equippable.setEquipment(slotName, undefined);
          cleared = true;
          break;
        } catch {
          // Fall back to command replacement below.
        }
      }
    }
  } catch {
    // Fall back to command replacement below.
  }

  runPlayerCommand(player, "replaceitem entity @s slot.armor.head 0 minecraft:air 1");
  if (!cleared) {
    runPlayerCommand(player, "item replace entity @s slot.armor.head with minecraft:air");
  }
  return true;
}

function cloneItemStackForReturn(stack) {
  try {
    if (stack && typeof stack.clone === "function") {
      return stack.clone();
    }
  } catch {
    // Fall through to a plain stack copy.
  }
  try {
    return new ItemStack(stack.typeId, Math.max(1, Number(stack.amount) || 1));
  } catch {
    return undefined;
  }
}

function returnStackToInventoryOrDrop(player, stack) {
  if (!stack || !stack.typeId) {
    return true;
  }

  let remaining = stack;
  const container = getInventoryContainer(player);
  if (container && typeof container.addItem === "function") {
    try {
      const result = container.addItem(stack);
      remaining = result || undefined;
    } catch {
      remaining = stack;
    }
  }

  if (!remaining) {
    return true;
  }

  try {
    if (player.dimension && typeof player.dimension.spawnItem === "function") {
      player.dimension.spawnItem(remaining, player.location);
      return true;
    }
  } catch {
    // Command fallback below keeps at least the item type and amount.
  }

  try {
    const amount = Math.max(1, Number(remaining.amount) || 1);
    runPlayerCommand(player, `give @s ${remaining.typeId} ${amount}`);
    return true;
  } catch {
    return false;
  }
}

function preserveHeadSlotBeforeMorph(player, shellItemId) {
  const slotNames = ["Head", "head", "slot.armor.head"];
  const equipped = getEquippedStack(player, slotNames);
  if (!equipped || !equipped.typeId || equipped.typeId === shellItemId) {
    return true;
  }

  if (MORPH_SHELL_ITEM_SET.has(equipped.typeId)) {
    return clearEquippedSlot(player, slotNames);
  }

  const itemToReturn = cloneItemStackForReturn(equipped);
  clearEquippedSlot(player, slotNames);
  return returnStackToInventoryOrDrop(player, itemToReturn);
}

function clearMorphShell(player, force) {
  const equipped = getMorphShellSlotType(player);
  if (!MORPH_SHELL_ITEM_SET.has(equipped)) {
    return;
  }

  let clearedWithComponent = false;
  try {
    const equippable = player.getComponent("equippable") || player.getComponent("minecraft:equippable");
    if (equippable && typeof equippable.setEquipment === "function") {
      for (const slotName of ["Head", "head", "slot.armor.head"]) {
        try {
          equippable.setEquipment(slotName, undefined);
          clearedWithComponent = true;
          break;
        } catch {
          // Fall back to command replacement below.
        }
      }
    }
  } catch {
    // Fall back to command replacement below.
  }

  runPlayerCommand(player, "replaceitem entity @s slot.armor.head 0 minecraft:air 1");
  if (!clearedWithComponent) {
    runPlayerCommand(player, "item replace entity @s slot.armor.head with minecraft:air");
  }
}

function shouldMaintainBansheeInvisibility(player) {
  return isPlayerValid(player) &&
    getScore(player, "class_primary") === CLASS.BANSHEE &&
    player.hasTag &&
    player.hasTag("mwr_banshee_invisible");
}

function shouldMorphUseInvisibility(morphKey) {
  return morphKey === MORPH.BAT || morphKey === MORPH.BANSHEE || morphKey === MORPH.SHADOW_WOLF;
}

function applyMorphInvisibilityNow(player) {
  runPlayerCommand(player, "effect @s invisibility 3 0 true");
}

function setBatFlightAbility(player, enabled) {
  const tag = "mwr_bat_flight_controller";
  if (enabled) {
    if (player.addTag && (!player.hasTag || !player.hasTag(tag))) {
      player.addTag(tag);
    }
    return;
  }

  if (player.hasTag && player.hasTag(tag)) {
    player.removeTag(tag);
  }
}

function clearMorphRuntimeEffects(player, previousMorph) {
  if (previousMorph === MORPH.BAT) {
    setBatFlightAbility(player, false);
    if (getScore(player, "class_primary") !== CLASS.BANSHEE) {
      runPlayerCommand(player, "effect @s slow_falling 0 0 true");
    }
  }
  if (previousMorph === MORPH.BANSHEE) {
    runPlayerCommand(player, "effect @s levitation 0 0 true");
    if (getScore(player, "class_primary") !== CLASS.BANSHEE) {
      runPlayerCommand(player, "effect @s slow_falling 0 0 true");
    }
  }
  if (previousMorph === MORPH.SHADOW_WOLF) {
    runPlayerCommand(player, "effect @s health_boost 0 0 true");
    runPlayerCommand(player, "effect @s jump_boost 0 0 true");
    runPlayerCommand(player, "effect @s resistance 0 0 true");
    runPlayerCommand(player, "effect @s clear speed");
    runPlayerCommand(player, "effect @s strength 0 0 true");
    setScoreIfChanged(player, "morph_bonus", 0);
    setScoreIfChanged(player, "ww_bonus_hp", 0);
    applyLycanVitality(player, true);
  }
  if (!shouldMaintainBansheeInvisibility(player)) {
    runPlayerCommand(player, "effect @s invisibility 0 0 true");
  }
}

function getShadowWolfMimicOwnerTag(player) {
  const ownerKey = String(player.name || getEntityKey(player) || "player").replace(/[^A-Za-z0-9_]/g, "_");
  return `mwr_owner_${ownerKey}`;
}

function removeShadowWolfMimicEntitiesForOwner(player) {
  const ownerKey = getEntityKey(player) || player.name;
  const state = SHADOW_WOLF_MIMICS.get(ownerKey);
  if (state && state.entity) {
    removeEntity(state.entity);
  }
  SHADOW_WOLF_MIMICS.delete(ownerKey);

  const ownerTag = getShadowWolfMimicOwnerTag(player);
  for (const dimensionId of ["overworld", "nether", "the_end"]) {
    try {
      const dimension = world.getDimension(dimensionId);
      for (const entity of dimension.getEntities({ tags: ["mwr_shadow_wolf_mimic", ownerTag] })) {
        removeEntity(entity);
      }
    } catch {
      // Unloaded dimensions are checked again if the morph is recreated.
    }
  }
}

function createShadowWolfMimicEntity(player) {
  removeShadowWolfMimicEntitiesForOwner(player);
  const entity = player.dimension.spawnEntity(SHADOW_WOLF_MIMIC_ENTITY_ID, player.location);
  entity.addTag("mwr_shadow_wolf_mimic");
  entity.addTag(getShadowWolfMimicOwnerTag(player));
  const ownerKey = getEntityKey(player) || player.name;
  SHADOW_WOLF_MIMICS.set(ownerKey, {
    ownerName: player.name,
    entity
  });
  return entity;
}

function activateShadowWolfMimic(player) {
  if (!isPlayerValid(player)) {
    return false;
  }
  clearMorph(player);
  setScore(player, "morph_request", MORPH.SHADOW_WOLF);
  setScore(player, "morph_state", MORPH.SHADOW_WOLF);
  player.addTag("mwr_morphed");
  player.addTag("mwr_morph_shadow_wolf");
  applyMorphInvisibilityNow(player);
  try {
    createShadowWolfMimicEntity(player);
    return true;
  } catch {
    clearMorph(player);
    showToast(player, "Morph Failed", "The Shadow Wolf could not be summoned here.");
    return false;
  }
}

function processShadowWolfMimics() {
  for (const [ownerKey, state] of Array.from(SHADOW_WOLF_MIMICS.entries())) {
    const player = getPlayerByKey(ownerKey) || Array.from(getOnlinePlayers()).find((candidate) => candidate.name === state.ownerName);
    if (!isPlayerValid(player) || getScore(player, "morph_state") !== MORPH.SHADOW_WOLF) {
      removeEntity(state.entity);
      SHADOW_WOLF_MIMICS.delete(ownerKey);
      continue;
    }
    if (!isEntityAlive(state.entity)) {
      try {
        state.entity = createShadowWolfMimicEntity(player);
      } catch {
        SHADOW_WOLF_MIMICS.delete(ownerKey);
        continue;
      }
    }
    try {
      state.entity.teleport(player.location, {
        dimension: player.dimension,
        rotation: player.getRotation()
      });
    } catch {
      // Chunk transitions are retried on the next tick.
    }
  }

  for (const player of getOnlinePlayers()) {
    if (!isPlayerValid(player) || getScore(player, "morph_state") !== MORPH.SHADOW_WOLF) {
      continue;
    }
    const ownerKey = getEntityKey(player) || player.name;
    if (SHADOW_WOLF_MIMICS.has(ownerKey) || !isSkillUnlocked(player, "skill_shadow_wolf_morph")) {
      continue;
    }
    try {
      createShadowWolfMimicEntity(player);
    } catch {
      // A blocked spawn retries while the morph remains active.
    }
  }
}

function equipMorphShell(player, morphKey) {
  const shellItemId = getMorphShellId(morphKey);
  if (!shellItemId || !isPlayerValid(player)) {
    return false;
  }

  if (getMorphShellSlotType(player) === shellItemId) {
    return true;
  }

  if (!preserveHeadSlotBeforeMorph(player, shellItemId)) {
    return false;
  }

  try {
    const equippable = player.getComponent("equippable") || player.getComponent("minecraft:equippable");
    if (equippable && typeof equippable.setEquipment === "function") {
      const stack = new ItemStack(shellItemId, 1);
      for (const slotName of ["Head", "head", "slot.armor.head"]) {
        try {
          equippable.setEquipment(slotName, stack);
          return true;
        } catch {
          // Fall back to command replacement below.
        }
      }
    }
  } catch {
    // Fall back to command replacement below.
  }

  runPlayerCommand(player, `replaceitem entity @s slot.armor.head 0 ${shellItemId} 1`);
  return true;
}

function clearMorph(player) {
  const previousMorph = getScore(player, "morph_state");
  BAT_FLIGHT_STATES.delete(getEntityKey(player) || player.name);
  removeShadowWolfMimicEntitiesForOwner(player);
  clearMorphShell(player, previousMorph !== MORPH.NONE);
  setScore(player, "morph_request", MORPH.NONE);
  setScore(player, "morph_state", MORPH.NONE);
  setScore(player, "morph_bonus", 0);
  for (const tag of ["mwr_morphed", "mwr_morph_bat", "mwr_morph_shadow_wolf", "mwr_morph_banshee", "mwr_bat_morph_active", "mwr_bat_tiny_profile"]) {
    try {
      if (player.hasTag && player.hasTag(tag)) {
        player.removeTag(tag);
      }
    } catch {
      // Player state may be unloading during death cleanup.
    }
  }
  clearMorphRuntimeEffects(player, previousMorph);
}

function activateMorphShell(player, morphKey) {
  if (morphKey === MORPH.SHADOW_WOLF) {
    return activateShadowWolfMimic(player);
  }
  const shellItemId = getMorphShellId(morphKey);
  if (!shellItemId || !isPlayerValid(player)) {
    return false;
  }

  clearMorph(player);
  setScore(player, "morph_request", morphKey);
  setScore(player, "morph_state", morphKey);
  player.addTag("mwr_morphed");
  const morphTag = morphKey === MORPH.BAT
    ? "mwr_morph_bat"
    : morphKey === MORPH.SHADOW_WOLF
      ? "mwr_morph_shadow_wolf"
      : "mwr_morph_banshee";
  player.addTag(morphTag);

  if (shouldMorphUseInvisibility(morphKey)) {
    applyMorphInvisibilityNow(player);
  } else if (!shouldMaintainBansheeInvisibility(player)) {
    runPlayerCommand(player, "effect @s invisibility 0 0 true");
  }

  if (!equipMorphShell(player, morphKey)) {
    clearMorph(player);
    showToast(player, "Morph Failed", "The morph shell could not be equipped.");
    return false;
  }

  return true;
}

function useMorphShell(player, morphKey) {
  if (getScore(player, "morph_state") === morphKey) {
    clearMorph(player);
    showToast(player, "Morph Ended", getMorphName(morphKey));
  } else if (activateMorphShell(player, morphKey)) {
    showToast(player, "Morph Started", getMorphName(morphKey));
  }
  spawnFx(player, 1.1);
  applyMorphEffects(player);
}

function useBansheeMorph(player) {
  useMorphShell(player, MORPH.BANSHEE);
}

function useShadowWolfMorph(player) {
  useMorphShell(player, MORPH.SHADOW_WOLF);
}

function useBatMorph(player) {
  useMorphShell(player, MORPH.BAT);
}

function getVampireTroopOwnerKey(player) {
  return getEntityKey(player) || player.name || "vampire";
}

function getVampireTroopOwnerTag(player) {
  return `mwr_owner_${String(player.name || getVampireTroopOwnerKey(player)).replace(/[^A-Za-z0-9_]/g, "_")}`;
}

function isVampireTroop(entity) {
  return !!entity && entity.hasTag && entity.hasTag("mwr_vampire_troop");
}

function getVampireTroopGroupForEntity(entity) {
  if (!isVampireTroop(entity)) {
    return undefined;
  }
  const entityKey = getEntityKey(entity);
  for (const group of VAMPIRE_TROOP_GROUPS.values()) {
    if (group.troops.some((troop) => troop === entity || (entityKey && getEntityKey(troop) === entityKey))) {
      return group;
    }
  }
  return undefined;
}

function isVampireTroopOwner(group, player) {
  if (!group || !player || player.typeId !== "minecraft:player") {
    return false;
  }
  const playerKey = getEntityKey(player);
  return player.name === group.ownerName ||
    (!!playerKey && playerKey === group.ownerPlayerKey) ||
    (player.hasTag && player.hasTag(group.ownerTag));
}

function isPlayerInAnyMorph(entity) {
  if (!entity || entity.typeId !== "minecraft:player") {
    return false;
  }
  if (getScore(entity, "morph_state") !== MORPH.NONE) {
    return true;
  }
  return !!(entity.hasTag && (
    entity.hasTag("mwr_morphed") ||
    entity.hasTag("mwr_morph_bat") ||
    entity.hasTag("mwr_morph_shadow_wolf") ||
    entity.hasTag("mwr_morph_banshee") ||
    entity.hasTag("mwr_bat_morph_active")
  ));
}

function isPlayerInVampireMorph(entity) {
  return !!entity &&
    entity.typeId === "minecraft:player" &&
    getScore(entity, "class_primary") === CLASS.VAMPIRE &&
    getScore(entity, "morph_state") === MORPH.BAT &&
    isSkillUnlocked(entity, "skill_bat_morph");
}

function isVampireTroopTargetUsed(target) {
  const targetKey = getEntityKey(target);
  if (!targetKey) {
    return false;
  }
  for (const group of VAMPIRE_TROOP_GROUPS.values()) {
    if (group.target && getEntityKey(group.target) === targetKey) {
      return true;
    }
  }
  return false;
}

function setVampireTroopTargetTag(target, active) {
  if (!target || !target.addTag || !target.removeTag) {
    return;
  }
  try {
    if (active) {
      if (!target.hasTag || !target.hasTag("mwr_vampire_troop_target")) {
        target.addTag("mwr_vampire_troop_target");
      }
    } else if (!isVampireTroopTargetUsed(target) && target.hasTag && target.hasTag("mwr_vampire_troop_target")) {
      target.removeTag("mwr_vampire_troop_target");
    }
  } catch {
    // Direct target references remain authoritative.
  }
}

function isVampireTroopIgnoredTarget(target, owner) {
  return !target || !isEntityAlive(target) || target.typeId === "minecraft:player" || target === owner || isPlayerInAnyMorph(target) || isVampireTroop(target) ||
    isNecromancyMinion(target) || (target.hasTag && target.hasTag(ROAR_WOLF_TAG));
}

function setVampireTroopAiTarget(troop, target) {
  if (!isEntityAlive(troop) || !target || !isPlayerValid(target)) {
    return false;
  }
  try {
    troop.target = target;
    return true;
  } catch {
    return false;
  }
}

function assignVampireTroopTarget(owner, target) {
  if (!owner || owner.typeId !== "minecraft:player" || isVampireTroopIgnoredTarget(target, owner)) {
    return 0;
  }
  const group = VAMPIRE_TROOP_GROUPS.get(getVampireTroopOwnerKey(owner));
  if (!group) {
    return 0;
  }
  const previousTarget = group.target;
  group.target = undefined;
  setVampireTroopTargetTag(previousTarget, false);
  group.target = target;
  group.targetKey = getEntityKey(target);
  setVampireTroopTargetTag(target, true);
  let assigned = 0;
  for (const troop of group.troops) {
    if (setVampireTroopAiTarget(troop, target)) {
      assigned += 1;
    }
  }
  return assigned;
}

function retargetVampireTroopsFromOwnerHit(player, target) {
  assignVampireTroopTarget(player, target);
}

function cleanupVampireTroopGroup(ownerKey) {
  const group = VAMPIRE_TROOP_GROUPS.get(ownerKey);
  if (!group) {
    return;
  }
  const previousTarget = group.target;
  group.target = undefined;
  setVampireTroopTargetTag(previousTarget, false);
  for (const troop of group.troops) {
    removeEntity(troop);
  }
  VAMPIRE_TROOP_GROUPS.delete(ownerKey);
  cleanupVampireTroopEntitiesByOwnerTag(group.ownerTag);
}

function cleanupVampireTroopEntitiesByOwnerTag(ownerTag) {
  if (!ownerTag) {
    return;
  }
  for (const dimensionId of ["overworld", "nether", "the_end"]) {
    let dimension;
    try {
      dimension = world.getDimension(dimensionId);
    } catch {
      dimension = undefined;
    }
    if (!dimension) {
      continue;
    }
    try {
      for (const entity of dimension.getEntities({ tags: ["mwr_vampire_troop", ownerTag] })) {
        removeEntity(entity);
      }
    } catch {
      // Loaded-entity cleanup is best-effort after the registry is cleared.
    }
  }
}

function cleanupVampireTroopsForOwner(player) {
  const ownerKey = getVampireTroopOwnerKey(player);
  const ownerTag = getVampireTroopOwnerTag(player);
  cleanupVampireTroopGroup(ownerKey);
  for (const [groupKey, group] of Array.from(VAMPIRE_TROOP_GROUPS.entries())) {
    if (group.ownerName === player.name || group.ownerPlayerKey === ownerKey || group.ownerTag === ownerTag) {
      cleanupVampireTroopGroup(groupKey);
    }
  }
  cleanupVampireTroopEntitiesByOwnerTag(ownerTag);
}

function moveVampireTroopTowardOwner(troop, owner) {
  if (!isEntityAlive(troop) || !isPlayerValid(owner)) {
    return;
  }
  const distanceToOwner = distanceSquared(troop.location, owner.location);
  if (distanceToOwner <= 16) {
    return;
  }
  const differentDimension = String(troop.dimension && troop.dimension.id || "") !== String(owner.dimension && owner.dimension.id || "");
  if (differentDimension) {
    try {
      troop.teleport({
        x: owner.location.x + Math.random() * 2 - 1,
        y: owner.location.y,
        z: owner.location.z + Math.random() * 2 - 1
      }, { dimension: owner.dimension });
    } catch {
      // Cross-dimension follow retries on the next upkeep tick.
    }
    return;
  }
  if (distanceToOwner > 900) {
    teleportEntity(troop, {
      x: owner.location.x + Math.random() * 2 - 1,
      y: owner.location.y,
      z: owner.location.z + Math.random() * 2 - 1
    });
    return;
  }
  const direction = normalizeVector({
    x: owner.location.x - troop.location.x,
    y: 0,
    z: owner.location.z - troop.location.z
  });
  applyEntityImpulse(troop, {
    x: direction.x * VAMPIRE_TROOP_FOLLOW_IMPULSE,
    y: 0,
    z: direction.z * VAMPIRE_TROOP_FOLLOW_IMPULSE
  });
}

function spawnVampireTroopFangCircle(troop, target, owner, critical) {
  if (!isEntityAlive(troop) || !isPlayerValid(target)) {
    return false;
  }
  const center = {
    x: target.location.x,
    y: target.location.y,
    z: target.location.z
  };
  const indicatorContext = captureDamageIndicatorContext(target);
  let spawned = 0;
  for (let index = 0; index < VAMPIRE_TROOP_FANG_COUNT; index += 1) {
    const angle = (Math.PI * 2 * index) / VAMPIRE_TROOP_FANG_COUNT;
    const location = {
      x: center.x + Math.cos(angle) * VAMPIRE_TROOP_FANG_RADIUS,
      y: center.y,
      z: center.z + Math.sin(angle) * VAMPIRE_TROOP_FANG_RADIUS
    };
    try {
      const fang = target.dimension.spawnEntity("minecraft:evocation_fang", location);
      if (fang && fang.addTag) {
        fang.addTag(VAMPIRE_TROOP_FANG_FX_TAG);
      }
      system.runTimeout(() => removeEntity(fang), 24);
      spawned += 1;
    } catch {
      // The scripted damage still lands if a runtime cannot spawn vanilla fangs.
    }
    spawnParticleSafe(target.dimension, getFxParticle(owner), {
      x: location.x,
      y: location.y + 0.25,
      z: location.z
    });
  }
  emitSkillDamageIndicator(indicatorContext, owner, "mob.evocation_fangs.attack",
    critical ? "minecraft:large_explosion" : getFxParticle(owner));
  return spawned > 0;
}

function driveVampireTroopGroundMagicAttack(troop, target, owner, group, troopKey, now) {
  if (!isEntityAlive(troop) || !isPlayerValid(target) || isVampireTroopIgnoredTarget(target, owner)) {
    return;
  }
  setVampireTroopAiTarget(troop, target);
  const direction = normalizeVector({
    x: target.location.x - troop.location.x,
    y: 0,
    z: target.location.z - troop.location.z
  });
  applyEntityImpulse(troop, {
    x: direction.x * VAMPIRE_TROOP_PURSUIT_IMPULSE,
    y: 0,
    z: direction.z * VAMPIRE_TROOP_PURSUIT_IMPULSE
  });
  const targetDistanceSq = distanceSquared(troop.location, target.location);
  const lastDashTick = group.lastDashTicks[troopKey] || 0;
  if (now - lastDashTick >= VAMPIRE_TROOP_DASH_INTERVAL_TICKS &&
    targetDistanceSq >= VAMPIRE_TROOP_DASH_MIN_RANGE_SQ &&
    targetDistanceSq <= VAMPIRE_TROOP_DASH_MAX_RANGE_SQ) {
    group.lastDashTicks[troopKey] = now;
    applyEntityImpulse(troop, {
      x: direction.x * VAMPIRE_TROOP_DASH_IMPULSE,
      y: 0.04,
      z: direction.z * VAMPIRE_TROOP_DASH_IMPULSE
    });
    spawnParticleSafe(troop.dimension, getFxParticle(owner), {
      x: troop.location.x,
      y: troop.location.y + 0.9,
      z: troop.location.z
    });
  }
  spawnParticleSafe(troop.dimension, getFxParticle(owner), {
    x: troop.location.x,
    y: troop.location.y + 0.8,
    z: troop.location.z
  });

  const magicDistanceSq = distanceSquared(troop.location, target.location);
  if (magicDistanceSq < VAMPIRE_TROOP_MAGIC_MIN_RANGE_SQ ||
    magicDistanceSq > VAMPIRE_TROOP_MAGIC_MAX_RANGE_SQ) {
    return;
  }

  const critical = Math.random() < VAMPIRE_TROOP_MAGIC_CRIT_CHANCE;
  const magicDamage = critical ? VAMPIRE_TROOP_MAGIC_DAMAGE_CRITICAL : VAMPIRE_TROOP_MAGIC_DAMAGE_BASE;
  spawnVampireTroopFangCircle(troop, target, owner, critical);
  applySummonMagicDamage(troop, target, magicDamage);
}

function summonVampireTroopPlaceholders(player) {
  const ownerKey = getVampireTroopOwnerKey(player);
  const ownerTag = getVampireTroopOwnerTag(player);
  if (!spendVampirePlasma(player, VAMPIRE_TROOP_SUMMON_PLASMA_COST)) {
    return;
  }
  const offsets = [
    { x: 1.5, z: 1.5 },
    { x: -1.5, z: 1.5 },
    { x: 0, z: -1.8 }
  ];
  let group = VAMPIRE_TROOP_GROUPS.get(ownerKey);
  if (!group) {
    group = {
      ownerName: player.name,
      ownerPlayerKey: getEntityKey(player) || player.name,
      ownerTag,
      troops: [],
      target: undefined,
      targetKey: "",
      expiresAt: Number.MAX_SAFE_INTEGER,
      lastDashTicks: {}
    };
  } else {
    group.troops = group.troops.filter((troop) => isEntityAlive(troop));
    group.lastDashTicks = group.lastDashTicks || {};
  }
  const spawnIndex = group.troops.length % offsets.length;
  const offset = offsets[spawnIndex];
  let troop;
  try {
    const troopType = VAMPIRE_TROOP_ENTITY_IDS[spawnIndex % VAMPIRE_TROOP_ENTITY_IDS.length] || VAMPIRE_TROOP_ENTITY_ID;
    troop = player.dimension.spawnEntity(troopType, {
      x: player.location.x + offset.x,
      y: player.location.y,
      z: player.location.z + offset.z
    });
    troop.addTag("mwr_vampire_troop_summon");
    troop.addTag("mwr_vampire_troop");
    troop.addTag(ownerTag);
    troop.nameTag = "Vampire Troop";
  } catch {
    addPlasma(player, VAMPIRE_TROOP_SUMMON_PLASMA_COST);
    showToast(player, "Vampire Troops", "The troop could not be summoned here.");
    return;
  }
  group.troops.push(troop);
  while (group.troops.length > VAMPIRE_TROOP_MAX_ACTIVE) {
    const oldestTroop = group.troops.shift();
    const oldestKey = getEntityKey(oldestTroop);
    if (oldestKey) {
      delete group.lastDashTicks[oldestKey];
    }
    removeEntity(oldestTroop);
  }
  if (group.target && isPlayerValid(group.target) && !isVampireTroopIgnoredTarget(group.target, player)) {
    setVampireTroopAiTarget(troop, group.target);
  }
  VAMPIRE_TROOP_GROUPS.set(ownerKey, group);
  spawnFxBurst(player, 2.6, 12);
  showToast(player, "Vampire Troops", `${group.troops.length}/${VAMPIRE_TROOP_MAX_ACTIVE} active. Hit a mob to mark their target.`);
}

function processVampireTroopGroups() {
  const now = getTickNow();
  for (const [ownerKey, group] of Array.from(VAMPIRE_TROOP_GROUPS.entries())) {
    const owner = getPlayerByKey(ownerKey) || Array.from(getOnlinePlayers()).find((player) => player.name === group.ownerName);
    if (!isPlayerValid(owner)) {
      cleanupVampireTroopGroup(ownerKey);
      continue;
    }
    if (group.target && isVampireTroopIgnoredTarget(group.target, owner)) {
      const previousTarget = group.target;
      group.target = undefined;
      group.targetKey = "";
      setVampireTroopTargetTag(previousTarget, false);
    }
    const liveTroops = [];
    for (const troop of group.troops) {
      if (!isEntityAlive(troop)) {
        continue;
      }
      liveTroops.push(troop);
      if (group.target) {
        const troopKey = getEntityKey(troop) || `${ownerKey}_${liveTroops.length}`;
        driveVampireTroopGroundMagicAttack(troop, group.target, owner, group, troopKey, now);
      } else {
        moveVampireTroopTowardOwner(troop, owner);
      }
    }
    group.troops = liveTroops;
    if (group.troops.length === 0) {
      const previousTarget = group.target;
      group.target = undefined;
      VAMPIRE_TROOP_GROUPS.delete(ownerKey);
      setVampireTroopTargetTag(previousTarget, false);
    }
  }
}

function applyMorphEffects(player) {
  const morph = getScore(player, "morph_state");

  if (morph !== MORPH.NONE) {
    if ((morph === MORPH.BAT && !isSkillUnlocked(player, "skill_bat_morph")) ||
      (morph === MORPH.SHADOW_WOLF && !isSkillUnlocked(player, "skill_shadow_wolf_morph")) ||
      (morph === MORPH.BANSHEE && !isSkillUnlocked(player, "skill_banshee_morph"))) {
      clearMorph(player);
      runPlayerCommand(player, "effect @s invisibility 0 0 true");
      return;
    }
    if (shouldMorphUseInvisibility(morph)) {
      applyMorphInvisibilityNow(player);
    } else if (!shouldMaintainBansheeInvisibility(player)) {
      runPlayerCommand(player, "effect @s invisibility 0 0 true");
    }
    equipMorphShell(player, morph);
  }

  if (morph === MORPH.BAT) {
    setBatFlightAbility(player, true);
    runPlayerCommand(player, "effect @s slow_falling 0 0 true");
    setScore(player, "morph_bonus", 0);
    return;
  }

  if (morph === MORPH.SHADOW_WOLF && isSkillUnlocked(player, "skill_shadow_wolf_morph")) {
    const firstMorphEffectPass = getScore(player, "morph_bonus") <= 0;
    runPlayerCommand(player, `effect @s health_boost 999999 ${SHADOW_WOLF_HEALTH_BOOST_AMPLIFIER} true`);
    if (firstMorphEffectPass) {
      system.runTimeout(() => {
        if (isPlayerValid(player) && getScore(player, "morph_state") === MORPH.SHADOW_WOLF) {
          runPlayerCommand(player, "effect @s instant_health 1 2 true");
        }
      }, 1);
    }
    applyLongEffect(player, "strength", 1);
    applyLongEffect(player, "jump_boost", 1);
    applyLongEffect(player, "resistance", 0);
    applyLongEffect(player, "speed", 1);
    setScore(player, "morph_bonus", 1);
    setScoreIfChanged(player, "ww_bonus_hp", SHADOW_WOLF_BONUS_HEARTS);
    return;
  }

  if (morph === MORPH.BANSHEE) {
    applyLongEffect(player, "slow_falling", 0);
    setScore(player, "morph_bonus", 0);
    return;
  }

  if (getScore(player, "morph_bonus") > 0) {
    setScore(player, "morph_bonus", 0);
    applyLycanVitality(player);
  }
  if (!shouldMaintainBansheeInvisibility(player)) {
    runPlayerCommand(player, "effect @s invisibility 0 0 true");
  }
  if (getScore(player, "class_primary") !== CLASS.VAMPIRE) {
    runPlayerCommand(player, "effect @s jump_boost 0 0 true");
  }
  runPlayerCommand(player, "effect @s resistance 0 0 true");
  if (getScore(player, "class_primary") !== CLASS.BANSHEE) {
    runPlayerCommand(player, "effect @s slow_falling 0 0 true");
  }
  runPlayerCommand(player, "effect @s strength 0 0 true");
}

function applyLycanVitality(player, refillHealth = false) {
  const classId = getScore(player, "class_primary");
  const morph = getScore(player, "morph_state");
  if (classId !== CLASS.WEREWOLF) {
    runPlayerCommand(player, "effect @s health_boost 0 0 true");
    setScoreIfChanged(player, "ww_bonus_hp", 0);
    return;
  }
  if (morph === MORPH.SHADOW_WOLF) {
    setScoreIfChanged(player, "ww_bonus_hp", 0);
    return;
  }

  const tier = getActiveSkillLevel(player, "lycan_vitality", 5);
  const nightHearts = isWerewolfNightActive(player) ? WEREWOLF_NIGHT_HEARTS : 0;
  const totalBonusHearts = tier + nightHearts;
  const previousBonusHearts = getScore(player, "ww_bonus_hp");
  if (totalBonusHearts <= 0) {
    runPlayerCommand(player, "effect @s health_boost 0 0 true");
    setScoreIfChanged(player, "ww_bonus_hp", 0);
    return;
  }

  runPlayerCommand(player, `effect @s health_boost 999999 ${totalBonusHearts - 1} true`);
  if (refillHealth || totalBonusHearts > previousBonusHearts) {
    runPlayerCommand(player, `effect @s instant_health 1 ${Math.max(0, totalBonusHearts - 1)} true`);
    fillHealthAfterMaxHealthChange(player);
  }
  setScoreIfChanged(player, "ww_bonus_hp", totalBonusHearts);
}

function restoreLycanVitalityAfterRespawn(player) {
  if (!isPlayerValid(player) ||
    getScore(player, "class_primary") !== CLASS.WEREWOLF ||
    getScore(player, "morph_state") === MORPH.SHADOW_WOLF ||
    getActiveSkillLevel(player, "lycan_vitality", 5) <= 0) {
    return;
  }

  applyLycanVitality(player, true);
  fillHealthAfterMaxHealthChange(player);
}

function processVampire(player) {
  if (getScore(player, "plasma_max") <= 0) {
    setScore(player, "plasma_max", 100);
  }

  if (getScore(player, "morph_state") === MORPH.BAT && isSkillUnlocked(player, "skill_bat_morph")) {
    spawnFx(player, 0.4);
  }

  if (isVampirePlasmaDrainBlocked(player)) {
    setScoreIfChanged(player, "plasma_drain", 0);
  } else {
    const timer = getScore(player, "plasma_drain") + 1;
    if (timer >= 10) {
      setScore(player, "plasma_drain", 0);
      addPlasma(player, -1);
    } else {
      setScore(player, "plasma_drain", timer);
    }
  }

  if (getScore(player, "plasma") <= 0) {
    applyTrueDamage(player, 1);
    showToast(player, "Plasma Empty", "Starvation damage.");
  }

  if (!hasVampireSunImmunity(player) && isDaylightTime() && isSkyExposed(player)) {
    try {
      if (typeof player.setOnFire === "function") {
        player.setOnFire(4, true);
      } else {
        applyTrueDamage(player, 1);
      }
    } catch {
      applyTrueDamage(player, 1);
    }
    showToast(player, "Sun Curse", "Find shade.");
  } else {
    try {
      if (typeof player.extinguishFire === "function") {
        player.extinguishFire(true);
      }
    } catch {
      // Extinguish support is version-dependent.
    }
  }
}

function processWerewolf(player) {
  runPlayerCommand(player, "effect @s[hasitem={item=minecraft:iron_helmet,location=slot.armor.head}] weakness 3 0 true");
  runPlayerCommand(player, "effect @s[hasitem={item=minecraft:iron_chestplate,location=slot.armor.chest}] weakness 3 0 true");
  runPlayerCommand(player, "effect @s[hasitem={item=minecraft:iron_leggings,location=slot.armor.legs}] weakness 3 0 true");
  runPlayerCommand(player, "effect @s[hasitem={item=minecraft:iron_boots,location=slot.armor.feet}] weakness 3 0 true");

  const shadowWolfActive = getScore(player, "morph_state") === MORPH.SHADOW_WOLF &&
    isSkillUnlocked(player, "skill_shadow_wolf_morph");
  if (isPlayerInWater(player) && !shadowWolfActive) {
    runPlayerCommand(player, "effect @s weakness 3 0 true");
    runPlayerCommand(player, "effect @s slowness 3 0 true");
    setScore(player, "water_exit", 5);
  } else {
    const waterExit = getScore(player, "water_exit");
    if (waterExit > 0) {
      runPlayerCommand(player, "effect @s weakness 2 0 true");
      runPlayerCommand(player, "effect @s slowness 2 0 true");
      setScore(player, "water_exit", waterExit - 1);
    }
  }

  applyLycanVitality(player);
}

function processBanshee(player) {
  applyLongEffect(player, "slow_falling", 0);
  if (getScore(player, "morph_state") === MORPH.BANSHEE && isSkillUnlocked(player, "skill_banshee_morph")) {
    applyMorphEffects(player);
    processBansheeMorphLevitation(player);
  }

  if (isPlayerInWater(player)) {
    runPlayerCommand(player, "effect @s poison 3 0 true");
  }

  if (player.hasTag("mwr_banshee_invisible")) {
    applyLongEffect(player, "invisibility", 0);
  }
}

function processHuman(player) {
  if (getScore(player, "morph_state") !== MORPH.NONE) {
    clearMorph(player);
    applyMorphEffects(player);
  }
}

function processBansheeMorphLevitation(player) {
  if (getScore(player, "morph_state") !== MORPH.BANSHEE ||
    !isSkillUnlocked(player, "skill_banshee_morph")) {
    runPlayerCommand(player, "effect @s levitation 0 0 true");
    return;
  }
  if (isPlayerJumping(player)) {
    runPlayerCommand(player, "effect @s levitation 1 0 true");
  } else {
    runPlayerCommand(player, "effect @s levitation 0 0 true");
  }
}

function getYawBasedHorizontalDirections(player, fallbackForward) {
  let forward = normalizeVector({ x: fallbackForward.x, y: 0, z: fallbackForward.z });
  try {
    if (typeof player.getRotation === "function") {
      const rotation = player.getRotation();
      const yaw = Number(rotation && rotation.y);
      if (Number.isFinite(yaw)) {
        const radians = yaw * Math.PI / 180;
        const yawForward = normalizeVector({
          x: -Math.sin(radians),
          y: 0,
          z: Math.cos(radians)
        });
        const alignment = yawForward.x * forward.x + yawForward.z * forward.z;
        forward = alignment < -0.2
          ? { x: -yawForward.x, y: 0, z: -yawForward.z }
          : yawForward;
      }
    }
  } catch {
    // The current view vector already gives a safe forward fallback.
  }

  if (forward.x === 0 && forward.z === 0) {
    forward = { x: 0, y: 0, z: 1 };
  }

  return {
    forward,
    right: normalizeVector({ x: forward.z, y: 0, z: -forward.x })
  };
}

function getBatMovementIntent(player, fallbackForward) {
  const directions = getYawBasedHorizontalDirections(player, fallbackForward);
  const movement = getPlayerMovementVector(player);
  const rawForward = Math.abs(movement.y) > 0.05 ? Math.max(-1, Math.min(1, movement.y)) : 0;
  const rawStrafe = Math.abs(movement.x) > 0.05 ? Math.max(-1, Math.min(1, movement.x)) : 0;
  const movementMagnitude = Math.min(1, Math.sqrt(rawForward * rawForward + rawStrafe * rawStrafe));
  const sprinting = isPlayerSprinting(player);

  return {
    forward: directions.forward,
    right: directions.right,
    forwardInput: movementMagnitude > 0.05 ? rawForward : (sprinting ? 1 : 0),
    strafeInput: rawStrafe,
    movementMagnitude,
    sprinting
  };
}

function processBatFlight(player) {
  const playerKey = getEntityKey(player) || player.name;
  if (getScore(player, "class_primary") !== CLASS.VAMPIRE ||
    getScore(player, "morph_state") !== MORPH.BAT ||
    !isSkillUnlocked(player, "skill_bat_morph")) {
    BAT_FLIGHT_STATES.delete(playerKey);
    if (player.hasTag && player.hasTag("mwr_bat_morph_active")) {
      player.removeTag("mwr_bat_morph_active");
    }
    if (player.hasTag && player.hasTag("mwr_bat_tiny_profile")) {
      player.removeTag("mwr_bat_tiny_profile");
    }
    setBatFlightAbility(player, false);
    runPlayerCommand(player, "effect @s slow_falling 0 0 true");
    return;
  }

  if (!player.hasTag || !player.hasTag("mwr_bat_morph_active")) {
    player.addTag("mwr_bat_morph_active");
  }
  if (!player.hasTag || !player.hasTag("mwr_bat_tiny_profile")) {
    player.addTag("mwr_bat_tiny_profile");
  }
  setBatFlightAbility(player, true);

  const now = getTickNow();
  const previous = BAT_FLIGHT_STATES.get(playerKey);
  if (!previous) {
    BAT_FLIGHT_STATES.set(playerKey, { nextUpdateAt: now + BAT_FLIGHT_INITIAL_BUFFER_TICKS });
    return;
  }
  if (now < previous.nextUpdateAt) {
    return;
  }
  previous.nextUpdateAt = now + BAT_FLIGHT_UPDATE_INTERVAL_TICKS;

  let view = { x: 0, y: 0, z: 1 };
  try {
    view = normalizeVector(player.getViewDirection());
  } catch {
    // Default forward control is enough if view direction is unavailable.
  }
  const horizontalView = normalizeVector({ x: view.x, y: 0, z: view.z });
  const movementIntent = getBatMovementIntent(player, horizontalView);
  const forwardView = movementIntent.forward;
  const rightView = movementIntent.right;
  let velocity = { x: 0, y: 0, z: 0 };
  try {
    velocity = typeof player.getVelocity === "function" ? player.getVelocity() : velocity;
  } catch {
    // Velocity is optional on older runtimes; the controller still applies a stable impulse.
  }

  const forwardInput = movementIntent.forwardInput;
  const strafeInput = movementIntent.strafeInput;
  const sprinting = movementIntent.sprinting;
  const hasMovementInput = movementIntent.movementMagnitude > 0.05 || sprinting;
  const jumping = isPlayerJumping(player);
  const sneaking = isPlayerSneakingHeld(player);

  let targetVertical = BAT_FLIGHT_HOVER_SPEED;
  if (jumping) {
    targetVertical = BAT_FLIGHT_ASCEND_SPEED;
  } else if (sneaking) {
    targetVertical = BAT_FLIGHT_DESCEND_SPEED;
  } else if (velocity.y < -0.08) {
    targetVertical = BAT_FLIGHT_HOVER_SPEED * 1.8;
  }

  const desiredForwardSpeed = hasMovementInput
    ? BAT_FLIGHT_FORWARD_SPEED * (sprinting ? 1.18 : 1)
    : 0;
  const desiredStrafeSpeed = BAT_FLIGHT_FORWARD_SPEED * 0.45 * strafeInput;
  const targetHorizontal = hasMovementInput
    ? {
      x: forwardView.x * desiredForwardSpeed * forwardInput + rightView.x * desiredStrafeSpeed,
      z: forwardView.z * desiredForwardSpeed * forwardInput + rightView.z * desiredStrafeSpeed
    }
    : {
      x: velocity.x * BAT_FLIGHT_IDLE_DAMPING,
      z: velocity.z * BAT_FLIGHT_IDLE_DAMPING
    };
  const smoothed = {
    x: velocity.x + (targetHorizontal.x - velocity.x) * BAT_FLIGHT_SMOOTHING,
    y: velocity.y + (targetVertical - velocity.y) * BAT_FLIGHT_SMOOTHING,
    z: velocity.z + (targetHorizontal.z - velocity.z) * BAT_FLIGHT_SMOOTHING
  };
  const horizontalImpulseX = Math.max(-BAT_FLIGHT_MAX_HORIZONTAL_STEP,
    Math.min(BAT_FLIGHT_MAX_HORIZONTAL_STEP, smoothed.x - velocity.x));
  const horizontalImpulseZ = Math.max(-BAT_FLIGHT_MAX_HORIZONTAL_STEP,
    Math.min(BAT_FLIGHT_MAX_HORIZONTAL_STEP, smoothed.z - velocity.z));
  const verticalImpulse = Math.max(-BAT_FLIGHT_MAX_VERTICAL_STEP,
    Math.min(BAT_FLIGHT_MAX_VERTICAL_STEP, smoothed.y - velocity.y));

  applyEntityImpulse(player, {
    x: horizontalImpulseX,
    y: verticalImpulse,
    z: horizontalImpulseZ
  });
}

function processPhase3Passives(player) {
  syncXpAvailable(player);

  if (getScore(player, "subclass_primary") === SUBCLASS.TANK) {
    applyLongEffect(player, "resistance", 1);
  }

  const regenDelay = getScore(player, "hp_regen_delay");
  if (regenDelay > 0) {
    setScore(player, "hp_regen_delay", regenDelay - 1);
  }
  maintainPassiveBuffs(player);
}

function processBuffTick(player) {
  if (getTickNow() % PASSIVE_STATE_UPDATE_INTERVAL_TICKS === 0) {
    runTickSafely("refreshRebuiltSkillFlags", () => refreshRebuiltSkillFlags(player));
    runTickSafely("applyRebuiltMovementStats", () => applyRebuiltMovementStats(player));
    runTickSafely("processMidnightStrengthEffect", () => processMidnightStrengthEffect(player));
    runTickSafely("processAdrenalineEffect", () => processAdrenalineEffect(player));
  }
  runTickSafely("processParkourist", () => processParkourist(player));
  runTickSafely("processRebuiltMultiJump", () => processRebuiltMultiJump(player));
  runTickSafely("processFallDamageSystems", () => processFallDamageSystems(player));
  runTickSafely("processWerewolfClimb", () => processWerewolfClimb(player));
}

function processSecond(player) {
  const classId = getScore(player, "class_primary");
  runTickSafely("processVampireArmorEffects", () => processVampireArmorEffects(player, system.currentTick));
  runTickSafely("decrementCooldowns", () => decrementCooldowns(player));
  runTickSafely("processSecondLifeCooldown", () => processSecondLifeCooldown(player));
  runTickSafely("applyMorphEffects", () => applyMorphEffects(player));
  runTickSafely("processPhase3Passives", () => processPhase3Passives(player));

  switch (classId) {
    case CLASS.VAMPIRE:
      runTickSafely("processVampire", () => processVampire(player));
      runTickSafely("showPlasmaHud", () => showPlasmaHud(player));
      break;
    case CLASS.WEREWOLF:
      runTickSafely("processWerewolf", () => processWerewolf(player));
      break;
    case CLASS.BANSHEE:
      runTickSafely("processBanshee", () => processBanshee(player));
      break;
    case CLASS.HUMAN:
      runTickSafely("processHuman", () => processHuman(player));
      break;
    default:
      break;
  }
}

function processFast(player) {
  runTickSafely("processBuffTick", () => processBuffTick(player));
  runTickSafely("processSecondLifeVoidRescue", () => processSecondLifeVoidRescue(player));
  runTickSafely("processSecondLifeInvulnerability", () => processSecondLifeInvulnerability(player));
  const classId = getScore(player, "class_primary");
  const isBat = classId === CLASS.VAMPIRE &&
    getScore(player, "morph_state") === MORPH.BAT &&
    isSkillUnlocked(player, "skill_bat_morph");

  if (isBat || (player.hasTag && player.hasTag("mwr_bat_morph_active"))) {
    if (isBat) {
      applyMorphInvisibilityNow(player);
    }
    runTickSafely("processBatFlight", () => processBatFlight(player));
  }
  if (getScore(player, "morph_state") !== MORPH.NONE) {
    if (getTickNow() % MORPH_HOSTILE_SUPPRESSION_INTERVAL_TICKS === 0) {
      runTickSafely("processMorphHostileIgnore", () => processMorphHostileIgnore(player));
    }
  }
  if (classId === CLASS.BANSHEE) {
    runTickSafely("phaseBansheeForward", () => phaseBansheeForward(player));
    if (getScore(player, "morph_state") === MORPH.BANSHEE && isSkillUnlocked(player, "skill_banshee_morph")) {
      runTickSafely("bansheeMorphLevitation", () => processBansheeMorphLevitation(player));
    }
  } else if (player.hasTag && (player.hasTag(BANSHEE_PHASE_TAG) || player.hasTag("mwr_banshee_phase_noclip"))) {
    runTickSafely("clearBansheePhase", () => {
      clearLegacyBansheePhaseTags(player);
      setBansheePhaseState(player, false);
    });
  }
  if (classId === CLASS.WEREWOLF || (player.hasTag && player.hasTag(SCENT_USER_TAG))) {
    runTickSafely("processScent", () => processScent(player));
  }
}

function getCooldownReadyLabel(objective) {
  const labels = {
    cd_morph: "Morph",
    cd_warrior_switch_throw: "Switch Throw",
    cd_warrior_tenacity_charge: "Tenacity Charge",
    cd_ninja_dagger_throw: "Dagger Throw",
    cd_ninja_strikethrough: "Strikethrough",
    cd_ninja_smoke_bomb: "Smoke Bomb",
    cd_witch_necromancy: "Necromancy",
    cd_archer_chain_lightning: "Chain Lightning",
    cd_tank_slam: "Shield Slam",
    cd_tank_fortify: "Fortify",
    cd_tank_taunt: "Taunt",
    cd_weapon_witch_staff: "Staff of Destruction",
    cd_spell: "Spell",
    cd_spell_fire: "Fire Spell Bottle",
    cd_spell_ice: "Ice Spell Bottle",
    cd_spell_poison: "Poison Spell Bottle"
  };
  return labels[objective] || objective.replace(/^cd_/, "").replace(/_/g, " ");
}

function decrementCooldowns(player) {
  for (let slot = 1; slot <= 5; slot += 1) {
    const objective = `cd_ability_${slot}`;
    const current = getScore(player, objective);
    if (current <= 0) {
      continue;
    }

    const next = current - 1;
    setScore(player, objective, next);
    if (next === 0) {
      showToast(player, "Ready", `A${slot}`);
      spawnFx(player, 0.8);
    }
  }

  const classCooldown = getScore(player, "cd_class");
  if (classCooldown > 0) {
    setScore(player, "cd_class", classCooldown - 1);
  }

  for (const objective of INDEPENDENT_COOLDOWNS) {
    const current = getScore(player, objective);
    if (current <= 0) {
      continue;
    }
    const next = current - 1;
    setScore(player, objective, next);
    if (next === 0) {
      showToast(player, "Ready", getCooldownReadyLabel(objective));
      spawnFx(player, 0.8);
    }
  }
}

function isIronWeapon(itemId) {
  return itemId === "minecraft:iron_sword" ||
    itemId === "minecraft:iron_axe" ||
    itemId === "minecraft:iron_pickaxe" ||
    itemId === "minecraft:iron_shovel" ||
    itemId === "minecraft:iron_hoe";
}

function isPassiveMob(entity) {
  return !!entity && PASSIVE_MOB_TYPES.has(entity.typeId);
}

function isHostileMob(entity) {
  if (!entity || entity.typeId === "minecraft:player") {
    return false;
  }
  if (entity.hasTag && (entity.hasTag(ROAR_WOLF_TAG) ||
    entity.hasTag("mwr_necromancy_minion") ||
    entity.hasTag("mwr_spell_fx_entity"))) {
    return false;
  }
  const typeId = String(entity.typeId || "");
  if (HOSTILE_MOB_TYPES.has(typeId)) {
    return true;
  }
  return [
    "blaze",
    "bogged",
    "breeze",
    "creeper",
    "drowned",
    "enderman",
    "evoker",
    "ghast",
    "guardian",
    "hoglin",
    "husk",
    "magma_cube",
    "phantom",
    "piglin",
    "pillager",
    "ravager",
    "shulker",
    "silverfish",
    "skeleton",
    "slime",
    "spider",
    "stray",
    "vex",
    "vindicator",
    "warden",
    "witch",
    "wither",
    "zoglin",
    "zombie"
  ].some((fragment) => typeId.indexOf(fragment) !== -1);
}

function getTauntTagForPlayer(player) {
  return `mwr_taunted_${String(player.name || "player").replace(/[^A-Za-z0-9_]/g, "_")}`;
}

function getScentIgnoreTagForPlayer(player) {
  return `${SCENT_IGNORE_TAG_PREFIX}${getRoarSafeKey(player.name || getEntityKey(player) || "player")}`;
}

function setScentUserTag(player, active) {
  try {
    if (active && player.addTag && player.hasTag && !player.hasTag(SCENT_USER_TAG)) {
      player.addTag(SCENT_USER_TAG);
    } else if (!active && player.hasTag && player.hasTag(SCENT_USER_TAG)) {
      player.removeTag(SCENT_USER_TAG);
    }
  } catch {
    // Tags are advisory; scoreboards still drive the skill.
  }
}

function clearScentSuppressionTagsForPlayer(player) {
  const playerTag = getScentIgnoreTagForPlayer(player);
  try {
    const nearby = player.dimension.getEntities({ location: player.location, maxDistance: SCENT_RADIUS });
    for (const entity of nearby) {
      if (!entity || !entity.removeTag || !entity.hasTag) {
        continue;
      }
      if (entity.hasTag(playerTag)) {
        entity.removeTag(playerTag);
      }
      if (entity.hasTag("ignore_scent_user")) {
        entity.removeTag("ignore_scent_user");
      }
      if (entity.hasTag("mwr_scent_ignored_hostile")) {
        entity.removeTag("mwr_scent_ignored_hostile");
      }
    }
  } catch {
    // Suppression tags are advisory; the scoreboard gate stops all active effects.
  }
}

function isWerewolfScentActive(player) {
  return isPlayerValid(player) &&
    getScore(player, "class_primary") === CLASS.WEREWOLF &&
    isSkillUnlocked(player, "skill_werewolf_scent") &&
    getScore(player, SCENT_TOGGLE_OBJECTIVE) > 0;
}

function shouldScentSuppressHostile(player, attacker) {
  return isWerewolfScentActive(player) && isHostileMob(attacker);
}

function clearHostileTargetIfScented(hostile, player) {
  if (!shouldScentSuppressHostile(player, hostile)) {
    return;
  }
  try {
    if (hostile.addTag) {
      hostile.addTag(getScentIgnoreTagForPlayer(player));
      hostile.addTag("ignore_scent_user");
      hostile.addTag("mwr_scent_ignored_hostile");
    }
  } catch {
    // Ignore tags are advisory for diagnostics and future behavior files.
  }
  try {
    const currentTarget = hostile.target;
    if (currentTarget && (currentTarget === player || getEntityKey(currentTarget) === getEntityKey(player))) {
      hostile.target = undefined;
    }
  } catch {
    try {
      hostile.target = undefined;
    } catch {
      // Some entities do not expose target assignment.
    }
  }
  try {
    hostile.target = undefined;
  } catch {
    // A second unconditional clear helps runtimes where target reads fail but writes work.
  }
  try {
    if (typeof hostile.triggerEvent === "function") {
      hostile.triggerEvent("minecraft:calmed_down");
      hostile.triggerEvent("minecraft:stop_aggro");
      hostile.triggerEvent("minecraft:on_calm");
    }
  } catch {
    // Anger events are mob-specific.
  }
  tryRunEntityCommand(hostile, "event entity @s minecraft:calmed_down");
  tryRunEntityCommand(hostile, "event entity @s minecraft:stop_aggro");
  tryRunEntityCommand(hostile, "event entity @s minecraft:on_calm");
  tryRunEntityCommand(hostile, "effect @s weakness 2 255 true");
}

function hardSuppressScentHostile(hostile, player) {
  if (!shouldScentSuppressHostile(player, hostile)) {
    return;
  }
  clearHostileTargetIfScented(hostile, player);
  tryRunEntityCommand(hostile, "effect @s weakness 1 255 true");
  tryRunEntityCommand(hostile, "effect @s slowness 1 255 true");
  if (distanceSquared(hostile.location, player.location) <= SCENT_PHYSICAL_BARRIER_RADIUS_SQ) {
    let away = normalizeVector({
      x: hostile.location.x - player.location.x,
      y: 0,
      z: hostile.location.z - player.location.z
    });
    if (Math.abs(away.x) + Math.abs(away.z) < 0.01) {
      const view = getHorizontalViewDirection(player);
      away = { x: -view.x, y: 0, z: -view.z };
    }
    applyEntityImpulse(hostile, {
      x: away.x * SCENT_PHYSICAL_BARRIER_IMPULSE,
      y: 0.08,
      z: away.z * SCENT_PHYSICAL_BARRIER_IMPULSE
    });
  }
}

function enforceScentContactBarrier(player) {
  try {
    const nearby = player.dimension.getEntities({ location: player.location, maxDistance: 7 });
    for (const entity of nearby) {
      if (isHostileMob(entity)) {
        hardSuppressScentHostile(entity, player);
        continue;
      }
      if (isHostileProjectileType(entity.typeId) &&
        !isCustomProjectileEntity(entity) &&
        distanceSquared(entity.location, player.location) <= SCENT_PROJECTILE_CONTACT_RADIUS_SQ) {
        removeEntity(entity);
      }
    }
  } catch {
    // beforeEvents.entityHurt remains the final barrier if a scan surface is unavailable.
  }
}

function clearHostileTargetAgainstPlayer(entity, player, markerTag) {
  if (!isHostileMob(entity)) {
    return;
  }
  try {
    if (entity.addTag && markerTag) {
      entity.addTag(markerTag);
    }
    const currentTarget = entity.target;
    if (!currentTarget || currentTarget === player || getEntityKey(currentTarget) === getEntityKey(player)) {
      entity.target = undefined;
    }
  } catch {
    try {
      entity.target = undefined;
    } catch {
      // Some mobs do not expose writable target state.
    }
  }
  try {
    if (typeof entity.triggerEvent === "function") {
      entity.triggerEvent("minecraft:calmed_down");
      entity.triggerEvent("minecraft:stop_aggro");
    }
  } catch {
    // Calm events are mob-specific.
  }
  tryRunEntityCommand(entity, "event entity @s minecraft:calmed_down");
  tryRunEntityCommand(entity, "event entity @s minecraft:stop_aggro");
  tryRunEntityCommand(entity, "event entity @s minecraft:on_calm");
  tryRunEntityCommand(entity, "effect @s weakness 1 255 true");
}

function suppressHostilesIgnoringPlayer(player, radius, markerTag) {
  try {
    const nearby = player.dimension.getEntities({ location: player.location, maxDistance: radius });
    for (const entity of nearby) {
      if (isHostileMob(entity)) {
        clearHostileTargetAgainstPlayer(entity, player, markerTag);
        continue;
      }
      if (isHostileProjectileType(entity.typeId) && !isCustomProjectileEntity(entity)) {
        removeEntity(entity);
      }
    }
  } catch {
    // The before-hurt tiny-profile guard remains authoritative if scans fail.
  }
}

function shouldMorphSuppressHostileDamage(player, source) {
  if (!isPlayerInAnyMorph(player)) {
    return false;
  }
  const attacker = source && source.damagingEntity;
  if (isHostileMob(attacker)) {
    return true;
  }
  const cause = String(source && source.cause || "");
  return cause.indexOf("projectile") !== -1 ||
    cause.indexOf("entityAttack") !== -1 ||
    cause.indexOf("entity_attack") !== -1 ||
    cause.indexOf("contact") !== -1;
}

function processMorphHostileIgnore(player) {
  if (!isPlayerValid(player) || !isPlayerInAnyMorph(player)) {
    return;
  }
  suppressHostilesIgnoringPlayer(player, MORPH_HOSTILE_SUPPRESSION_RADIUS, "mwr_morph_ignored_hostile");
}

function isHostileProjectileType(typeId) {
  const id = String(typeId || "");
  return id.indexOf("arrow") !== -1 ||
    id.indexOf("fireball") !== -1 ||
    id.indexOf("wither_skull") !== -1 ||
    id.indexOf("skull") !== -1 ||
    id.indexOf("llama_spit") !== -1 ||
    id.indexOf("shulker_bullet") !== -1 ||
    id.indexOf("evocation_fang") !== -1 ||
    id.indexOf("evoker_fangs") !== -1 ||
    id.indexOf("trident") !== -1 ||
    id.indexOf("projectile") !== -1;
}

function getDamageProjectileEntity(source) {
  return source && (source.damagingProjectile ||
    source.projectile ||
    source.projectileEntity ||
    source.damagingEntity);
}

function shouldScentSuppressDamage(player, source) {
  if (!isWerewolfScentActive(player)) {
    return false;
  }
  const attacker = source && source.damagingEntity;
  if (attacker && attacker.typeId === "minecraft:player") {
    return false;
  }
  if (shouldScentSuppressHostile(player, attacker)) {
    return true;
  }
  const projectile = getDamageProjectileEntity(source);
  if (!projectile) {
    return false;
  }
  if (attacker && isHostileMob(attacker)) {
    return true;
  }
  return isHostileProjectileType(projectile.typeId);
}

function processScent(player) {
  const playerKey = getEntityKey(player) || player.name;
  const now = getTickNow();
  const scanState = SCENT_SCAN_STATES.get(playerKey) || { active: false, nextScan: 0 };
  if (!isWerewolfScentActive(player)) {
    setScoreIfChanged(player, "werewolf_scent_active", 0);
    if (scanState.active || (player.hasTag && player.hasTag(SCENT_USER_TAG))) {
      setScentUserTag(player, false);
      clearScentSuppressionTagsForPlayer(player);
    }
    SCENT_SCAN_STATES.set(playerKey, { active: false, nextScan: now + SCENT_SCAN_INTERVAL_TICKS });
    return;
  }
  setScoreIfChanged(player, "werewolf_scent_active", 1);
  setScentUserTag(player, true);
  if (scanState.active && now < scanState.nextScan) {
    return;
  }
  SCENT_SCAN_STATES.set(playerKey, { active: true, nextScan: now + SCENT_SCAN_INTERVAL_TICKS });
  enforceScentContactBarrier(player);
  try {
    const nearby = player.dimension.getEntities({ location: player.location, maxDistance: SCENT_RADIUS });
    for (const entity of nearby) {
      if (isHostileMob(entity)) {
        hardSuppressScentHostile(entity, player);
        continue;
      }
      if (isHostileProjectileType(entity.typeId) &&
        !isCustomProjectileEntity(entity) &&
        distanceSquared(entity.location, player.location) <= SCENT_PROJECTILE_CONTACT_RADIUS_SQ) {
        removeEntity(entity);
      }
    }
  } catch {
    // Scent damage cancellation still protects the player if target clearing is unavailable.
  }
}

function isValidVampireFangTarget(target) {
  if (!target) {
    return false;
  }
  if (target.typeId === "minecraft:player") {
    return getScore(target, "class_primary") !== CLASS.WEREWOLF;
  }
  return target.typeId.indexOf("item") === -1 &&
    target.typeId.indexOf("xp_orb") === -1 &&
    target.typeId.indexOf("arrow") === -1;
}

function isMeleeDamageEvent(event) {
  const cause = String((event.damageSource && event.damageSource.cause) || "");
  if (!cause) {
    return true;
  }
  return cause.indexOf("entityAttack") !== -1 || cause.indexOf("entity_attack") !== -1;
}

function getMidnightStrengthDamageKey(attacker, target) {
  return `${getEntityKey(attacker) || attacker.name}:${getEntityKey(target) || target.id || target.typeId}`;
}

function getMeleeDamageMultiplier(attacker, event) {
  if (!attacker || attacker.typeId !== "minecraft:player" || !isMeleeDamageEvent(event)) {
    return 1;
  }

  let multiplier = 1;
  if (isMidnightStrengthActiveNow(attacker)) {
    setScoreIfChanged(attacker, "midnight_strength_active", 1);
    multiplier *= 2;
  }
  if (isAdrenalineActiveNow(attacker)) {
    setScoreIfChanged(attacker, "adrenaline_active", 1);
    multiplier *= 2;
  }
  if (isWerewolfNightActive(attacker)) {
    multiplier *= WEREWOLF_NIGHT_DAMAGE_MULTIPLIER;
  }
  return multiplier;
}

function markMidnightStrengthDamage(attacker, target) {
  MIDNIGHT_STRENGTH_DAMAGE_MARKS.set(getMidnightStrengthDamageKey(attacker, target), getTickNow());
}

function consumeMidnightStrengthDamageMark(attacker, target) {
  const key = getMidnightStrengthDamageKey(attacker, target);
  const markedTick = MIDNIGHT_STRENGTH_DAMAGE_MARKS.get(key);
  if (typeof markedTick !== "number") {
    return false;
  }

  MIDNIGHT_STRENGTH_DAMAGE_MARKS.delete(key);
  return getTickNow() - markedTick <= 2;
}

function tryApplyMidnightStrengthBeforeDamage(event, attacker, target) {
  const multiplier = getMeleeDamageMultiplier(attacker, event);
  if (!target || multiplier <= 1) {
    return false;
  }

  const baseDamage = Math.max(1, Math.ceil(Number(event.damage) || 0));
  try {
    event.damage = Math.max(1, Math.ceil(baseDamage * multiplier));
    markMidnightStrengthDamage(attacker, target);
    return true;
  } catch {
    return false;
  }
}

function applyWerewolfFangPoison(target, seconds) {
  const durationTicks = Math.max(1, Math.floor(seconds * 20));
  try {
    if (typeof target.addEffect === "function") {
      target.addEffect("poison", durationTicks, {
        amplifier: 0,
        showParticles: true
      });
      return true;
    }
  } catch {
    try {
      if (typeof target.addEffect === "function") {
        target.addEffect("minecraft:poison", durationTicks, {
          amplifier: 0,
          showParticles: true
        });
        return true;
      }
    } catch {
      // Fall back to command targeting below.
    }
  }

  try {
    runCommandCompat(target, `effect @s poison ${seconds} 0 false`).catch(() => {});
    return true;
  } catch {
    return false;
  }
}

function spawnNecroDragonBreathFx(target) {
  if (!isPlayerValid(target)) {
    return;
  }
  for (const yOffset of [0.25, 0.85, 1.45]) {
    spawnParticleSafe(target.dimension, "minecraft:dragon_breath_lingering", {
      x: target.location.x,
      y: target.location.y + yOffset,
      z: target.location.z
    });
  }
}

function spawnNecroDragonBreathDamagePulse(context) {
  if (!context || !context.dimension || !context.location) {
    return;
  }
  const radius = 0.85;
  for (let index = 0; index < 8; index += 1) {
    const angle = (Math.PI * 2 * index) / 8;
    spawnParticleSafe(context.dimension, "minecraft:dragon_breath_lingering", {
      x: context.location.x + Math.cos(angle) * radius,
      y: context.location.y + 0.45 + (index % 2) * 0.35,
      z: context.location.z + Math.sin(angle) * radius
    });
  }
}

function applyNecroSwordDragonBreath(attacker, target) {
  if (!isPlayerValid(target)) {
    return false;
  }
  const targetKey = getEntityKey(target);
  if (!targetKey) {
    return false;
  }
  const now = getTickNow();
  const existing = NECRO_DRAGON_BREATH_DOTS.get(targetKey);
  NECRO_DRAGON_BREATH_DOTS.set(targetKey, {
    target,
    attacker,
    expiresAt: now + NECRO_DRAGON_BREATH_DURATION_TICKS,
    nextDamageAt: existing ? existing.nextDamageAt : now + NECRO_DRAGON_BREATH_DAMAGE_INTERVAL_TICKS,
    nextFxAt: now + NECRO_DRAGON_BREATH_FX_INTERVAL_TICKS
  });
  spawnNecroDragonBreathFx(target);
  return true;
}

function processNecroDragonBreathDots() {
  const now = getTickNow();
  for (const [targetKey, state] of Array.from(NECRO_DRAGON_BREATH_DOTS.entries())) {
    const target = state && state.target;
    if (!state || !isPlayerValid(target)) {
      NECRO_DRAGON_BREATH_DOTS.delete(targetKey);
      continue;
    }
    if (now >= state.nextFxAt && now <= state.expiresAt) {
      spawnNecroDragonBreathFx(target);
      state.nextFxAt = now + NECRO_DRAGON_BREATH_FX_INTERVAL_TICKS;
    }
    if (now >= state.nextDamageAt && now <= state.expiresAt) {
      const previousHealth = getCurrentHealth(target);
      const indicatorContext = captureDamageIndicatorContext(target);
      applyTrueDamage(target, NECRO_DRAGON_BREATH_DAMAGE);
      const damageApplied = !isPlayerValid(target) || getCurrentHealth(target) < previousHealth;
      if (damageApplied) {
        spawnNecroDragonBreathDamagePulse(indicatorContext);
        emitSkillDamageIndicator(indicatorContext, state.attacker, "mob.enderdragon.hit",
          "minecraft:dragon_breath_lingering");
      }
      state.nextDamageAt += NECRO_DRAGON_BREATH_DAMAGE_INTERVAL_TICKS;
    }
    if (now >= state.expiresAt || !isPlayerValid(target)) {
      NECRO_DRAGON_BREATH_DOTS.delete(targetKey);
    }
  }
}

function handlePlayerAttack(attacker, target, event) {
  if (!attacker || attacker.typeId !== "minecraft:player" || !target || target === attacker) {
    return;
  }

  const held = getHeldItemType(attacker);
  const baseDamage = Math.max(1, Math.ceil(event.damage || 6));

  if (CUSTOM_SWORD_ITEM_IDS.has(held) && typeof attacker.playAnimation === "function") {
    try {
      attacker.playAnimation("animation.player.attack.rotations", { blendOutTime: 0.1 });
    } catch {
      // The normal player arm swing remains the fallback on unsupported clients.
    }
  }

  if (!consumeMidnightStrengthDamageMark(attacker, target)) {
    const multiplier = getMeleeDamageMultiplier(attacker, event);
    if (multiplier > 1) {
      applyTrueDamage(target, Math.max(1, Math.ceil(baseDamage * (multiplier - 1))));
    }
  }

  if (held === ABILITIES.vampireBite.itemId && getScore(attacker, "class_primary") === CLASS.VAMPIRE) {
    if (!isValidVampireFangTarget(target)) {
      return;
    }
    try {
      runCommandCompat(target, "effect @s wither 5 0 true").catch(() => {});
    } catch {
      runPlayerCommand(attacker, "execute at @s run effect @e[r=4,c=1,type=!minecraft:player] wither 5 0 true");
    }
    const bloodThirstUnlocked = isSkillUnlocked(attacker, "skill_blood_thirst");
    addPlasma(attacker, bloodThirstUnlocked ? 20 : 12);
    if (bloodThirstUnlocked) {
      const lifeSteal = Math.max(BLOOD_THIRST_MIN_HEAL, Math.ceil(baseDamage * BLOOD_THIRST_LIFESTEAL_RATIO));
      healPlayerByAmount(attacker, lifeSteal);
      runPlayerCommand(attacker, "effect @s absorption 3 0 true");
    }
    showToast(attacker, "Vampire Fangs", "Wither applied. Plasma restored.");
    spawnFx(attacker, 0.8);
  }

  if (held === ABILITIES.wolfBite.itemId && getScore(attacker, "class_primary") === CLASS.WEREWOLF) {
    const poisonSeconds = getScore(target, "class_primary") === CLASS.VAMPIRE ? 10 : 3;
    if (baseDamage < WEREWOLF_FANG_DAMAGE) {
      applyTrueDamage(target, WEREWOLF_FANG_DAMAGE - baseDamage);
    }
    system.run(() => {
      if (isPlayerValid(target)) {
        applyWerewolfFangPoison(target, poisonSeconds);
      }
    });
    showToast(attacker, "Werewolf Fangs", poisonSeconds > 3 ? "Vampire poisoned for 10 seconds." : "Target poisoned for 3 seconds.");
    spawnFx(attacker, 0.8);
  }

  if (held === NECRO_SWORD_ITEM_ID) {
    system.run(() => {
      if (isPlayerValid(target)) {
        applyNecroSwordDragonBreath(attacker, target);
      }
    });
  }

  if (getScore(attacker, "tenacity_strike") > 0) {
    applyTrueDamage(target, baseDamage);
    setScore(attacker, "tenacity_strike", 0);
    showToast(attacker, "Tenacity Strike", "Double damage released.");
    spawnFx(attacker, 1.0);
  }

  if (getScore(attacker, "subclass_primary") === SUBCLASS.WARRIOR && isSkillActive(attacker, "skill_third_hit_double")) {
    const next = getScore(attacker, "warrior_third_hit") + 1;
    if (next >= 3) {
      setScore(attacker, "warrior_third_hit", 0);
      applyTrueDamage(target, baseDamage);
      showToast(attacker, "Critical Hit", "Third hit doubled.");
      spawnFx(attacker, 1.0);
    } else {
      setScore(attacker, "warrior_third_hit", next);
    }
  }

  applyBansheeMindFracture(attacker, target);

  if (held === WEAPON_IDS.witchStaff && isWitch(attacker) && isSkillActive(attacker, "skill_staff_mastery")) {
    applyTrueDamage(target, Math.max(1, Math.ceil(baseDamage * 0.2)));
    spawnFx(attacker, 1.0);
  }
}

function handleEntityHurt(event) {
  const hurtEntity = event.hurtEntity;
  const source = event.damageSource || {};
  const attacker = source.damagingEntity;

  if (attacker && attacker.typeId === "minecraft:player") {
    handlePlayerAttack(attacker, hurtEntity, event);
    retargetRoarWolvesFromOwnerHit(attacker, hurtEntity);
    retargetNecromancyFromOwnerHit(attacker, hurtEntity);
    retargetVampireTroopsFromOwnerHit(attacker, hurtEntity);
  }

  if (!hurtEntity || hurtEntity.typeId !== "minecraft:player") {
    return;
  }

  const hurtPlayer = hurtEntity;
  const classId = getScore(hurtPlayer, "class_primary");
  const cause = String(source.cause || "");

  retargetRoarWolvesFromOwnerHurt(hurtPlayer, attacker);
  setScore(hurtPlayer, "hp_regen_delay", 5);

  if (classId === CLASS.WEREWOLF) {
    const attacker = source.damagingEntity;
    if (attacker && attacker.typeId === "minecraft:player" && isIronWeapon(getHeldItemType(attacker))) {
      applyTrueDamage(hurtPlayer, 3);
      showToast(hurtPlayer, "Iron Weakness", "Iron weapons cut deeper.");
    }
  }

  if (classId === CLASS.BANSHEE && (cause.indexOf("fire") !== -1 || cause.indexOf("lava") !== -1)) {
    applyTrueDamage(hurtPlayer, 2);
    showToast(hurtPlayer, "Fire Weakness", "Fire burns banshees harder.");
  }
}

function getLuckLevel(player) {
  return getActiveSkillLevel(player, "skill_public_luck", 3);
}

function getEntityLootTablePath(entity) {
  const typeId = String(entity && entity.typeId || "");
  if (!typeId ||
    typeId.indexOf("item") !== -1 ||
    typeId.indexOf("xp_orb") !== -1 ||
    typeId.indexOf("projectile") !== -1 ||
    typeId.indexOf("arrow") !== -1) {
    return "";
  }
  const parts = typeId.split(":");
  const entityName = parts.length > 1 ? parts[1] : parts[0];
  return entityName ? `entities/${entityName}` : "";
}

function runDimensionCommand(dimension, command) {
  try {
    const result = runCommandCompat(dimension, command);
    if (result && typeof result.catch === "function") {
      result.catch(() => {});
    }
    return true;
  } catch {
    return false;
  }
}

function tryDropLuckBonusLoot(player, deadEntity) {
  const level = getLuckLevel(player);
  const chance = LUCK_CHANCES[level] || 0;
  if (chance <= 0 || Math.random() >= chance) {
    return;
  }

  const lootTable = getEntityLootTablePath(deadEntity);
  if (!lootTable) {
    return;
  }

  const location = deadEntity.location || player.location;
  const dimension = deadEntity.dimension || player.dimension;
  const x = location.x.toFixed(2);
  const y = location.y.toFixed(2);
  const z = location.z.toFixed(2);
  if (runDimensionCommand(dimension, `loot spawn ${x} ${y} ${z} loot ${lootTable}`)) {
    showToast(player, "Luck", `Bonus loot triggered (${Math.round(chance * 100)}%).`);
    spawnFx(player, 0.8);
  }
}

function handleEntityDie(event) {
  const dead = event.deadEntity || event.entity;
  const source = event.damageSource || {};
  const attacker = source.damagingEntity;
  const compelOwner = dead ? consumeCompelKillOwner(dead) : undefined;
  const switchThrowKill = consumeSwitchThrowKillMark(dead);

  if (compelOwner) {
    addPlasma(compelOwner, 1);
  }

  if (switchThrowKill) {
    sendWorldMessage(`${getEntityDisplayName(dead)} was slain by ${switchThrowKill.ownerName}'s boomerang`);
  }

  if (dead) {
    tryActivateBansheeSoul(dead);
  }

  if (dead && dead.typeId === "minecraft:player") {
    const deadKey = getEntityKey(dead) || dead.name;
    ADRENALINE_EFFECT_STATES.delete(deadKey);
    setScore(dead, "adrenaline_active", 0);
    const sonicSelfDeath = BANSHEE_SONIC_SELF_DEATHS.get(deadKey);
    BANSHEE_SONIC_SELF_DEATHS.delete(deadKey);
    if (sonicSelfDeath && getTickNow() <= sonicSelfDeath.expiresAt) {
      sendWorldMessage(`${dead.name} was consumed by the souls.`);
    }
    clearSecondLifeRuntimeState(dead, false);
    clearActiveAbilityRuntimeForPlayer(dead);
    clearLegacyBansheePhaseTags(dead);
    setBansheePhaseState(dead, false);
    clearMorph(dead);
    cleanupNecromancyRebirthState(dead);
    cleanupVampireTroopsForOwner(dead);
    setScore(dead, "plasma_max", 100);
    setScore(dead, "plasma", 100);
    setScore(dead, "plasma_drain", 0);
    setMultiJumpFallDamageSuppression(dead, false);
    return;
  }

  if (!attacker || attacker.typeId !== "minecraft:player" || !dead || dead.typeId === "minecraft:player") {
    return;
  }

  tryDropLuckBonusLoot(attacker, dead);

  if (!compelOwner && getScore(attacker, "class_primary") === CLASS.VAMPIRE) {
    addPlasma(attacker, 10);
    showToast(attacker, "Feeding", "Plasma restored from prey.");
    spawnFx(attacker, 1.0);
  }
}

function handleNecromancyProjectileHitEntity(event) {
  const source = event.source;
  if (!isNecromancyMinion(source)) {
    return false;
  }

  const entry = getActiveNecromancyGroupEntry(source);
  const group = entry && entry.group;
  const owner = group
    ? getPlayerByKey(entry.ownerKey) || Array.from(getOnlinePlayers()).find((player) => player.name === group.ownerName)
    : undefined;
  const target = getProjectileEventTarget(event);

  if (!group || !target || isNecromancyOwner(group, target) || isNecromancyOwnerMorph(group, target) ||
    isNecromancyIgnoredTarget(target, owner) || getEntityKey(target) !== group.targetKey) {
    return true;
  }
  return true;
}

function handleProjectileHitEntity(event) {
  if (handleNecromancyProjectileHitEntity(event)) {
    return;
  }

  const player = event.source;
  if (!player || player.typeId !== "minecraft:player") {
    return;
  }

  if (getScore(player, "subclass_primary") !== SUBCLASS.ARCHER) {
    return;
  }

  let target;
  try {
    target = getProjectileEventTarget(event);
  } catch {
    target = undefined;
  }

  if (!target) {
    return;
  }

  spawnFx(player, 1.0);

  tryApplyCritFocus(player, target);
  applyLevitateArrow(player, target);
  applyExplosiveArrow(player, target);

  if (getArcherSkillLevel(player, "skill_chain_lightning", 3) > 0 && canUseArcherChainLightning(player)) {
    const arcs = chainLightning(player, target);
    if (arcs > 0) {
      setArcherChainLightningCooldown(player);
      showToast(player, "Chain Lightning", `Arc hit ${arcs} target${arcs === 1 ? "" : "s"}.`);
    }
  }
}

function handleBeforeHurt(event) {
  const hurtEntity = event.hurtEntity;
  const source = event.damageSource || {};
  const attacker = source.damagingEntity;
  const fangFxSource = source.damagingEntity || source.damagingProjectile || source.projectile;

  if (fangFxSource && fangFxSource.hasTag && fangFxSource.hasTag(VAMPIRE_TROOP_FANG_FX_TAG)) {
    event.cancel = true;
    return;
  }

  if (hurtEntity && hurtEntity.typeId === "minecraft:player") {
    const playerKey = getEntityKey(hurtEntity);
    const guardExpiresAt = playerKey ? (ARCHER_EXPLOSIVE_SELF_GUARDS.get(playerKey) || 0) : 0;
    const damageCause = String(source.cause || "").toLowerCase();
    const isExplosionDamage = damageCause === "entityexplosion" ||
      damageCause === "blockexplosion" || damageCause.indexOf("explosion") !== -1;
    if (guardExpiresAt >= getTickNow() && isExplosionDamage &&
      getScore(hurtEntity, "subclass_primary") === SUBCLASS.ARCHER &&
      isSkillUnlocked(hurtEntity, "skill_explosive_arrows") &&
      skillBelongsToCurrentBuild(hurtEntity, "skill_explosive_arrows")) {
      event.cancel = true;
      return;
    }
  }

  if (hurtEntity && hurtEntity.typeId === "minecraft:player") {
    if (isSecondLifeInvulnerable(hurtEntity)) {
      event.cancel = true;
      return;
    }
  }

  if (hurtEntity && hurtEntity.typeId === "minecraft:player" && shouldMorphSuppressHostileDamage(hurtEntity, source)) {
    event.cancel = true;
    clearHostileTargetAgainstPlayer(attacker, hurtEntity, "mwr_morph_ignored_hostile");
    return;
  }

  if ((attacker && attacker.hasTag && attacker.hasTag("mwr_spell_fx_entity")) ||
    (hurtEntity && hurtEntity.hasTag && hurtEntity.hasTag("mwr_spell_fx_entity"))) {
    event.cancel = true;
    return;
  }

  if (hurtEntity && hurtEntity.typeId === "minecraft:player" && shouldScentSuppressDamage(hurtEntity, source)) {
    event.cancel = true;
    clearHostileTargetIfScented(attacker, hurtEntity);
    system.run(() => {
      if (isPlayerValid(hurtEntity)) {
        setScoreIfChanged(hurtEntity, "werewolf_scent_active", 1);
      }
    });
    return;
  }

  const necromancyDamageEntry = getNecromancyDamageGroupEntry(source);
  if (necromancyDamageEntry) {
    const group = necromancyDamageEntry.group;
    const targetKey = group ? group.targetKey : "";
    const hurtKey = getEntityKey(hurtEntity);
    if (!group ||
      !hurtEntity ||
      !targetKey ||
      isNecromancyOwner(group, hurtEntity) ||
      isNecromancyOwnerMorph(group, hurtEntity) ||
      isNecromancyMinion(hurtEntity) ||
      hurtKey !== targetKey) {
      event.cancel = true;
      return;
    }
  }

  if (hurtEntity && hurtEntity.hasTag && hurtEntity.hasTag("mwr_necromancy_minion")) {
    event.cancel = true;
    return;
  }

  if (hurtEntity && hurtEntity.typeId === "minecraft:player" && attacker && attacker.hasTag && attacker.hasTag(ROAR_WOLF_TAG)) {
    const roarEntry = getActiveRoarWolfEntry(attacker);
    if (isPlayerInAnyMorph(hurtEntity) ||
      (roarEntry && (getEntityKey(hurtEntity) === roarEntry.ownerPlayerKey || hurtEntity.name === roarEntry.ownerName))) {
      event.cancel = true;
      return;
    }
  }

  if (hurtEntity && attacker && isVampireTroop(attacker)) {
    const troopGroup = getVampireTroopGroupForEntity(attacker);
    const targetKey = troopGroup ? troopGroup.targetKey : "";
    if (!troopGroup || !targetKey || getEntityKey(hurtEntity) !== targetKey ||
      isVampireTroopOwner(troopGroup, hurtEntity) || isPlayerInAnyMorph(hurtEntity)) {
      event.cancel = true;
      try {
        attacker.target = undefined;
      } catch {
        // Ground-magic upkeep will restore only a valid enemy target.
      }
      return;
    }
  }

  if (hurtEntity && hurtEntity.hasTag && hurtEntity.hasTag(ROAR_WOLF_TAG)) {
    const roarEntry = getActiveRoarWolfEntry(hurtEntity);
    const spawnProtected = roarEntry &&
      getTickNow() - (roarEntry.spawnTick || 0) <= WEREWOLF_ROAR_SPAWN_PROTECTION_TICKS;
    const hasSpawnProtectionTag = hurtEntity.hasTag("mwr_roar_spawn_protected");
    const attackerIsRoarWolf = attacker && attacker.hasTag && attacker.hasTag(ROAR_WOLF_TAG);
    const attackerIsOwner = attacker && roarEntry &&
      (getEntityKey(attacker) === roarEntry.ownerPlayerKey || attacker.name === roarEntry.ownerName);
    const attackerCanDamageRoarWolf = attacker &&
      attacker.typeId !== "minecraft:item" &&
      attacker.typeId !== "minecraft:xp_orb" &&
      !attackerIsRoarWolf;
    if (spawnProtected || hasSpawnProtectionTag || attackerIsOwner || !attackerCanDamageRoarWolf) {
      event.cancel = true;
      return;
    }
  }
  tryApplyMidnightStrengthBeforeDamage(event, attacker, hurtEntity);

  if (attacker && attacker.typeId === "minecraft:player" &&
    getScore(attacker, "class_primary") === CLASS.VAMPIRE &&
    getHeldItemType(attacker) === ABILITIES.vampireBite.itemId &&
    !isValidVampireFangTarget(hurtEntity)) {
    event.cancel = true;
    system.run(() => showToast(attacker, "Vampire Fangs", "This target cannot be fed on."));
    return;
  }

  if (!hurtEntity || hurtEntity.typeId !== "minecraft:player") {
    return;
  }


  const morph = getScore(hurtEntity, "morph_state");
  const cause = String((event.damageSource && event.damageSource.cause) || "");
  const batMorphActive = morph === MORPH.BAT && isSkillUnlocked(hurtEntity, "skill_bat_morph");
  const bansheeMorphActive = morph === MORPH.BANSHEE && isSkillUnlocked(hurtEntity, "skill_banshee_morph");
  if (bansheeMorphActive) {
    event.cancel = true;
    return;
  }

  if (batMorphActive) {
    const mobAttacker = attacker && attacker.typeId !== "minecraft:player";
    const playerAttacker = attacker && attacker.typeId === "minecraft:player";
    const tinyProfileCause = cause.indexOf("projectile") !== -1 ||
      cause.indexOf("suffocation") !== -1 ||
      cause.indexOf("contact") !== -1 ||
      (!playerAttacker && (cause.indexOf("entityAttack") !== -1 || cause.indexOf("entity_attack") !== -1));
    if (mobAttacker || tinyProfileCause) {
      event.cancel = true;
      system.run(() => {
        if (isPlayerValid(hurtEntity)) {
          showToast(hurtEntity, "Bat Morph", "Tiny profile avoided the hit.");
          spawnFx(hurtEntity, 0.4);
        }
      });
      return;
    }
  }

  if (shouldSecondLifeDenyDamage(hurtEntity, event.damage, cause)) {
    event.cancel = true;
  }

}

function showMainMenu(player) {
  syncXpAvailable(player);
  reconcileUnlockedAbilityItems(player);
  const locked = !hasChosenBuild(player);
  const form = new ActionFormData()
    .title("RPG Classes and Subclasses")
    .body(`${getBuildSummary(player)}\n\n${RPG_TAGLINE}`)
    .button("Select Class", ICON_BOOK)
    .button("Choose FX Color", ICON_BOOK)
    .button("Skill Tree", ICON_BOOK)
    .button("Abilities", ICON_BOOK)
    .button("Settings", ICON_BOOK)
    .button("Help", ICON_BOOK);

  showForm(player, form, (selection) => {
    switch (selection) {
      case 0:
        showClassMenu(player);
        break;
      case 1:
        showFxColorMenu(player);
        break;
      case 2:
        if (locked) {
          showLockedMenu(player, "Skill Tree");
        } else {
          showSkillTreeMenu(player);
        }
        break;
      case 3:
        if (locked) {
          showLockedMenu(player, "Abilities");
        } else {
          showAbilitiesMenu(player);
        }
        break;
      case 4:
        showSettingsMenu(player);
        break;
      case 5:
        showHelpMenu(player);
        break;
      default:
        break;
    }
  });
}

function showLockedMenu(player, featureName) {
  const form = new ActionFormData()
    .title(`${featureName} Locked`)
    .body(`${featureName} unlocks after you choose both a primary class and a subclass.`)
    .button("Select Class", ICON_BOOK)
    .button("Back", ICON_BOOK);

  showForm(player, form, (selection) => {
    if (selection === 0) {
      showClassMenu(player);
    } else {
      showMainMenu(player);
    }
  });
}

function showClassMenu(player) {
  const currentClass = getScore(player, "class_primary");
  if (currentClass > 0) {
    const form = new ActionFormData()
      .title("Primary Class Locked")
      .body(`Your primary class is already set to ${getNameById(CLASSES, currentClass)}.\n\nUse a craftable Rebirth Potion to reset class, subclass, and skill unlocks.`)
      .button("Back", ICON_BOOK);

    showForm(player, form, () => showMainMenu(player));
    return;
  }

  const form = new ActionFormData()
    .title("Select Class")
    .body("Choose your primary RPG class. The subclass menu opens immediately after this selection.");

  for (const classEntry of CLASSES) {
    form.button(classEntry.name, ICON_BOOK);
  }

  showForm(player, form, (selection) => {
    const chosen = CLASSES[selection];
    if (!chosen) {
      return;
    }

    setScore(player, "class_request", chosen.id);
    showToast(player, "Class Request", `${chosen.name} selected. Choose a subclass.`);
    system.runTimeout(() => showSubclassMenu(player), 2);
  });
}

function showSubclassMenu(player) {
  const currentSubclass = getScore(player, "subclass_primary");
  if (currentSubclass > 0) {
    const form = new ActionFormData()
      .title("Subclass Locked")
      .body(`Your subclass is already set to ${getNameById(SUBCLASSES, currentSubclass)}.\n\nUse a craftable Rebirth Potion to reset class, subclass, and skill unlocks.`)
      .button("Back", ICON_BOOK);

    showForm(player, form, () => showMainMenu(player));
    return;
  }

  const requestedClass = getScore(player, "class_request");
  if (requestedClass <= 0) {
    showClassMenu(player);
    return;
  }

  const form = new ActionFormData()
    .title("Select Subclass")
    .body(`Primary class request: ${getNameById(CLASSES, requestedClass)}\n\n${RPG_TAGLINE}`);

  for (const subclassEntry of SUBCLASSES) {
    form.button(subclassEntry.name, ICON_BOOK);
  }

  showForm(player, form, (selection) => {
    const chosen = SUBCLASSES[selection];
    if (!chosen) {
      return;
    }

    const classId = getScore(player, "class_request");
    clearActiveAbilityRuntimeForPlayer(player);
    clearClassAbilityItems(player);
    clearMorph(player);
    cleanupNecromancyRebirthState(player);
    cleanupVampireTroopsForOwner(player);
    cleanupWerewolfRebirthState(player);
    clearRebirthClassTags(player);
    resetClassAbilityCooldowns(player);
    clearSecondLifeRuntimeState(player, true);
    setScore(player, "subclass_request", chosen.id);
    setScore(player, "class_primary", classId);
    setScore(player, "subclass_primary", chosen.id);
    setScore(player, "class_confirmed", 1);
    setScore(player, "subclass_confirmed", 1);
    setScore(player, "morph_state", MORPH.NONE);
    setScore(player, "morph_request", MORPH.NONE);
    if (classId === CLASS.VAMPIRE) {
      setScore(player, "plasma_max", 100);
      setScore(player, "plasma", 100);
    }
    grantBaselineClassItems(player, classId, true);
    scheduleUnlockedAbilityItemGrants(player);
    showToast(player, "Build Confirmed", `${getNameById(CLASSES, classId)} / ${chosen.name}`);
    system.runTimeout(() => showMainMenu(player), 4);
  });
}

function showFxColorMenu(player) {
  const form = new ActionFormData()
    .title("Choose FX Color")
    .body("Choose the color used by ability particles, popups, cooldown ready bursts, and morph FX. Unset means white.");

  for (const color of FX_COLORS) {
    form.button(color.name, ICON_BOOK);
  }

  form.button("Back", ICON_BOOK);

  showForm(player, form, (selection) => {
    if (selection === FX_COLORS.length) {
      showMainMenu(player);
      return;
    }

    const color = FX_COLORS[selection];
    if (!color) {
      return;
    }

    setScore(player, "fx_color", color.id);
    showToast(player, "FX Color", `${color.name} selected.`);
    spawnFx(player, 1.1);
    system.runTimeout(() => showMainMenu(player), 3);
  });
}

function showSkillTreeMenu(player) {
  const className = getNameById(CLASSES, getScore(player, "class_primary"));
  const subclassName = getNameById(SUBCLASSES, getScore(player, "subclass_primary"));
  const available = syncXpAvailable(player);
  const form = new ActionFormData()
    .title("Skill Tree")
    .body(`XP Total: ${getScore(player, "xp_total")}\nXP Spent: ${getScore(player, "xp_spent")}\nXP Available: ${available}\n\nPublic, class, and subclass skills are purchased here. Class: ${className}. Subclass: ${subclassName}.`)
    .button("Public Skills", ICON_BOOK)
    .button("Class Skills", ICON_BOOK)
    .button("Subclass Skills", ICON_BOOK)
    .button("Back", ICON_BOOK);

  showForm(player, form, (selection) => {
    if (selection === 3) {
      showMainMenu(player);
      return;
    }
    if (selection === 0) {
      showSkillTreeTab(player, "Public Skills", PUBLIC_SKILL_NODES);
    } else if (selection === 1) {
      showSkillTreeTab(player, `${className} Skills`, getClassSkillNodes(player));
    } else {
      showSkillTreeTab(player, `${subclassName} Skills`, getSubclassSkillNodes(player));
    }
  });
}

function getNodeStatus(player, node) {
  const level = getSkillNodeLevel(player, node);
  if (node.repeatable) {
    return `${level}/${node.max || 1}`;
  }
  if (level <= 0 && getMissingSkillPrerequisite(player, node)) {
    return "Prereq";
  }
  return level > 0 ? "Unlocked" : "Locked";
}

function getNodeButtonLabel(player, node) {
  const toggle = getPublicSkillToggleLabel(player, node);
  const toggleText = toggle ? ` [${toggle}]` : "";
  return `${getNodeStatus(player, node)} - ${node.name}${toggleText} (${node.cost} XP)`;
}

function showSkillTreeTab(player, title, nodes) {
  const available = syncXpAvailable(player);
  const form = new ActionFormData()
    .title(title)
    .body(`XP Available: ${available}\nSelect a locked node to purchase it. Toggleable skills can be turned ON/OFF after unlock.`);

  if (nodes.length === 0) {
    form.button("No nodes for this selection", ICON_BOOK);
  } else {
    for (const node of nodes) {
      form.button(getNodeButtonLabel(player, node), ICON_BOOK);
    }
  }

  form.button("Back", ICON_BOOK);

  showForm(player, form, (selection) => {
    if (selection >= nodes.length) {
      showSkillTreeMenu(player);
      return;
    }

    showSkillNodeDetail(player, title, nodes, nodes[selection]);
  });
}

function showSkillNodeDetail(player, title, nodes, node) {
  const level = getSkillNodeLevel(player, node);
  const maxText = node.repeatable ? `\nTier: ${level}/${node.max || 1}` : `\nState: ${level > 0 ? "Unlocked" : "Locked"}`;
  const toggle = getPublicSkillToggleLabel(player, node);
  const toggleText = toggle ? `\nToggle: ${toggle}` : "";
  const canPurchase = canPurchaseNode(player, node);
  const primaryButton = canPurchase
    ? (node.repeatable && level > 0 ? "Level Up" : "Purchase")
    : level > 0 ? "Unlocked" : "Locked";
  const hasToggleButton = (!!node.toggle || node.dynamicToggle) && level > 0;
  const form = new ActionFormData()
    .title(node.name)
    .body(`${node.description}\nCost: ${node.cost} XP${maxText}${toggleText}\nXP Available: ${syncXpAvailable(player)}`)
    .button(primaryButton, ICON_BOOK);

  if (hasToggleButton) {
    form.button(`Turn ${toggle === "ON" ? "OFF" : "ON"}`, ICON_BOOK);
  }
  form.button("Back", ICON_BOOK);

  showForm(player, form, (selection) => {
    if (selection === 0 && canPurchaseNode(player, node)) {
      purchaseSkillNode(player, node);
    } else if (hasToggleButton && selection === 1) {
      togglePublicSkill(player, node);
    }
    system.runTimeout(() => showSkillTreeTab(player, title, nodes), 3);
  });
}

function showAbilitiesMenu(player) {
  reconcileUnlockedAbilityItems(player);
  const classId = getScore(player, "class_primary");
  const abilities = getPlayerActiveAbilities(player);
  const subclassCooldown = getSubclassCooldown(getScore(player, "subclass_primary"));

  if (abilities.length === 0) {
    const form = new ActionFormData()
      .title("Abilities")
      .body(`Human has no primary abilities.\n\nSubclass cooldown marker: ${subclassCooldown}s.\nUnlock subclass abilities from the XP tree.`)
      .button("Back", ICON_BOOK);
    showForm(player, form, () => showMainMenu(player));
    return;
  }

  const body = [
    `Class cooldown: ${getClassCooldown(classId)}s`,
    `Subclass cooldown marker: ${subclassCooldown}s`,
    classId === CLASS.VAMPIRE ? `Plasma: ${getScore(player, "plasma")}/${getScore(player, "plasma_max") || 100}` : "No class resource bar.",
    "",
    "Unlocked ability items are restored automatically on unlock, spawn, dimension change, and Guidebook open."
  ].join("\n");

  const form = new ActionFormData()
    .title("Abilities")
    .body(body);

  for (const ability of abilities) {
    const unlocked = ability.baseline || (ability.skill && isSkillUnlocked(player, ability.skill));
    const state = !unlocked
      ? "Locked"
      : hasInventoryItem(player, ability.itemId)
        ? "In hotbar"
        : "Auto-restoring";
    const cd = getScore(player, `cd_ability_${ability.slot}`);
    const cooldown = ability.cooldownObjective ? getScore(player, ability.cooldownObjective) : cd;
    form.button(`${state} - ${ability.name}${cooldown > 0 ? ` (${cooldown}s)` : ""}`, ability.icon);
  }

  form.button("Morph Selection", ICON_BOOK);
  form.button("Back", ICON_BOOK);

  showForm(player, form, (selection) => {
    if (selection < abilities.length) {
      const ability = abilities[selection];
      if (ability.skill && !isSkillUnlocked(player, ability.skill)) {
        showToast(player, "Skill Locked", "Unlock this in the XP tree.");
      } else if (hasInventoryItem(player, ability.itemId)) {
        ensureItemInHotbar(player, ability.itemId);
        showToast(player, "Hotbar Ready", ability.name);
      } else {
        reconcileUnlockedAbilityItems(player);
        showToast(player, "Ability Ready", `${ability.name} unlocks automatically.`);
      }
      system.runTimeout(() => showAbilitiesMenu(player), 3);
      return;
    }

    if (selection === abilities.length) {
      showMorphMenu(player);
      return;
    }

    showMainMenu(player);
  });
}

function showMorphMenu(player) {
  const classId = getScore(player, "class_primary");
  const abilities = getClassAbilities(classId).filter((ability) => ability.morphState);
  const currentMorph = getScore(player, "morph_state");
  const body = [
    `Current morph: ${getMorphName(currentMorph)}`,
    "Bat morph equips a full-body morph shell and enables slow flight, mob-ignore suppression, FX trail, and fall immunity.",
    "Morphs do not block hotbar switching, abilities, armor passives, or movement."
  ].join("\n\n");

  const form = new ActionFormData()
    .title("Morph Selection")
    .body(body);

  for (const ability of abilities) {
    form.button(ability.name, ability.icon);
  }

  form.button("End Morph", ICON_BOOK);
  form.button("Back", ICON_BOOK);

  showForm(player, form, (selection) => {
    if (selection < abilities.length) {
      const ability = abilities[selection];
      if (canUseAbility(player, ability)) {
        useMorphShell(player, ability.morphState);
      }
      system.runTimeout(() => showMorphMenu(player), 3);
      return;
    }

    if (selection === abilities.length) {
      clearMorph(player);
      applyMorphEffects(player);
      showToast(player, "Morph Ended", "Returned to normal.");
      system.runTimeout(() => showMorphMenu(player), 3);
      return;
    }

    showAbilitiesMenu(player);
  });
}

function showSettingsMenu(player) {
  const autoReturn = player.hasTag(SETTING_TAGS.autoReturnOff) ? "OFF" : "ON";
  const audio = player.hasTag(SETTING_TAGS.audioOff) ? "OFF" : "ON";
  const isVampire = getScore(player, "class_primary") === CLASS.VAMPIRE;
  const scale = player.hasTag(SETTING_TAGS.scaleSmall)
    ? "Small"
    : player.hasTag(SETTING_TAGS.scaleLarge)
      ? "Large"
      : "Medium";
  const vampirePassives = isVampire
    ? `\nBlood Thirst: ${isSkillUnlocked(player, "skill_blood_thirst") ? "ON" : "LOCKED"}\nMidnight Strength: ${isSkillUnlocked(player, "skill_midnight_strength") ? "ON" : "LOCKED"}\nAbilities unlock automatically.`
    : "";

  const form = new ActionFormData()
    .title("Settings")
    .body(`Ability Auto-Return: ${autoReturn}\nUI Scale: ${scale}\nAudio: ${audio}${vampirePassives}`)
    .button(`Ability Auto-Return: ${autoReturn}`, ICON_BOOK)
    .button(`UI Scale: ${scale}`, ICON_BOOK)
    .button("FX Color Reset", ICON_BOOK)
    .button("Reset Ability Toggles", ICON_BOOK)
    .button(`Audio Toggle: ${audio}`, ICON_BOOK);

  form.button("Back", ICON_BOOK);

  showForm(player, form, (selection) => {
    const backIndex = 5;
    switch (selection) {
      case 0:
        toggleTag(player, SETTING_TAGS.autoReturnOff);
        showSettingsMenu(player);
        break;
      case 1:
        showUiScaleMenu(player);
        break;
      case 2:
        setScore(player, "fx_color", 0);
        showToast(player, "FX Color", "Reset to white.");
        spawnFx(player, 1.1);
        system.runTimeout(() => showSettingsMenu(player), 3);
        break;
      case 3:
        resetAbilityToggles(player);
        showToast(player, "Abilities", "Toggles reset. Persistent icons stay in your inventory.");
        system.runTimeout(() => showSettingsMenu(player), 3);
        break;
      case 4:
        toggleTag(player, SETTING_TAGS.audioOff);
        showSettingsMenu(player);
        break;
      default:
        if (selection === backIndex) {
          showMainMenu(player);
          return;
        }
        break;
    }
  });
}

function showUiScaleMenu(player) {
  const form = new ActionFormData()
    .title("UI Scale")
    .body("Choose the preferred UI scale marker for future custom UI layouts.")
    .button("Small", ICON_BOOK)
    .button("Medium", ICON_BOOK)
    .button("Large", ICON_BOOK)
    .button("Back", ICON_BOOK);

  showForm(player, form, (selection) => {
    if (selection === 3) {
      showSettingsMenu(player);
      return;
    }

    clearScaleTags(player);
    if (selection === 0) {
      player.addTag(SETTING_TAGS.scaleSmall);
    }
    if (selection === 2) {
      player.addTag(SETTING_TAGS.scaleLarge);
    }
    showSettingsMenu(player);
  });
}

function showHelpMenu(player) {
  const form = new ActionFormData()
    .title("Help")
    .body(RPG_TAGLINE)
    .button("Vampire Mechanics", ICON_BOOK)
    .button("Werewolf Mechanics", ICON_BOOK)
    .button("Banshee Mechanics", ICON_BOOK)
    .button("Subclasses and XP Tree", ICON_BOOK)
    .button("Armor and Weapons", ICON_BOOK)
    .button("Spells and Rebirth", ICON_BOOK)
    .button("Back", ICON_BOOK);

  showForm(player, form, (selection) => {
    switch (selection) {
      case 0:
        showHelpPage(player, "Vampire Mechanics", [
          "Plasma replaces the hunger concept for vampires. Plasma drains by 1 every 10 seconds.",
          "Most vampire abilities cost 5 plasma and have no cooldown. Compel costs 50 plasma and has no cooldown.",
          "At 0 plasma, vampires take starvation damage.",
          "Vampire Fangs restore plasma and are indestructible. Fangs appear when Vampire is chosen, and unlocked Vampire items appear on first unlock.",
          "Fang hits deal 3 hearts, apply Wither for 5 seconds, restore plasma, and work on passive or hostile mobs and non-Werewolf players.",
          "Blood Thirst and Midnight Strength are passive unlocks. Midnight Strength doubles base melee damage and adds +50% movement speed at night, in the Nether, in The End, or during overworld thunderstorms. Its Strength effect HUD art is hidden by the resource pack.",
          "Compel is the Vampire ultimate. It requires all earlier Vampire primary skills, costs 50 XP to unlock, spends 50 plasma per use, and instantly kills the target you are aiming at unless that entity is protected.",
          "Vampire chest, legs, and boots together stop sunlight burn and restore 5 plasma per second.",
          "Vampire helmet gives night vision but does not stop sunlight.",
          "Bat Morph makes the player invisible and mirrors movement, rotation, jumping, sneaking, and sprinting through the bat entity while retaining slow custom flight, mob-ignore protection, night vision, FX trail, and fall immunity.",
          "Summon Vampire Troops creates three melee allies that follow you, hunt hostile mobs, and switch to targets you attack or targets that attack you."
        ]);
        break;
      case 1:
        showHelpPage(player, "Werewolf Mechanics", [
          "Werewolves have no resource bar and use 3 second class cooldowns.",
          "Iron armor applies ongoing weakness. Iron weapons deal extra damage to werewolves.",
          "Water applies weakness and slowness. Leaving water keeps those effects for 5 seconds. Rain does not count.",
          "Wall climbing is always available by sneaking against climbable blocks.",
          "Night grants strength and speed with stronger night amplification.",
          "Werewolf Fangs are granted automatically, poison targets, and last longer against vampires.",
          "Roar summons three vanilla wolf allies for one minute; they target what you hit, what attacks you, or what you looked at on summon.",
          "Shadow Wolf Morph equips a full-body wolf shell, grants +10 hearts, strength, jump, resistance, night vision, speed, and ignores water weakness while morphed.",
          "Lycan Vitality uses lycan_vitality tiers for up to +5 hearts outside morph. Shadow Wolf Morph overrides it.",
          "Scent is the Werewolf ultimate: after Roar, Shadow Wolf Morph, and max Lycan Vitality are unlocked, open the Scent skill page to turn hostile mob suppression ON or OFF."
        ]);
        break;
      case 2:
        showHelpPage(player, "Banshee Mechanics", [
          "Banshees have no resource bar and use 3 second class cooldowns.",
          "Permanent slow falling is active.",
          "Banshee Phase is an unlockable toggle ability. Turn it ON, then walk horizontally into a valid wall with air behind it to slip through.",
          "Dirt, grass, bedrock, floors, and ceilings block phasing.",
          "Fire deals extra damage. Water applies poison.",
          "Banshee Invisibility is unlocked in the XP tree and toggles persistent invisibility ON/OFF.",
          "Sonic Scream fires a Warden-style sonic boom, damages mobs and players in front of you, and costs 1 heart.",
          "Banshee Morph equips a translucent ghost shell and grants slow fall, jump-held levitation, night vision, and full damage immunity while morphed.",
          "Mind Fracture is unlocked in the Banshee tree and has an ON/OFF toggle for 5 second Nausea on Banshee hits.",
          "Soul is the Banshee ultimate: Sonic Scream kills restore you to full health."
        ]);
        break;
      case 3:
        showHelpPage(player, "Subclasses and XP Tree", [
          "The XP tree uses xp_total, xp_spent, xp_available, and xp_tree_state.",
          "Public Skills, Class Skills, and Subclass Skills are separate tabs in one unified tree.",
          "Class and subclass abilities are locked by default and must be purchased with XP.",
          "Public skills include Parkourist, Second Life, Adrenaline, HP Regen, XP Boost, and Luck. Toggleable public skills can be switched ON/OFF from their nodes.",
          "Second Life prevents one lethal hit, restores full health and hunger, grants Resistance II and Regeneration II for 10 seconds, then enters a 5 minute cooldown that continues through respawn.",
          "Warrior unlocks Switch Throw, Tenacity Charge, and Third Hit Double Damage.",
          "Ninja unlocks Ninja Agility, Multi-Jump, Dagger Throw, Strikethrough, and Smoke Bomb. Ninja Agility has 5 sprint-speed tiers: +25%, +35%, +50%, +75%, and +90%. Multi-Jump has 3 tiers and grants timed fall immunity with landing grace after an extra mid-air jump.",
          "Witch unlocks Spell Mastery, Necromancy, and Staff Mastery. Necromancy summons three protected skeleton troops that follow and defend you until dismissed or replaced.",
          "Archer unlocks Chain Lightning, Crit Focus, Levitate, and Explosive Arrows.",
          "Tank unlocks Shield Slam, Fortify, and Taunt.",
          "Human has no primary abilities and relies on subclass progression."
        ]);
        break;
      case 4:
        showHelpPage(player, "Armor and Weapons", [
          "Witch Hat is the only witch armor piece and provides the witch visual identity.",
          "Tank uses Shield Slam, Fortify, and Taunt through subclass ability items.",
          "Archers use vanilla bows with Archer passives.",
          "The Staff of Destruction cycles time on normal use, cycles weather while sneaking, costs half a heart, and has a 20 second cooldown."
        ]);
        break;
      case 5:
        showHelpPage(player, "Spells and Rebirth", [
          "Fire Bomb, Ice Bomb, and Poison Bomb are craftable spell bottles.",
          "Fire Bomb creates temporary fire FX, Ice Bomb creates temporary snow FX, and Poison Bomb creates a short-lived poison cloud creature FX.",
          "Anyone can craft and use spells. Non-witches take half their current hearts as true damage when using spell bottles or the Staff of Destruction.",
          "Witches take no spell penalty. Spell Mastery improves spell damage and cooldown.",
          "All spells, weapons, abilities, crits, cooldown-ready bursts, and morph transitions use your selected FX color. Default is white.",
          "Rebirth Potion resets class, subclass, skill unlocks, toggles, and class tags, removes class/subclass/morph ability items, then refunds spent XP into xp_available.",
          "Rebirth preserves normal Minecraft items, armor, weapons, and unrelated inventory contents."
        ]);
        break;
      case 6:
        showMainMenu(player);
        break;
      default:
        break;
    }
  });
}

function showHelpPage(player, title, lines) {
  const form = new ActionFormData()
    .title(title)
    .body(lines.join("\n\n"))
    .button("Back to Help", ICON_BOOK)
    .button("Main Menu", ICON_BOOK);

  showForm(player, form, (selection) => {
    if (selection === 0) {
      showHelpMenu(player);
    } else {
      showMainMenu(player);
    }
  });
}

function toggleTag(player, tag) {
  if (player.hasTag(tag)) {
    player.removeTag(tag);
  } else {
    player.addTag(tag);
  }
}

function clearScaleTags(player) {
  if (player.hasTag(SETTING_TAGS.scaleSmall)) {
    player.removeTag(SETTING_TAGS.scaleSmall);
  }
  if (player.hasTag(SETTING_TAGS.scaleLarge)) {
    player.removeTag(SETTING_TAGS.scaleLarge);
  }
}

function isJumpButtonPressEvent(event) {
  try {
    const button = event.button;
    const state = event.newButtonState;
    return String(button) === INPUT_BUTTON_JUMP && String(state) === BUTTON_STATE_PRESSED;
  } catch {
    return false;
  }
}

function trackPlayerButtonInput(event) {
  try {
    const button = String(event.button || "");
    if (button !== INPUT_BUTTON_JUMP && button !== INPUT_BUTTON_SNEAK) {
      return;
    }
    const state = String(event.newButtonState || "");
    if (state === BUTTON_STATE_PRESSED) {
      setPlayerButtonHeld(event.player, button, true);
    } else if (state === BUTTON_STATE_RELEASED) {
      setPlayerButtonHeld(event.player, button, false);
    }
  } catch {
    // Input events are advisory; live polling remains the fallback path.
  }
}

if (world.afterEvents && world.afterEvents.playerButtonInput) {
  subscribeEvent(world.afterEvents.playerButtonInput, (event) => {
    trackPlayerButtonInput(event);
    if (!event.player || !isJumpButtonPressEvent(event)) {
      return;
    }
    tryUseMultiJump(event.player);
  });
}

const GUIDEBOOK_OPEN_GUARD = new Set();

function handleGuideBookUseEvent(event) {
  const player = event.source;
  const itemStack = event.itemStack;

  if (!player || !itemStack || player.typeId !== "minecraft:player" || itemStack.typeId !== RPG_BOOK_ID) {
    return false;
  }

  const playerKey = getEntityKey(player) || player.name;
  if (GUIDEBOOK_OPEN_GUARD.has(playerKey)) {
    return true;
  }

  GUIDEBOOK_OPEN_GUARD.add(playerKey);
  system.run(() => {
    if (isPlayerValid(player)) {
      reconcileUnlockedAbilityItems(player);
      showMainMenu(player);
    }
  });
  system.runTimeout(() => GUIDEBOOK_OPEN_GUARD.delete(playerKey), 2);
  return true;
}

function handleItemUseEvent(event) {
  const player = event.source;
  const itemStack = event.itemStack;

  if (!player || !itemStack || player.typeId !== "minecraft:player") {
    return;
  }

  if (handleGuideBookUseEvent(event)) {
    return;
  }

  if (itemStack.typeId === REBIRTH_POTION_ID) {
    if (!(world.afterEvents && world.afterEvents.itemCompleteUse)) {
      system.run(() => performRebirthFromItem(player, true));
    }
    return;
  }

  if (Object.values(SPELL_IDS).indexOf(itemStack.typeId) !== -1) {
    system.run(() => useSpell(player, itemStack.typeId));
    return;
  }

  if (Object.values(WEAPON_IDS).indexOf(itemStack.typeId) !== -1) {
    system.run(() => useWeaponActive(player, itemStack.typeId));
    return;
  }

  const ability = ABILITY_BY_ITEM_ID[itemStack.typeId];
  if (ability) {
    system.run(() => handleAbilityUse(player, ability));
  }
}

const itemUseSubscribed = subscribeEvent(world.afterEvents && world.afterEvents.itemUse, handleItemUseEvent);
if (itemUseSubscribed) {
  subscribeEvent(world.beforeEvents && world.beforeEvents.itemUse, handleGuideBookUseEvent);
} else {
  subscribeEvent(world.beforeEvents && world.beforeEvents.itemUse, handleItemUseEvent);
}

if (world.afterEvents && world.afterEvents.itemCompleteUse) {
  subscribeEvent(world.afterEvents.itemCompleteUse, (event) => {
    const player = event.source;
    const itemStack = event.itemStack;
    if (!player || player.typeId !== "minecraft:player" || !itemStack) {
      return;
    }
    if (itemStack.typeId === REBIRTH_POTION_ID) {
      system.run(() => performRebirthFromItem(player, false));
      return;
    }
  });
}

function handlePlayerSpawn(event) {
  scheduleGuideBookRestore(event.player);
  system.runTimeout(() => {
    if (isPlayerValid(event.player)) {
      resetSecondLifeOnSpawn(event.player);
      reconcileUnlockedAbilityItems(event.player);
    }
  }, 1);

  if (event.initialSpawn) {
    initializePlayer(event.player);
  } else {
    ADRENALINE_EFFECT_STATES.delete(getEntityKey(event.player) || event.player.name);
    setScore(event.player, "adrenaline_active", 0);
    system.runTimeout(() => {
      initializePlayer(event.player);
      reconcileUnlockedAbilityItems(event.player);
      system.runTimeout(() => restoreLycanVitalityAfterRespawn(event.player), 2);
    }, 20);
  }
}

subscribeEvent(world.afterEvents && world.afterEvents.playerSpawn, handlePlayerSpawn);

if (world.afterEvents && world.afterEvents.playerDimensionChange) {
  subscribeEvent(world.afterEvents.playerDimensionChange, (event) => {
    if (event.player && isPlayerValid(event.player)) {
      scheduleGuideBookRestore(event.player);
      reconcileUnlockedAbilityItems(event.player);
    }
  });
}

if (world.afterEvents && world.afterEvents.worldLoad) {
  subscribeEvent(world.afterEvents.worldLoad, () => {
    for (const player of getOnlinePlayers()) {
      scheduleGuideBookRestore(player);
    }
  });
}

if (world.afterEvents && world.afterEvents.entityHurt) {
  subscribeEvent(world.afterEvents.entityHurt, (event) => handleEntityHurt(event));
}

if (world.afterEvents && world.afterEvents.entityDie) {
  subscribeEvent(world.afterEvents.entityDie, (event) => handleEntityDie(event));
}

if (world.afterEvents && world.afterEvents.projectileHitEntity) {
  subscribeEvent(world.afterEvents.projectileHitEntity, (event) => handleProjectileHitEntity(event));
}

if (world.beforeEvents && world.beforeEvents.entityHurt) {
  subscribeEvent(world.beforeEvents.entityHurt, (event) => handleBeforeHurt(event));
}

system.runTimeout(() => {
  runTickSafely("startupInitialize", () => {
    ensureScoreboards();
    for (const player of getOnlinePlayers()) {
      scheduleGuideBookRestore(player);
      initializePlayer(player);
    }
  });
}, 5);

system.runInterval(() => {
  for (const player of getOnlinePlayers()) {
    if (isPlayerValid(player)) {
      runTickSafely("processFast", () => processFast(player));
    }
  }
}, 1);

system.runInterval(() => {
  for (const player of getOnlinePlayers()) {
    if (isPlayerValid(player)) {
      runTickSafely("processSecond", () => processSecond(player));
    }
  }
}, 20);

system.runInterval(() => {
  runTickSafely("processShadowWolfMimics", () => processShadowWolfMimics());
  switchThrowUpdateGate = (switchThrowUpdateGate + 1) % SWITCH_THROW_UPDATE_INTERVAL_TICKS;
  if (switchThrowUpdateGate === 0) {
    runTickSafely("processSwitchThrows", () => processSwitchThrows());
  }
  daggerThrowUpdateGate = (daggerThrowUpdateGate + 1) % DAGGER_THROW_UPDATE_INTERVAL_TICKS;
  if (daggerThrowUpdateGate === 0) {
    runTickSafely("processDaggerThrows", () => processDaggerThrows());
  }
  roarWolfUpdateGate = (roarWolfUpdateGate + 1) % WEREWOLF_ROAR_UPDATE_INTERVAL_TICKS;
  if (roarWolfUpdateGate === 0) {
    runTickSafely("processRoarWolves", () => processRoarWolves());
  }
  runTickSafely("processTenacityCharges", () => processTenacityCharges());
  runTickSafely("processNecroDragonBreathDots", () => processNecroDragonBreathDots());
  necromancyGroupUpdateGate = (necromancyGroupUpdateGate + 1) % NECROMANCY_GROUP_UPDATE_INTERVAL_TICKS;
  if (necromancyGroupUpdateGate === 0) {
    runTickSafely("processNecromancyGroups", () => processNecromancyGroups());
    runTickSafely("processVampireTroopGroups", () => processVampireTroopGroups());
  }
}, 1);

system.runInterval(() => {
  runTickSafely("processTemporarySpellFx", () => processTemporarySpellFx());
}, 20);
