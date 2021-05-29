import { PropositionalWorld } from "../logic/World";
import { WorldPreference } from "../logic/WorldPreference";

export function propositionalWorldSerializer(world: PropositionalWorld): string {
    return JSON.stringify([...world.assignment]);
}

export function worldPreferenceSerializer(preference: WorldPreference): string {
    return JSON.stringify(preference.data.map(rank => rank.map(world => [...world.assignment])));
}
