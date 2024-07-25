// Normal encounters

import { Utils } from "../../shared/utils";

export class TrackerLocation {
  name: string;
  areas: LocationArea[];
  expanded: boolean = false;

  constructor(name: string, areas: LocationArea[]) {
    this.name = name;
    this.areas = areas;
  }

  get numEncounters() { return this.areas.map(x => x.numEncounters).reduce((x, y) => x + y, 0) }

  get height(): number {
    if (!this.expanded) return 1;

    return this.areas
      .map((area) => area.height)
      .reduce((x, y) => x + y, 0);
  }

  *iteratePokemon(): IterableIterator<{
    encounter: EncounterInfo;
    area: LocationArea;
    subarea: LocationSubarea | null;
    newArea: boolean;
    newSubarea: boolean;
  }> {
    for (const area of this.areas) {
      if (area.encounters) {
        for (const [i, encounter] of area.encounters.entries()) {
          yield {
            encounter: encounter,
            area: area,
            subarea: null,
            newArea: i == 0,
            newSubarea: false,
          };
        }
      } else if (area.subareas) {
        for (const [i, subarea] of area.subareas.entries()) {
          for (const [j, encounter] of subarea.encounters.entries()) {
            yield {
              encounter: encounter,
              area: area,
              subarea: subarea,
              newArea: i == 0 && j == 0,
              newSubarea: j == 0,
            };
          }
        }
      }
    }
  }
}

export class LocationArea {
  name: string;
  subareas: LocationSubarea[] | null = null;
  encounters: EncounterInfo[] | null = null;
  expanded: boolean = true;

  constructor(
    name: string,
    subareas: LocationSubarea[] | null,
    encounters: EncounterInfo[] | null
  ) {
    this.name = name;
    this.subareas = subareas;
    this.encounters = encounters;
  }

  get numEncounters() { return this.encounters
    ? this.encounters.length
    : this.subareas.map(x => x.numEncounters).reduce((x, y) => x + y, 0)
  }

  get width() {
    return this.expanded ? (this.encounters ? 2 : 1) : 3;
  }

  get height() {
    return this.expanded ? this.numEncounters : 1;
  }

  get label(): string {
    return Utils.orElse(Object.values(AreaLabel)
        .filter(x => x[1].includes(this.name.trim().toLowerCase().replace(/[^\sa-z]/g, '')))
        .map(x => x[0])[0],
        AreaLabel.unknown[0],
      ) as string
  }

  static parse(key: string, item: any): LocationArea {
    if (Array.isArray(item)) {
      return new LocationArea(key, null, item.map(EncounterInfo.parse));
    } else {
      return new LocationArea(
        key,
        Object.entries(item).map(([key, encounters]) =>
          LocationSubarea.parse(key, encounters)
        ),
        null
      );
    }
  }
}

export class LocationSubarea {
  name: string;
  encounters: EncounterInfo[];

  get numEncounters() { return this.encounters.length; }

  static parse(key: string, items: any): LocationSubarea {
    return Object.assign(new LocationSubarea(), {
      name: key,
      encounters: items.map(EncounterInfo.parse),
    });
  }
}

export class EncounterInfo {
  name: string;
  chancePct: number;
  levelRange: number[] = [];
  notes: string | null = null;

  static parse(item: any): EncounterInfo {
    return {
      name: item['pokemon'],
      chancePct: item['chance_pct'],
      levelRange: item['level_range'],
      notes: item['notes'],
    };
  }
}

export interface TrackedPokemon {
  name: string;
  caught: boolean;
}

// Labels

/*
  From parsing JSONs:
    "Surf"
    "Fish"
    "Grass"
    "Sewer"
    "Cave"
    "Sand"
    "Special Event"
    "Bridge"
    "Special Gifts:"
    "Floor"
    "Rooms"
    "Special Event:"
  */

export const AreaLabel = {
  grass: ["grass", ["grass"]],
  fish: ["fish", ["fish"]],
  cave: ["cave", ["cave", "sewer", "floor", "sand"]],
  surf: ["surf", ["surf"]],
  outsideSpecial: ["outsideSpecial", ["bridge"]],
  misc: ["misc", ["special gifts", "rooms", "special event"]],
  unknown: ["unknown", []],
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
