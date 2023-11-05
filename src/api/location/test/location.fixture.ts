import { SearchResult } from "../../../surfline/types";

export const LOCATIONS: SearchResult[] = [
  {
    took: 2,
    timed_out: false,
    _shards: {
      total: 5,
      successful: 5,
      failed: 0,
    },
    hits: {
      total: 2,
      max_score: 15.416145,
      hits: [
        {
          _index: "spots",
          _type: "spot",
          _id: "595579ac31d48a00128db928",
          _score: 15.416145,
          _source: {
            breadCrumbs: ["Israel", "Tel Aviv"],
            name: "Maaravi",
            cams: [],
            location: {
              lon: 34.75484,
              lat: 32.0561359538,
            },
            href: "https://www.surfline.com/surf-report/maaravi/595579ac31d48a00128db928",
          },
        },
        {
          _index: "spots",
          _type: "spot",
          _id: "640b96db606c454994f30ecb",
          _score: 2.9317522e-28,
          _source: {
            breadCrumbs: ["Netherlands", "North Holland", "Gemeente Schagen"],
            name: "Sint Maartenszee",
            location: {
              lon: 4.6712,
              lat: 52.7966,
            },
            cams: [],
            href: "https://www.surfline.com/surf-report/sint-maartenszee/640b96db606c454994f30ecb",
          },
        },
      ],
    },
    suggest: {
      "spot-suggest": [
        {
          text: "maar",
          offset: 0,
          length: 4,
          options: [
            {
              text: "Maagan Michael",
              _index: "spots",
              _type: "spot",
              _id: "640a667199dd4438060c8edf",
              _score: 5,
              _source: {
                breadCrumbs: ["Israel", "Haifa"],
                name: "Maagan Michael",
                location: {
                  lon: 34.9068,
                  lat: 32.5581,
                },
                cams: [],
                href: "https://www.surfline.com/surf-report/maagan-michael/640a667199dd4438060c8edf",
              },
              contexts: {
                type: ["spot"],
                location: ["svb"],
              },
            },
          ],
        },
      ],
    },
    status: 200,
  },
];
