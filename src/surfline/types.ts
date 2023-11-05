interface Hit {
  _index: string;
  _type: string;
  _id: string;
  _score: number;
  _source: {
    breadCrumbs: string[];
    name: string;
    cams: any[]; // You can define a more specific type for "cams"
    location: {
      lon: number;
      lat: number;
    };
    href: string;
  };
}

interface Options {
  text: string;
  _index: string;
  _type: string;
  _id: string;
  _score: number;
  _source: {
    breadCrumbs: string[];
    name: string;
    cams: any[]; // You can define a more specific type for "cams"
    location: {
      lon: number;
      lat: number;
    };
    href: string;
  };
  contexts: {
    type: string[];
    location: string[];
  };
}

interface Suggest {
  "spot-suggest"?: Options[];
  "subregion-suggest"?: Options[];
  "geoname-suggest"?: Options[];
  "feed-tag-suggest"?: Options[];
  "travel-suggest"?: Options[];
}

export interface HitGroup {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    failed: number;
  };
  hits: {
    total: number;
    max_score: number | null;
    hits: Hit[];
  };
  suggest: Suggest;
  status: number;
}


interface Location {
    lon: number;
    lat: number;
  }
  
  interface Swell {
    height: number;
    period: number;
    impact: number;
    power: number;
    direction: number;
    directionMin: number;
    optimalScore: number;
  }
  
  interface Surf {
    min: number;
    max: number;
    optimalScore: number;
    plus: boolean;
    humanRelation: string;
    raw: {
      min: number;
      max: number;
    };
  }
  
  interface SuggestOptions {
    text: string;
    offset: number;
    length: number;
    options: Options[];
  }
  
  interface Options {
    text: string;
    _index: string;
    _type: string;
    _id: string;
    _score: number;
    _source: {
      breadCrumbs: string[];
      name: string;
      cams: any[]; // You can define a more specific type for "cams"
      location: Location;
      href: string;
    };
    contexts: {
      type: string[];
      location: string[];
    };
  }
  
  interface Permissions {
    data: any[]; // You can define a more specific type
    violations: Violation[];
  }
  
  interface Violation {
    code: number;
    message: string;
    permission: {
      name: string;
      required: boolean;
    };
  }
  
  interface Data {
    timestamp: number;
    probability: number;
    utcOffset: number;
    surf: Surf;
    power: number;
    swells: Swell[];
  }
  
  interface AssociatedData {
    units: {
      swellHeight: string;
      waveHeight: string;
    };
    utcOffset: number;
    location: Location;
    forecastLocation: Location;
    offshoreLocation: Location;
    runInitializationTimestamp: number;
  }
  
  export interface ForecastObject {
    associated: AssociatedData;
    data: Data[];
    permissions: Permissions;
  }
  


