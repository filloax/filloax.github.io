// Normal encounters

export class TrackerLocation {
    name: string;
    areas: LocationArea[];
    expanded: boolean = false;


	constructor(name: string, areas: LocationArea[]) {
        this.name = name;
        this.areas = areas;
	}

    getHeight(): number {
        if (!this.expanded) return 1;

        return this.areas.map(area => (area.expanded 
                ? (
                    area.encounters
                        ? area.encounters.length
                        : Object.values(area.subareas).reduce((x, y) => x + y.encounters.length, 0)
                ) : 1)
            ).reduce((x, y) => x + y, 0);
    }
}

export class LocationArea {
    name: string;
    subareas: LocationSubarea[] | null = null;
    encounters: EncounterInfo[] | null = null;
    expanded: boolean = true;

    constructor(name: string, subareas: LocationSubarea[] | null, encounters: EncounterInfo[] | null) {
        this.name = name;
        this.subareas = subareas;
        this.encounters = encounters;
    }

    getHeight(): number {
        if (!this.expanded) return 1;

        if (this.subareas) 
            return this.subareas.reduce((x, y) => x + y.encounters.length, 0);

        if (this.encounters)
            return this.encounters.length;

        return 1;
    }

    static parse(key: string, item: any): LocationArea {
        if (Array.isArray(item)) {
            return new LocationArea(
                key,
                null,
                item.map(EncounterInfo.parse),
            )
        } else {
            return new LocationArea(
                key,
                Object.entries(item).map(([key, encounters]) => LocationSubarea.parse(key, encounters)),
                null,
            )
        }
    }
}

export class LocationSubarea {
    name: string;
    encounters: EncounterInfo[];

    static parse(key: string, items: any): LocationSubarea {
        return {
            name: key,
            encounters: items.map(EncounterInfo.parse),
        };
    }
}

export class EncounterInfo {
    name: string;
    tracked: TrackedPokemon | null;
    chancePct: number;
    levelRange: number[] = [];
    notes: string | null = null;

    /**
     * Parses JSON data. Must assign tracked reference after.
     */
    static parse(item: any): EncounterInfo {
        return {
            name: item['pokemon'],
            tracked: null,
            chancePct: item['chance_pct'],
            levelRange: item['level_range'],
            notes: item['notes'],
        }
    }
}

export class TrackedPokemon {
    name: string;
    caught: boolean;
}

// Hidden grotto

export class HiddenGrottos {
    grottos: Record<string, Record<string, HiddenGrottoEncounterInfo[]>> = {};
}

export class HiddenGrottoEncounterInfo {
    pokemon: string;
    level: string | null = null;
    forcedFirst: boolean = false;

    constructor(pokemon: string) {
        this.pokemon = pokemon;
    }

    static parse(item: string | object): HiddenGrottoEncounterInfo {
        if (typeof item === 'string') {
            return new HiddenGrottoEncounterInfo(item);
        } else {
            return item as HiddenGrottoEncounterInfo;
        }
    }
}