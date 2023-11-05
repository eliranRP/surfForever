import { apiClient } from "../framework/api-manager";
import { ForecastObject, HitGroup } from "./types";

export const searchForPlace = async (query: string): Promise<HitGroup[]> => {
  const response = await apiClient.get(
    `${process.env.SURFLINE_BASE_URL}/search/site?q=${query}&querySize=10&suggestionSize=10&newsSearch=true`
  );
  return response.data;
};

// Search for a place
// we need to filter only spot-suggest hits. and save the link to
//https://services.surfline.com/search/site?q=maaravi&querySize=10&suggestionSize=10&newsSearch=true

/**
 * 
 * [
    {
        "took": 2,
        "timed_out": false,
        "_shards": {
            "total": 5,
            "successful": 5,
            "failed": 0
        },
        "hits": {
            "total": 1,
            "max_score": 35.305843,
            "hits": [
                {
                    "_index": "spots",
                    "_type": "spot",
                    "_id": "595579ac31d48a00128db928",
                    "_score": 35.305843,
                    "_source": {
                        "breadCrumbs": [
                            "Israel",
                            "Tel Aviv"
                        ],
                        "name": "Maaravi",
                        "cams": [],
                        "location": {
                            "lon": 34.75484,
                            "lat": 32.0561359538
                        },
                        "href": "https://www.surfline.com/surf-report/maaravi/595579ac31d48a00128db928"
                    }
                }
            ]
        },
        "suggest": {
            "spot-suggest": [
                {
                    "text": "maaravi",
                    "offset": 0,
                    "length": 7,
                    "options": [
                        {
                            "text": "Maaravi",
                            "_index": "spots",
                            "_type": "spot",
                            "_id": "595579ac31d48a00128db928",
                            "_score": 8,
                            "_source": {
                                "breadCrumbs": [
                                    "Israel",
                                    "Tel Aviv"
                                ],
                                "name": "Maaravi",
                                "cams": [],
                                "location": {
                                    "lon": 34.75484,
                                    "lat": 32.0561359538
                                },
                                "href": "https://www.surfline.com/surf-report/maaravi/595579ac31d48a00128db928"
                            },
                            "contexts": {
                                "type": [
                                    "spot"
                                ],
                                "location": [
                                    "sv8"
                                ]
                            }
                        }
                    ]
                }
            ]
        },
        "status": 200
    },
    {
        "took": 1,
        "timed_out": false,
        "_shards": {
            "total": 5,
            "successful": 5,
            "failed": 0
        },
        "hits": {
            "total": 0,
            "max_score": null,
            "hits": []
        },
        "suggest": {
            "subregion-suggest": [
                {
                    "text": "maaravi",
                    "offset": 0,
                    "length": 7,
                    "options": []
                }
            ]
        },
        "status": 200
    },
    {
        "took": 1,
        "timed_out": false,
        "_shards": {
            "total": 5,
            "successful": 5,
            "failed": 0
        },
        "hits": {
            "total": 0,
            "max_score": null,
            "hits": []
        },
        "suggest": {
            "geoname-suggest": [
                {
                    "text": "maaravi",
                    "offset": 0,
                    "length": 7,
                    "options": []
                }
            ]
        },
        "status": 200
    },
    {
        "took": 2,
        "timed_out": false,
        "_shards": {
            "total": 5,
            "successful": 5,
            "failed": 0
        },
        "hits": {
            "total": 0,
            "max_score": null,
            "hits": []
        },
        "suggest": {
            "feed-tag-suggest": [
                {
                    "text": "maaravi",
                    "offset": 0,
                    "length": 7,
                    "options": []
                }
            ]
        },
        "status": 200
    },
    {
        "took": 1,
        "timed_out": false,
        "_shards": {
            "total": 5,
            "successful": 5,
            "failed": 0
        },
        "hits": {
            "total": 0,
            "max_score": null,
            "hits": []
        },
        "suggest": {
            "travel-suggest": [
                {
                    "text": "maaravi",
                    "offset": 0,
                    "length": 7,
                    "options": []
                }
            ]
        },
        "status": 200
    }
]
 * 
 */

export const getForecast = async (
  spotId: string
): Promise<ForecastObject[]> => {
  const FORECAST_DAYS = 2;
  const INTERVAL_HOURS = 6;

  const response = await apiClient.get(
    `${process.env.SURFLINE_BASE_URL}/kbyg/spots/forecasts/wave?spotId=${spotId}&days=${FORECAST_DAYS}&intervalHours=${INTERVAL_HOURS}&cacheEnabled=true&units%5BswellHeight%5D=M&units%5BwaveHeight%5D=M`
  );
  return response.data;
};

// get forecast
//https://services.surfline.com/kbyg/spots/forecasts/wave?spotId=595579ac31d48a00128db928&days=1&intervalHours=6&cacheEnabled=true&units%5BswellHeight%5D=M&units%5BwaveHeight%5D=M
/**
 * {
    "associated": {
        "units": {
            "swellHeight": "M",
            "waveHeight": "M"
        },
        "utcOffset": 2,
        "location": {
            "lon": 34.75484,
            "lat": 32.0561359538
        },
        "forecastLocation": {
            "lon": 34.752,
            "lat": 32.0572
        },
        "offshoreLocation": {
            "lon": 34.5,
            "lat": 32
        },
        "runInitializationTimestamp": 1699077600
    },
    "data": {
        "wave": [
            {
                "timestamp": 1699048800,
                "probability": 100,
                "utcOffset": 2,
                "surf": {
                    "min": 0,
                    "max": 0.3,
                    "optimalScore": 0,
                    "plus": false,
                    "humanRelation": "Shin to knee",
                    "raw": {
                        "min": 0.13911,
                        "max": 0.21736
                    }
                },
                "power": 3.66468,
                "swells": [
                    {
                        "height": 0.25,
                        "period": 3,
                        "impact": 0.0742,
                        "power": 0.06058,
                        "direction": 12.51,
                        "directionMin": -3.584999999999999,
                        "optimalScore": 0
                    },
                    {
                        "height": 0.29,
                        "period": 6,
                        "impact": 0.5547,
                        "power": 2.80974,
                        "direction": 296.53,
                        "directionMin": 290.965,
                        "optimalScore": 0
                    },
                    {
                        "height": 0.14,
                        "period": 7,
                        "impact": 0.3711,
                        "power": 0.79436,
                        "direction": 294.76,
                        "directionMin": 290.575,
                        "optimalScore": 0
                    },
                    {
                        "height": 0,
                        "period": 0,
                        "impact": 0,
                        "power": 0,
                        "direction": 0,
                        "directionMin": 0,
                        "optimalScore": 0
                    },
                    {
                        "height": 0,
                        "period": 0,
                        "impact": 0,
                        "power": 0,
                        "direction": 0,
                        "directionMin": 0,
                        "optimalScore": 0
                    },
                    {
                        "height": 0,
                        "period": 0,
                        "impact": 0,
                        "power": 0,
                        "direction": 0,
                        "directionMin": 0,
                        "optimalScore": 0
                    }
                ]
            },
            {
                "timestamp": 1699070400,
                "probability": 100,
                "utcOffset": 2,
                "surf": {
                    "min": 0,
                    "max": 0.3,
                    "optimalScore": 0,
                    "plus": false,
                    "humanRelation": "Shin to knee",
                    "raw": {
                        "min": 0.1285,
                        "max": 0.20078
                    }
                },
                "power": 3.70874,
                "swells": [
                    {
                        "height": 0.16,
                        "period": 2,
                        "impact": 0.0286,
                        "power": 0.00821,
                        "direction": 21.01,
                        "directionMin": 7.675000000000001,
                        "optimalScore": 0
                    },
                    {
                        "height": 0.24,
                        "period": 5,
                        "impact": 0.4566,
                        "power": 1.33717,
                        "direction": 296.75,
                        "directionMin": 290.945,
                        "optimalScore": 0
                    },
                    {
                        "height": 0.23,
                        "period": 7,
                        "impact": 0.5148,
                        "power": 2.36336,
                        "direction": 292.04,
                        "directionMin": 287.875,
                        "optimalScore": 0
                    },
                    {
                        "height": 0,
                        "period": 0,
                        "impact": 0,
                        "power": 0,
                        "direction": 0,
                        "directionMin": 0,
                        "optimalScore": 0
                    },
                    {
                        "height": 0,
                        "period": 0,
                        "impact": 0,
                        "power": 0,
                        "direction": 0,
                        "directionMin": 0,
                        "optimalScore": 0
                    },
                    {
                        "height": 0,
                        "period": 0,
                        "impact": 0,
                        "power": 0,
                        "direction": 0,
                        "directionMin": 0,
                        "optimalScore": 0
                    }
                ]
            },
            {
                "timestamp": 1699092000,
                "probability": 96.66666666666669,
                "utcOffset": 2,
                "surf": {
                    "min": 0,
                    "max": 0.3,
                    "optimalScore": 0,
                    "plus": false,
                    "humanRelation": "Shin to knee",
                    "raw": {
                        "min": 0.16154,
                        "max": 0.2524
                    }
                },
                "power": 7.14142,
                "swells": [
                    {
                        "height": 0.17,
                        "period": 2,
                        "impact": 0.0691,
                        "power": 0.02002,
                        "direction": 15.3,
                        "directionMin": 3.035,
                        "optimalScore": 0
                    },
                    {
                        "height": 0,
                        "period": 0,
                        "impact": 0,
                        "power": 0,
                        "direction": 0,
                        "directionMin": 0,
                        "optimalScore": 0
                    },
                    {
                        "height": 0.32,
                        "period": 6,
                        "impact": 0.9309,
                        "power": 7.1214,
                        "direction": 293.25,
                        "directionMin": 288.61,
                        "optimalScore": 0
                    },
                    {
                        "height": 0,
                        "period": 0,
                        "impact": 0,
                        "power": 0,
                        "direction": 0,
                        "directionMin": 0,
                        "optimalScore": 0
                    },
                    {
                        "height": 0,
                        "period": 0,
                        "impact": 0,
                        "power": 0,
                        "direction": 0,
                        "directionMin": 0,
                        "optimalScore": 0
                    },
                    {
                        "height": 0,
                        "period": 0,
                        "impact": 0,
                        "power": 0,
                        "direction": 0,
                        "directionMin": 0,
                        "optimalScore": 0
                    }
                ]
            },
            {
                "timestamp": 1699113600,
                "probability": 100,
                "utcOffset": 2,
                "surf": {
                    "min": 0,
                    "max": 0.3,
                    "optimalScore": 0,
                    "plus": false,
                    "humanRelation": "Shin to knee",
                    "raw": {
                        "min": 0.14795,
                        "max": 0.23118
                    }
                },
                "power": 6.8893,
                "swells": [
                    {
                        "height": 0.62,
                        "period": 4,
                        "impact": 0.3045,
                        "power": 2.81384,
                        "direction": 10.96,
                        "directionMin": -2.6949999999999985,
                        "optimalScore": 0
                    },
                    {
                        "height": 0,
                        "period": 0,
                        "impact": 0,
                        "power": 0,
                        "direction": 0,
                        "directionMin": 0,
                        "optimalScore": 0
                    },
                    {
                        "height": 0.3,
                        "period": 6,
                        "impact": 0.6955,
                        "power": 4.07546,
                        "direction": 293.16,
                        "directionMin": 288.83000000000004,
                        "optimalScore": 0
                    },
                    {
                        "height": 0,
                        "period": 0,
                        "impact": 0,
                        "power": 0,
                        "direction": 0,
                        "directionMin": 0,
                        "optimalScore": 0
                    },
                    {
                        "height": 0,
                        "period": 0,
                        "impact": 0,
                        "power": 0,
                        "direction": 0,
                        "directionMin": 0,
                        "optimalScore": 0
                    },
                    {
                        "height": 0,
                        "period": 0,
                        "impact": 0,
                        "power": 0,
                        "direction": 0,
                        "directionMin": 0,
                        "optimalScore": 0
                    }
                ]
            }
        ]
    },
    "permissions": {
        "data": [],
        "violations": [
            {
                "code": 4001,
                "message": "User does not have optional permission:sl_premium-forecasts",
                "permission": {
                    "name": "sl_premium-forecasts",
                    "required": false
                }
            },
            {
                "code": 4001,
                "message": "User does not have optional permission:sl_premium-cams",
                "permission": {
                    "name": "sl_premium-cams",
                    "required": false
                }
            }
        ]
    }
}
 */
